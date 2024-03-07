import {Component, OnInit, ViewChild} from '@angular/core';
import {Teacrop} from "../../entity/teacrop";
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ReportService} from "../../service/reportservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Fertilizerdistributionsummary} from "../../entity/fertilizerdistributionsummary";

declare var google: any;

@Component({
  selector: 'app-fertilizerdistrisummary',
  templateUrl: './fertilizerdistrisummary.component.html',
  styleUrls: ['./fertilizerdistrisummary.component.css']
})
export class FertilizerdistrisummaryComponent implements OnInit{

  fertilizerdissummarys!:Fertilizerdistributionsummary[];
  data!:MatTableDataSource<Fertilizerdistributionsummary>;

  public fertilizerdistribution!: FormGroup;

  columns: string[] = ['area','prevyear','currentyear'];
  headers: string[] = ['Area','Previous Year Total(kg)','Present Year Total(kg)'];
  binders: string[] = ['area','prevyear','currentyear'];

  @ViewChild('columnchart', {static: false}) columnchart: any;
  @ViewChild('piechart1', { static: false }) piechart1: any;
  @ViewChild('piechart2', { static: false }) piechart2: any;

  responseStasus: string = "";

  constructor(
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private rs: ReportService,
  ) {

    this.fertilizerdistribution = this.fb.group({
      "pastyear":new FormControl('',[Validators.required]),
      "presentyear":new FormControl('',[Validators.required]),
    });


  }

  ngOnInit(): void {

    Object.values(this.fertilizerdistribution.controls).forEach(control => {control.markAsTouched();} );

  }

  btnSearch() {

    if(this.fertilizerdistribution.controls['pastyear'].invalid || this.fertilizerdistribution.controls['presentyear'].invalid) {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors -", message: "Please Enter Two Years <br> "}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else{

      const fertilizerdistributionsummarydata = this.fertilizerdistribution.getRawValue();

      let pastyear = fertilizerdistributionsummarydata.pastyear;
      let presentyear = fertilizerdistributionsummarydata.presentyear;

      if(pastyear!=null) { pastyear = this.dp.transform(new Date(pastyear),'yyyy-MM-dd') ;}
      if(presentyear!=null) { presentyear = this.dp.transform(new Date(presentyear),'yyyy-MM-dd') ;}

      let query = "";

      if(pastyear!= null)  query = query + "&pastyear=" + pastyear;
      if(presentyear!= null)  query = query + "&presentyear=" + presentyear;

      if(query!="") query = query.replace(/^./,"?");

      this.rs.ferdissummary(query).then( (ferdissumrys:Fertilizerdistributionsummary[])=> {

        if(ferdissumrys.length==0) this.responseStasus = "Selected Years Have No Record";
        else this.responseStasus = "";

        this.fertilizerdissummarys = ferdissumrys;
      }).finally( ()=> {

        this.loadTable();
        this.loadCharts();

      });

    }

  }

  loadTable(): void {
    this.data = new MatTableDataSource(this.fertilizerdissummarys);
  }

  loadCharts(): void {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }


  drawCharts() {
    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Area');
    barData.addColumn('number', 'Previous Year Total');
    barData.addColumn('number', 'Current Year Total');


    const pieData1 = new google.visualization.DataTable();
    pieData1.addColumn('string', 'Area');
    pieData1.addColumn('number', 'Prevyear');

    const pieData2 = new google.visualization.DataTable();
    pieData2.addColumn('string', 'Area');
    pieData2.addColumn('number', 'Currentyear');


    this.fertilizerdissummarys.forEach((ferdissumarys: Fertilizerdistributionsummary) => {

      barData.addRow([ferdissumarys.area, ferdissumarys.prevyear, ferdissumarys.currentyear]);
      pieData1.addRow([ferdissumarys.area, ferdissumarys.prevyear]);
      pieData2.addRow([ferdissumarys.area, ferdissumarys.currentyear]);
    });

    const barOptions = {
      title: 'Fertilizer Distribution Summary (Bar Chart)',
      bars: 'vertical',
      height: 400,
      width: 800,
    };

    const pieOptions = {
      title: 'Fertilizer Distribution Summary (Pie Chart)',
      height: 400,
      width: 550,
    };

    const columnChart = new google.visualization.ColumnChart(this.columnchart.nativeElement);
    columnChart.draw(barData, barOptions);

    const pieChart1 = new google.visualization.PieChart(this.piechart1.nativeElement);
    pieChart1.draw(pieData1, pieOptions);

    const pieChart2 = new google.visualization.PieChart(this.piechart2.nativeElement);
    pieChart2.draw(pieData2, pieOptions);



  }


}
