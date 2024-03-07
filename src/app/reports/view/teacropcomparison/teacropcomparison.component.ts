import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ArrearsByProgram} from "../../entity/arrearsbyprogram";
import {Teacrop} from "../../entity/teacrop";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {AreaTeaQuantity} from "../../entity/areateaquantity";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ReportService} from "../../service/reportservice";

declare var google: any;

@Component({
  selector: 'app-tea-crop-comparison',
  templateUrl: './teacropcomparison.component.html',
  styleUrls: ['./teacropcomparison.component.css']
})
export class TeacropcomparisonComponent implements OnInit {

  teacrops!:Teacrop[];
  teacropup: Array<Teacrop>= [];
  teacropdown: Array<Teacrop>= [];
  data!:MatTableDataSource<Teacrop>;

  responseStasus: string = "";

  public teacropsummary!: FormGroup;

  columns: string[] = ['area','prevtotal','currenttotal','difference','status'];
  headers: string[] = ['Area','Previous Total(kg)','Current Total(kg)','Difference(kg)','Status'];
  binders: string[] = ['area','prevtotal','currenttotal','difference','status'];

  @ViewChild('columnchart', {static: false}) columnchart: any;
  @ViewChild('piechartup', { static: false }) piechartup: any;
  @ViewChild('piechartdown', { static: false }) piechartdown: any;

  constructor(
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private rs: ReportService,
  ) {

    this.teacropsummary = this.fb.group({
      "pastdate":new FormControl('',[Validators.required]),
      "presentdate":new FormControl('',[Validators.required]),
    });


  }

  ngOnInit(): void {

    Object.values(this.teacropsummary.controls).forEach(control => {control.markAsTouched();} );

  }

  btnSearch() {

    if(this.teacropsummary.controls['pastdate'].invalid || this.teacropsummary.controls['presentdate'].invalid) {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors -", message: "Please Enter Two Dates <br> "}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else{

      const teacropsummarydata = this.teacropsummary.getRawValue();

      let pastdate = teacropsummarydata.pastdate;
      let presentdate = teacropsummarydata.presentdate;

      if(pastdate!=null) { pastdate = this.dp.transform(new Date(pastdate),'yyyy-MM-dd') ;}
      if(presentdate!=null) { presentdate = this.dp.transform(new Date(presentdate),'yyyy-MM-dd') ;}

      let query = "";

      if(pastdate!= null)  query = query + "&pastdate=" + pastdate;
      if(presentdate!= null)  query = query + "&presentdate=" + presentdate;

      if(query!="") query = query.replace(/^./,"?");

      this.teacropup = [];
      this.teacropdown = [];

      this.rs.teaCropSummary(query).then( (teacrop:Teacrop[])=> {
        console.log(teacrop);

        if(teacrop.length==0) this.responseStasus = "Selected Dates Have No Record";
        else this.responseStasus = "";

        this.teacrops = teacrop;
      }).finally( ()=> {

        this.teacrops.forEach( (teacr:Teacrop)=> {
          if(teacr.status =='upgrade') this.teacropup.push(teacr);
          else if (teacr.status =='downgrade') {  this.teacropdown.push(teacr);}

        });

        this.loadTable();
        this.loadCharts();

      });

    }

  }

  loadTable(): void {
    // console.log(this.teacropsoriginal);
    this.data = new MatTableDataSource(this.teacrops);
  }

  loadCharts(): void {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }


  drawCharts() {
    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Area');
    barData.addColumn('number', 'Prev Total');
    barData.addColumn('number', 'Current Total');


    const pieDataUp = new google.visualization.DataTable();
    pieDataUp.addColumn('string', 'Area');
    pieDataUp.addColumn('number', 'Difference');

    const pieDataDown = new google.visualization.DataTable();
    pieDataDown.addColumn('string', 'Area');
    pieDataDown.addColumn('number', 'Difference');


    this.teacrops.forEach((teacrop: Teacrop) => {

      barData.addRow([teacrop.area, teacrop.prevtotal, teacrop.currenttotal]);
    });

    this.teacropup.forEach( (teacropup: Teacrop) => {
      pieDataUp.addRow([teacropup.area,teacropup.difference]);
    });

    this.teacropdown.forEach( (teacropdown: Teacrop) => {
      pieDataDown.addRow([teacropdown.area,teacropdown.difference*-1]);
    });

    const barOptions = {
      title: 'Tea Crop Summary (Bar Chart)',
      bars: 'vertical',
      height: 400,
      width: 800,
    };

    const pieOptions = {
      title: 'Tea Crop Summary (Pie Chart)',
      height: 400,
      width: 550,
    };

    const columnChart = new google.visualization.ColumnChart(this.columnchart.nativeElement);
    columnChart.draw(barData, barOptions);

    const pieChartUp = new google.visualization.PieChart(this.piechartup.nativeElement);
    pieChartUp.draw(pieDataUp, pieOptions);

    const pieChartDown = new google.visualization.PieChart(this.piechartdown.nativeElement);
    pieChartDown.draw(pieDataDown, pieOptions);



    }


  }


