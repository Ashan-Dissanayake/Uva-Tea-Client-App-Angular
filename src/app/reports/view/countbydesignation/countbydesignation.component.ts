import {Component, OnInit, ViewChild} from '@angular/core';
import {CountByDesignation} from "../../entity/countbydesignation";
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../../service/reportservice";

declare var google: any;

@Component({
  selector: 'app-countbydesignation',
  templateUrl: './countbydesignation.component.html',
  styleUrls: ['./countbydesignation.component.css']
})
export class CountbydesignationComponent implements OnInit{

  countbydesignations!:CountByDesignation[];
  data!: MatTableDataSource<CountByDesignation>;

  columns: string[] = ['designation', 'count', 'percentage'];
  headers: string[] = ['Designation', 'Count', 'Percentage'];
  binders: string[] = ['designation', 'count', 'percentage'];

  @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(private rs: ReportService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {

    this.rs.countByDesignation()
      .then((des: CountByDesignation[]) => {
        this.countbydesignations = des;
      }).finally(() => {
      this.loadTable();
      this.loadCharts();
    });

    // this.countbydesignations = [
    //                             {"id":1,"designation":"Director","count":5,"percentage":11.11},
    //                             {"id":2,"designation":"Manager","count":10,"percentage":11.11},
    //                             {"id":3,"designation":"Field-Officer","count":2,"percentage":11.11},
    //                             {"id":4,"designation":"Supervisor","count":4,"percentage":22.22},
    //                             {"id":5,"designation":"Operator","count":2,"percentage":11.11},
    //                             {"id":6,"designation":"Plucker","count":43,"percentage":16.67},
    //                             {"id":7,"designation":"Clark","count":3,"percentage":16.67}
    //                            ];
    //
    // this.loadTable();
    // this.loadCharts();

  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.countbydesignations);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }


  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Designation');
    barData.addColumn('number', 'Count');
    // barData.addColumn('number', 'Percen');

    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'Designation');
    pieData.addColumn('number', 'Count');

    const lineData = new google.visualization.DataTable();
    lineData.addColumn('string', 'Designation');
    lineData.addColumn('number', 'Count');

    this.countbydesignations.forEach((des: CountByDesignation) => {
      barData.addRow([des.designation,des.count]);
      // barData.addRow([des.designation,des.count,des.percentage]);
      pieData.addRow([des.designation, des.count]);
      lineData.addRow([des.designation, des.count]);
    });

    const barOptions = {
      title: 'Designation Count (Bar Chart)',
      subtitle: 'Count of Employees by Designation',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const pieOptions = {
      title: 'Designation Count (Pie Chart)',
      height: 400,
      width: 550
    };

    const lineOptions = {
      title: 'Designation Count (Line Chart)',
      height: 400,
      width: 600
    };

    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);

    const lineChart = new google.visualization.LineChart(this.linechart.nativeElement);
    lineChart.draw(lineData, lineOptions);
  }

}
