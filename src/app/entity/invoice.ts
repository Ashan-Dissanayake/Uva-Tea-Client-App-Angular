
import {Orderr} from "./orderr";
import {Invoicestatus} from "./invoicestatus";
import {Employee} from "./employee";
import {Invoiceproduct} from "./invoiceproduct";

export class Invoice {

  public id !: number;
  public name !: string;
  public date !: string;
  public grandtotal !: number;
  public orderr !: Orderr;
  public invoicestatus !: Invoicestatus;
  public manager !: Employee;
  public invoiceproducts !: Array<Invoiceproduct>;

  constructor(id: number, name: string, date:string,grandtotal:number,orderr:Orderr,
              invoicestatus: Invoicestatus,manager:Employee,invoiceproducts:Array<Invoiceproduct>) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.grandtotal = grandtotal;
    this.orderr = orderr;
    this.invoicestatus = invoicestatus;
    this.manager = manager;
    this.invoiceproducts = invoiceproducts;
  }

}
