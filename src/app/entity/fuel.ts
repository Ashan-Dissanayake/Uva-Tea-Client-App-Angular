import {Vehicle} from "./vehicle";
import {Fueltype} from "./fueltype";
import {Employee} from "./employee";
import {Fuelstation} from "./fuelstation";

export class Fuel {

  public id !: number;
  public date !: string;
  public qty !: number;
  public cost !: number;
  public meterreading !: number;
  public time !: string;
  public vehicle !: Vehicle;
  public fueltype !: Fueltype;
  public driveronduty !: Employee;
  public fuelstation !: Fuelstation;

  constructor(id:number, date:string,qty:number,cost:number,meterreading:number,
              time:string,vehicle:Vehicle,fueltype:Fueltype,
              driveronduty:Employee,fuelstation:Fuelstation
  ) {
    this.id = id;
    this.date = date;
    this.qty = qty;
    this.cost = cost;
    this.meterreading = meterreading;
    this.time = time;
    this.vehicle = vehicle;
    this.fueltype = fueltype;
    this.driveronduty = driveronduty;
    this.fuelstation = fuelstation;

  }



}
