
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fuel} from "../entity/fuel";
import {Vehicle} from "../entity/vehicle";
import {Employee} from "../entity/employee";

@Injectable({
  providedIn: 'root'
})
export class FuelService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Fuel>> {
    const fuels = await this.http.get<Array<Fuel>>('http://localhost:8080/fuels'+query).toPromise();
    if(fuels == undefined){
      return [];
    }
    return fuels;
  }

  async add(fuel:Fuel): Promise<[]|undefined> {
    return  this.http.post<[]>('http://localhost:8080/fuels', fuel).toPromise();
  }

  async update(fuel:Fuel): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/fuels', fuel).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/fuels/' + id).toPromise();
  }


}
