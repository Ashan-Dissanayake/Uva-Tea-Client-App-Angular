import {Component, OnInit, ViewChild} from '@angular/core';
import {CountOfAreasByRoot} from "../../entity/countofareasbyroot";
import {MatTableDataSource} from "@angular/material/table";
import {CountByDesignation} from "../../entity/countbydesignation";
import {ReportService} from "../../service/reportservice";

declare var google: any;

@Component({
  selector: 'app-countareabyroot',
  templateUrl: './countareabyroot.component.html',
  styleUrls: ['./countareabyroot.component.css']
})
export class CountareabyrootComponent implements OnInit{

  countofareasbytroot!:CountOfAreasByRoot[];
  data!:MatTableDataSource<CountOfAreasByRoot>

  columns: string[] = ['area', 'count', 'percentage'];
  headers: string[] = ['Area', 'Count', 'Percentage'];
  binders: string[] = ['area', 'count', 'percentage'];

  // @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;
  @ViewChild('columnchart', { static: false }) columnchart: any;

  constructor(private rs: ReportService) {
  }

  ngOnInit(): void {

    // this.countofareasbytroot = [
    //                             {"id":1,"division":"Maligathanna","count":5,"percentage":11.11},
    //                             {"id":2,"division":"Maliththa","count":10,"percentage":15.11},
    //                             {"id":3,"division":"Batawala","count":15,"percentage":25.11},
    //                             {"id":4,"division":"Diyawunnawa","count":9,"percentage":55.22}
    //                            ];

    this.rs.countByArea()
      .then( (areasbyroot: CountOfAreasByRoot[]) => {
        this.countofareasbytroot = areasbyroot;
      }).finally( ()=> {
      this.loadTable();
      this.loadCharts();
    });

  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.countofareasbytroot);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Area');
    barData.addColumn('number', 'Count');
    // barData.addColumn('number', 'Percentage');


    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'Area');
    pieData.addColumn('number', 'Count');

    const lineData = new google.visualization.DataTable();
    lineData.addColumn('string', 'Area');
    lineData.addColumn('number', 'Count');

    this.countofareasbytroot.forEach((root: CountOfAreasByRoot) => {
      barData.addRow([root.area,root.count]);
      // barData.addRow([des.designation,des.count,des.percentage]);
      pieData.addRow([root.area,root.count]);
      lineData.addRow([root.area,root.count]);
    });

    const barOptions = {
      title: 'Area Count (Column Chart)',
      subtitle: 'Count of Areas by Division',
      bars: 'horizontal',
      height: 300,
      width: 600
    };

    const pieOptions = {
      title: 'Area Count (Pie Chart)',
      height: 400,
      width: 550
    };

    const lineOptions = {
      title: 'Area Count (Line Chart)',
      height: 400,
      width: 600
    };

    const columnChart = new google.visualization.ColumnChart(this.columnchart.nativeElement);
    columnChart.draw(barData, barOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);

    const lineChart = new google.visualization.LineChart(this.linechart.nativeElement);
    lineChart.draw(lineData, lineOptions);
  }


}
