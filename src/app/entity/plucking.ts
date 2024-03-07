import {Area} from "./area";
import {Employee} from "./employee";
import {Pluckingsession} from "./pluckingsession";
import {Leaftype} from "./leaftype";

export class Plucking {

  public id !: number;
  public date !: string;
  public time !: string;
  public qty !: number;
  public bonus !: number;
  public area !: Area;
  public empplucker !: Employee;
  public pluckingseesion !: Pluckingsession;
  public leaftype !: Leaftype;
  public empkankani !: Employee;

  constructor(id:number, date:string,time:string,qty:number,bonus:number,
              area:Area,empplucker:Employee,pluckingseesion:Pluckingsession,
              leaftype:Leaftype,empkankani:Employee
  ) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.qty = qty;
    this.bonus = bonus;
    this.area = area;
    this.empplucker = empplucker;
    this.pluckingseesion = pluckingseesion;
    this.leaftype = leaftype;
    this.empkankani = empkankani;
  }



}
