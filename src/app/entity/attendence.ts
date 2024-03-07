
import {Attendstatus} from "./attendstatus";
import {Employee} from "./employee";

export class Attendence {

  public id !: number;
  public date !: string;
  public time !: string;
  public attendstatus !: Attendstatus;
  public employee !: Employee;

  constructor(id:number, date:string,time:string,attendstatus:Attendstatus,employee:Employee,
  ) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.attendstatus = attendstatus;
    this.employee = employee;

  }



}
