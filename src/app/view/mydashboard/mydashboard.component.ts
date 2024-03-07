import {Component, OnInit} from '@angular/core';
import {ReportService} from "../../reports/service/reportservice";
import {Fertilizerremaining} from "../../reports/entity/fertilizerremaining";
import {ActivityService} from "../../service/activityservice";
import {Activity} from "../../entity/activity";
import {MatTableDataSource} from "@angular/material/table";
import {UiAssist} from "../../util/ui/ui.assist";

@Component({
  selector: 'app-mydashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.css']
})
export class MydashboardComponent implements OnInit{

  columns: string[] = ['date','time','activity'];
  headers: string[] = ['Date', 'Time', 'Activity'];
  binders: string[] = ['date', 'time', 'activitytype.name'];

  u709: number = 0;
  u711: number = 0;
  u716: number = 0;
  u718: number = 0;
  u720: number = 0;
  u724: number = 0;
  t200: number = 0;
  t750: number = 0;
  u721: number = 0;
  dolamite: number = 0;

  fertilizerremains: Array<Fertilizerremaining> = [];
  activities: Array<Activity> = [];
  data!: MatTableDataSource<Activity>;

  uiassist: UiAssist;

  constructor(
        private rs: ReportService,
        private as: ActivityService,
  ){

    this.uiassist = new UiAssist(this);

  }

  ngOnInit(): void {
    this.initialize()
  }

  initialize() {

    this.loadfertlizerqty();
    this.loadupcomingtable();

  }

  loadupcomingtable() {

    this.as.getupcomevt().then( (activts:Activity[])=> {
      this.activities = activts;
      console.log("Acti "+this.activities)
    } ).finally( ()=> {
      this.data = new MatTableDataSource(this.activities);

    })
  }

  loadfertlizerqty() {

    this.rs.getfertilizereamining().then( (ferreamins:Fertilizerremaining[])=>{
      this.fertilizerremains = ferreamins;
      // console.log(this.fertilizerremains);
    } ).finally( ()=> {
      this.fertilizerremains.forEach( (fertilizerre:Fertilizerremaining)=>{

        if(fertilizerre.area == "U-709")  this.u709 = fertilizerre.total;
        if(fertilizerre.area == "U-711")  this.u711 = fertilizerre.total;
        if(fertilizerre.area == "U-716")  this.u716 = fertilizerre.total;
        if(fertilizerre.area == "U-718")  this.u718 = fertilizerre.total;
        if(fertilizerre.area == "U-720")  this.u720 = fertilizerre.total;
        if(fertilizerre.area == "U-724")  this.u724 = fertilizerre.total;
        if(fertilizerre.area == "T-200")  this.t200 = fertilizerre.total;
        if(fertilizerre.area == "T-750")  this.t750 = fertilizerre.total;
        if(fertilizerre.area == "U-721")  this.u721 = fertilizerre.total;
        if(fertilizerre.area == "D-Dolamite")  this.dolamite = fertilizerre.total;

      } )
    } );

  }




}
