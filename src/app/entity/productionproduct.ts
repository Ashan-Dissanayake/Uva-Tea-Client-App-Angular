
import {Product} from "./product";

export class Productionproduct {

  public id !: number;
  public quantity !: number;
  public product !: Product;

  constructor(id: number,product:Product, quantity: number) {
    this.id = id;
    this.quantity = quantity;
    this.product = product;
  }

}
