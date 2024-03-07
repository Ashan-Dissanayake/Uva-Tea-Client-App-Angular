import {Designation} from "../entity/designation";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porder} from "../entity/porder";
import {Porderstatus} from "../entity/porderstatus";
import {Orderstatus} from "../entity/orderstatus";

@Injectable({
  providedIn: 'root'
})
export class Orderstatusservice {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Orderstatus>> {
    const orderstatuss = await this.http.get<Array<Orderstatus>>('http://localhost:8080/orderstatuss/list').toPromise();
    if(orderstatuss == undefined){
      return [];
    }
    return orderstatuss;
  }


}
