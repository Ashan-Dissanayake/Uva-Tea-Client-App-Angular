
import {Area} from "./area";
import {Fertilizer} from "./fertilizer";
import {Fertilizerdistributionstate} from "./fertilizerdistributionstate";
import {Employee} from "./employee";

export class Fertilizerdistribution {

  public id !: number;
  public quantitydis !: number;
  public date !: string;
  public area !: Area;
  public fertilizer !: Fertilizer;
  public ferdistributionstate !: Fertilizerdistributionstate;
  public kankani !: Employee;

  constructor(id:number, quantitydis:number,date:string,area:Area,fertilizer:Fertilizer,
              ferdistributionstate:Fertilizerdistributionstate,kankani:Employee

  ) {
    this.id = id;
    this.quantitydis = quantitydis;
    this.area = area;
    this.fertilizer = fertilizer;
    this.ferdistributionstate = ferdistributionstate;
    this.kankani = kankani;
  }



}
