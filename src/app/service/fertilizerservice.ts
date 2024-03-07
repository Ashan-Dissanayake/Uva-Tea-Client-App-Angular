import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fertilizer} from "../entity/fertilizer";

@Injectable({
  providedIn: 'root'
})
export class FertilizerService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Fertilizer>> {
    const fertilizers = await this.http.get<Array<Fertilizer>>('http://localhost:8080/fertilizers'+query).toPromise();
    if(fertilizers == undefined){
      return [];
    }
    return fertilizers;
  }

  async add(fertilizer:Fertilizer): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/fertilizers', fertilizer).toPromise();
  }

  async update(fertilizer:Fertilizer): Promise<[]|undefined> {
   return  this.http.put<[]>('http://localhost:8080/fertilizers',fertilizer).toPromise();

  }

   async delete(id:number): Promise<[]|undefined> {
   return this.http.delete<[]>('http://localhost:8080/fertilizers/'+id).toPromise();
  }

  // async delete(id:number): Promise<[]|undefined> {
  //   return  this.http.delete<[]>('http://localhost:8080/employees/' + id).toPromise();
  // }


  // async getKankanis(): Promise<Array<Employee>> {
  //   const kankanis = await this.http.get<Array<Employee>>('http://localhost:8080/employees/bykankani').toPromise();
  //   if (kankanis == undefined) {
  //     return [];
  //   }
  //   return kankanis;
  // }



}
