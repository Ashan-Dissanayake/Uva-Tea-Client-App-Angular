import {Employee} from "./employee";
import {Activitytype} from "./activitytype";

export class Activity {

  public id !: number;
  public date !: string;
  public time !: string;
  public approver !: Employee;
  public activitytype !: Activitytype;

  constructor(id: number, date: string,time:string,approver:Employee,activitytype:Activitytype) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.approver = approver;
    this.activitytype = activitytype;
  }

}
