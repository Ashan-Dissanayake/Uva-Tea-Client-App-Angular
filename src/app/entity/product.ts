export class Product {

  public id !: number;
  public name !: string;
  public unitprice !: number;
  public qtyonhand !: number;

  constructor(id: number, name: string, unitprice:number, qtyonhand:number ) {
    this.id = id;
    this.name = name;
    this.unitprice = unitprice;
    this.qtyonhand = qtyonhand;
  }

}
