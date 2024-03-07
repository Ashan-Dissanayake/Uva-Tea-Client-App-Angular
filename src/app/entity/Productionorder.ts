import {Area} from "./area";
import {Productionorderstatus} from "./productionorderstatus";
import {Employee} from "./employee";

export class Productionorder {

  public id !: number;
  public date !: string;
  public time !: string;
  public quantity !: number;
  public humidity !: number;
  public description !: string;
  public area !: Area;
  public productionorderstatus !: Productionorderstatus;
  public teamaker !: Employee;

  constructor(id:number, date:string,time:string,quantity:number,humidity:number,
              description:string,area:Area,productionorderstatus:Productionorderstatus,
              teamaker:Employee
  ) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.quantity = quantity;
    this.humidity = humidity;
    this.description = description;
    this.area = area;
    this.productionorderstatus = productionorderstatus;
    this.teamaker = teamaker;

  }



}
