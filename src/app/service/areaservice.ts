
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Area} from "../entity/area";
import {Employee} from "../entity/employee";

@Injectable({
  providedIn: 'root'
})
export class Areaservice {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Area>> {
    const areas = await this.http.get<Array<Area>>('http://localhost:8080/areas'+query).toPromise();
    if(areas == undefined){
      return [];
    }
    return areas;
  }

  async add(area:Area): Promise<[]|undefined> {
    return  this.http.post<[]>('http://localhost:8080/areas', area).toPromise();
  }

  async update(area:Area): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/areas', area).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/areas/' + id).toPromise();
  }


}
