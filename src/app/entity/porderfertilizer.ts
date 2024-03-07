import {Fertilizer} from "./fertilizer";

export class Porderfertilizer {

  public id !: number;
  public qty !: number;
  public linecost !: number;
  public fertilizer !: Fertilizer;

  constructor(id: number,fertilizer:Fertilizer, qty: number,linecost:number) {
    this.id = id;
    this.qty = qty;
    this.linecost = linecost;
    this.fertilizer = fertilizer;
  }

}
