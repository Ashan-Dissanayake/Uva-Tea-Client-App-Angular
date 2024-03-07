import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porder} from "../entity/porder";

@Injectable({
  providedIn: 'root'
})
export class PorderService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Porder>> {
    const porders = await this.http.get<Array<Porder>>('http://localhost:8080/porders'+query).toPromise();
    if(porders == undefined){
      return [];
    }
    return porders;
  }

  async add(porder:Porder): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/porders', porder).toPromise();
  }

  async update(porder:Porder): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/porders', porder).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/porders/' + id).toPromise();
  }




}
