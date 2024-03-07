
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Vehiclestatus} from "../entity/vehiclestatus";
import {Vehicletype} from "../entity/vehicletype";
import {Vehiclemodel} from "../entity/vehiclemodel";
import {Vehiclebrand} from "../entity/vehiclebrand";

@Injectable({
  providedIn: 'root'
})
export class VehiclebrandService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Vehiclebrand>> {
    const vehiclebrands = await this.http.get<Array<Vehiclebrand>>('http://localhost:8080/vehiclebrands/list').toPromise();
    if(vehiclebrands == undefined){
      return [];
    }
    return vehiclebrands;
  }


}
