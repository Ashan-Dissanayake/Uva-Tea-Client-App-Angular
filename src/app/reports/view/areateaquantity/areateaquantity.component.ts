import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {AreaTeaQuantity} from "../../entity/areateaquantity";
import {ReportService} from "../../service/reportservice";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {Teacrop} from "../../entity/teacrop";
import {MatPaginator} from "@angular/material/paginator";

declare var google: any;

@Component({
  selector: 'app-areateaquantity',
  templateUrl: './areateaquantity.component.html',
  styleUrls: ['./areateaquantity.component.css']
})
export class AreateaquantityComponent implements OnInit{

  columns:string[] = ['code','date','teaTotal','percentage'];
  headers:string[] =['Code','Date','TeaTotal','Percentage'];
  binders:string[] =['code','date','teaTotal','percentage'];

  @ViewChild('columnchart', {static: false}) columnchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;

  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  public areaQuantity!: FormGroup;

  data!: MatTableDataSource<AreaTeaQuantity>

  areateaquantitys!:AreaTeaQuantity[];
  responseStasus: string = "";

  constructor(private rs: ReportService,
              private fb: FormBuilder,
              private dg: MatDialog,
              private dp: DatePipe,
  ) {

    this.areaQuantity = this.fb.group({
      "sdate":new FormControl('',[Validators.required]),
    });


  }

  ngOnInit(): void {

    this.areaQuantity.controls['sdate'].markAsTouched();

  }

  btnSearch() {

    if(this.areaQuantity.controls['sdate'].invalid) {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors -", message: "Please Enter a Date <br> "}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else{

      const seachdate = this.areaQuantity.getRawValue();

      let date = seachdate.sdate;

      if(date!=null) { date = this.dp.transform(new Date(date),'yyyy-MM-dd') ;}

      let query = "";

      if(date!= null) { query = query + "?sdate=" + date; }

      if(query!="") query = query.replace(/^./,"?");

      this.rs.areaTeaquantity(query).then( (areateaqun:AreaTeaQuantity[])=> {


        if(areateaqun.length==0) this.responseStasus = "Selected Date Have No Record";
        else this.responseStasus = "";

        this.areateaquantitys = areateaqun;
      }).finally( ()=> {
        // console.log(this.areateaquantitys);
        this.loadTable();
        this.loadCharts();
      });

    }
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.areateaquantitys);
    // this.data.paginator = this.paginator;
  }

  loadCharts(): void {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  drawCharts() {
    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Code');
    barData.addColumn('number', 'TeaTotal');
    barData.addColumn('number', 'Percentage');

    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'Code');
    pieData.addColumn('number', 'TeaTotal');

    this.areateaquantitys.forEach((artequn: AreaTeaQuantity)=> {
      barData.addRow([artequn.code,artequn.teaTotal,artequn.percentage]);
      pieData.addRow([artequn.code,artequn.teaTotal]);
    });


    const barOptions = {
      title: 'Area Tea Crop Summary',
      bars: 'vertical',
      height: 400,
      width: 800,
    };

    const pieOptions = {
      title: 'Area Tea Crop Summary',
      height: 400,
      width: 550,
    };

    const columnChart = new google.visualization.ColumnChart(this.columnchart.nativeElement);
    columnChart.draw(barData, barOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);


  }


}
