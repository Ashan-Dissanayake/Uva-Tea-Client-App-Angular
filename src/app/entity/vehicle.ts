
import {Vehiclemodel} from "./vehiclemodel";
import {Vehicletype} from "./vehicletype";
import {Vehiclestatus} from "./vehiclestatus";
import {Vehiclebrand} from "./vehiclebrand";

export class Vehicle {

  public id !: number;
  public doattach !: string;
  public number !: string;
  public yom !: number;
  public lastmeterreading !: number;
  public capacity !: number;
  public description !: string;
  public vehiclemodel !: Vehiclemodel;
  public vehicletype !: Vehicletype;
  public vehiclestatus !: Vehiclestatus;

  public vehiclebrand!: Vehiclebrand;

  constructor(id:number, doattach:string,number:string,yom:number,lastmeterreading:number,
              capacity:number,description:string,vehiclemodel:Vehiclemodel,
              vehicletype:Vehicletype,vehiclestatus:Vehiclestatus, vehiclebrand:Vehiclebrand
  ) {
    this.id = id;
    this.doattach = doattach;
    this.number = number;
    this.yom = yom;
    this.capacity = capacity;
    this.lastmeterreading = lastmeterreading;
    this.description = description;
    this.vehiclemodel = vehiclemodel;
    this.vehicletype = vehicletype;
    this.vehiclestatus = vehiclestatus;

    this.vehiclebrand = vehiclebrand;

  }



}
