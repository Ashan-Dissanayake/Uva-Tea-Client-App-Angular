import {Fertilizerbrand} from "./fertilizerbrand";
import {Fertilizertype} from "./fertilizertype";
import {Fertilizerstatus} from "./fertilizerstatus";

export class Fertilizer {

  public id !: number;
  public name !: string;
  public quantity !: number;
  public unitprice !: number;
  public rop !: number;
  public dointroduced !: string;
  public fertilzerbrand !: Fertilizerbrand;
  public fertilizertype !: Fertilizertype;
  public fertilizerstatus !: Fertilizerstatus;

  constructor(id:number, name:string,quantity:number,unitprice:number,rop:number,
              dointroduced:string,fertilzerbrand:Fertilizerbrand,fertilizertype:Fertilizertype,
              fertilizerstatus:Fertilizerstatus
  ) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.unitprice = unitprice;
    this.rop = rop;
    this.dointroduced = dointroduced;
    this.fertilzerbrand = fertilzerbrand;
    this.fertilizertype = fertilizertype;
    this.fertilizerstatus = fertilizerstatus;

  }



}
