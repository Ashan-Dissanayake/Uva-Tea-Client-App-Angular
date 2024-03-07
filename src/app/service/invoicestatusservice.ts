import {Designation} from "../entity/designation";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porder} from "../entity/porder";
import {Porderstatus} from "../entity/porderstatus";
import {Orderstatus} from "../entity/orderstatus";
import {Invoicestatus} from "../entity/invoicestatus";

@Injectable({
  providedIn: 'root'
})
export class Invoicestatusservice {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Invoicestatus>> {
    const invoicestatuss = await this.http.get<Array<Invoicestatus>>('http://localhost:8080/invoicestatuss/list').toPromise();
    if(invoicestatuss == undefined){
      return [];
    }
    return invoicestatuss;
  }


}
