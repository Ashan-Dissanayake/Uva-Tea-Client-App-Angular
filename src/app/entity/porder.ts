import {Porderstatus} from "./porderstatus";
import {Supplier} from "./supplier";
import {Porderfertilizer} from "./porderfertilizer";

export class Porder {

  public id !: number;
  public doplaced !: string;
  public costexpected !: number;
  public porderstatus !: Porderstatus;
  public supplier !: Supplier;
  public porderfertilizers !: Array<Porderfertilizer>;

  constructor(id: number, doplaced: string,costexpected:number,porderstatus:Porderstatus,supplier:Supplier,porderfertilizers:Array<Porderfertilizer>) {
    this.id = id;
    this.doplaced = doplaced;
    this.costexpected = costexpected;
    this.porderstatus = porderstatus;
    this.supplier = supplier;
    this.porderfertilizers = porderfertilizers;
  }

}
