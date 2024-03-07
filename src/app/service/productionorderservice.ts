import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productionorder} from "../entity/Productionorder";

@Injectable({
  providedIn: 'root'
})
export class ProductionorderService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Productionorder>> {
    const oroductionorders = await this.http.get<Array<Productionorder>>('http://localhost:8080/productionorders'+query).toPromise();
    if(oroductionorders == undefined){
      return [];
    }
    return oroductionorders;
  }

  async add(productionorder:Productionorder): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/productionorders', productionorder).toPromise();
  }

  async update(productionorder:Productionorder): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/productionorders', productionorder).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/productionorders/' + id).toPromise();
  }



}
