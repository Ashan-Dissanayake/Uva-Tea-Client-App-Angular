import {Productionorder} from "./Productionorder";
import {Productionproduct} from "./productionproduct";

export class Production {

  public id !: number;
  public date !: string;
  public time !: string;
  public productionorder !: Productionorder;
  public productionproducts !: Array<Productionproduct>;

  constructor(id: number,date:string,time:string,productionorder:Productionorder,productionproducts:Array<Productionproduct>) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.productionorder = productionorder;
    this.productionproducts = productionproducts;
  }

}
