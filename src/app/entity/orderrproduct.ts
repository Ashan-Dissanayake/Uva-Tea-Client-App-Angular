
import {Product} from "./product";

export class Orderrproduct {

  public id !: number;
  public qty !: number;
  public linetotal !: number;
  public product !: Product;

  constructor(id: number,product:Product, qty: number,linetotal:number) {
    this.id = id;
    this.qty = qty;
    this.product = product;
    this.linetotal = linetotal;
  }

}
