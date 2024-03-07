import {Vehicle} from "./vehicle";
import {Root} from "./root";
import {Employee} from "./employee";
import {Transportstatus} from "./transportstatus";
import {Transportpurpose} from "./transportpurpose";

export class Transport {

  public id !: number;
  public date !: string;
  public startreading !: number;
  public endreading !: number;
  public description !: string;
  public strattime !: string;
  public endtime !: string;
  public vehicle !: Vehicle;
  public root !: Root;
  public driver !: Employee;
  public transportstatus !: Transportstatus;
  public transportpurpose !: Transportpurpose;

  constructor(id:number, date:string,startreading:number,endreading:number,description:string,
              strattime:string,endtime:string,vehicle:Vehicle,root:Root,driver:Employee,transportstatus:Transportstatus,
              transportpurpose:Transportpurpose
  ) {
    this.id = id;
    this.date = date;
    this.startreading = startreading;
    this.endreading = endreading;
    this.description = description;
    this.strattime = strattime;
    this.endtime = endtime;
    this.vehicle = vehicle;
    this.root = root;
    this.driver = driver;
    this.transportstatus = transportstatus;
    this.transportpurpose = transportpurpose;



  }



}
