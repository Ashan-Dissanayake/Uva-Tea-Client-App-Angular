import {Vehiclebrand} from "./vehiclebrand";

export class Vehiclemodel {

  public id !: number;
  public name !: string;
  public vehiclebrand !: Vehiclebrand;


  constructor(id: number, name: string,vehiclebrand:Vehiclebrand) {
    this.id = id;
    this.name = name;
    this.vehiclebrand = vehiclebrand;
  }

}
