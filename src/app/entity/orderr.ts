import {Distributor} from "./distributor";
import {Orderstatus} from "./orderstatus";
import {Orderrproduct} from "./orderrproduct";

export class Orderr {

  public id !: number;
  public name !: string;
  public doorder !: string;
  public doexpected !: string;
  public expectedgrandtotal !: number;
  public distributor !: Distributor;
  public orderstatus !: Orderstatus;
  public orderrproducts !: Array<Orderrproduct>;

  constructor(id: number, name: string, doorder:string,doexpected:string,expectedgrandtotal:number,
              distributor: Distributor,orderstatus:Orderstatus,orderrproducts:Array<Orderrproduct>) {
    this.id = id;
    this.name = name;
    this.doorder = doorder;
    this.doexpected = doexpected;
    this.expectedgrandtotal = expectedgrandtotal;
    this.distributor = distributor;
    this.orderstatus = orderstatus;
    this.orderrproducts = orderrproducts;
  }

}
