
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Orderr} from "../entity/orderr";
import {Orderrproduct} from "../entity/orderrproduct";

@Injectable({
  providedIn: 'root'
})
export class Orderrservice {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Orderr>> {
    const orderrs = await this.http.get<Array<Orderr>>('http://localhost:8080/orderrs'+query).toPromise();
    if(orderrs == undefined){
      return [];
    }
    return orderrs;
  }

  async add(orderr:Orderr): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/orderrs', orderr).toPromise();
  }

  async update(orderr:Orderr): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/orderrs', orderr).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/orderrs/' + id).toPromise();
  }




}
