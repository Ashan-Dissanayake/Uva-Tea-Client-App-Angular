import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Pluckingpayment} from "../entity/pluckingpayment";

@Injectable({
  providedIn: 'root'
})
export class PluckingpaymentService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Pluckingpayment>> {
    const pluckingpayments = await this.http.get<Array<Pluckingpayment>>('http://localhost:8080/pluckingpayments'+query).toPromise();
    if(pluckingpayments == undefined){
      return [];
    }
    return pluckingpayments;
  }

  async add(pluckingpayment:Pluckingpayment): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/pluckingpayments', pluckingpayment).toPromise();
  }

  async update(pluckingpayment:Pluckingpayment): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/pluckingpayments', pluckingpayment).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/pluckingpayments/' + id).toPromise();
  }


}
