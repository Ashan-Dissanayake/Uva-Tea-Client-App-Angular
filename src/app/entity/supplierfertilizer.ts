import {Supplier} from "./supplier";
import {Fertilizer} from "./fertilizer";

export class Supplierfertilizer {

  // public id !: number;
  // public supplier !: Supplier;
  public fertilizer !: Fertilizer;

  constructor(fertilizer:Fertilizer) {
    this.fertilizer = fertilizer;
  }

  // constructor(id: number, supplier: Supplier,fertilizer:Fertilizer) {
  //   this.id = id;
  //   this.supplier = supplier;
  //   this.fertilizer = fertilizer;
  // }

}
