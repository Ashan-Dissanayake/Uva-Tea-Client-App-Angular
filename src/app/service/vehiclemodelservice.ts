
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Vehiclestatus} from "../entity/vehiclestatus";
import {Vehicletype} from "../entity/vehicletype";
import {Vehiclemodel} from "../entity/vehiclemodel";

@Injectable({
  providedIn: 'root'
})
export class VehiclemodelService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Vehiclemodel>> {
    const vehiclemodels = await this.http.get<Array<Vehiclemodel>>('http://localhost:8080/vehiclemodels/list').toPromise();
    if(vehiclemodels == undefined){
      return [];
    }
    return vehiclemodels;
  }

  async getByBrandModels(id:number): Promise<Array<Vehiclemodel>> {
    const vehiclemodels = await this.http.get<Array<Vehiclemodel>>('http://localhost:8080/vehiclemodels/'+id).toPromise();
    if(vehiclemodels == undefined){
      return [];
    }
    return vehiclemodels;
  }


}
