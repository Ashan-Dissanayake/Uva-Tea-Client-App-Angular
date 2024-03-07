
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Vehiclestatus} from "../entity/vehiclestatus";
import {Vehicletype} from "../entity/vehicletype";

@Injectable({
  providedIn: 'root'
})
export class VehicletypeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Vehicletype>> {
    const vehicletypes = await this.http.get<Array<Vehicletype>>('http://localhost:8080/vehicletypes/list').toPromise();
    if(vehicletypes == undefined){
      return [];
    }
    return vehicletypes;
  }


}
