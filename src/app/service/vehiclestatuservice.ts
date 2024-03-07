
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Vehiclestatus} from "../entity/vehiclestatus";

@Injectable({
  providedIn: 'root'
})
export class VehiclestatuService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Vehiclestatus>> {
    const vehiclestatuss = await this.http.get<Array<Vehiclestatus>>('http://localhost:8080/vehiclestatuss/list').toPromise();
    if(vehiclestatuss == undefined){
      return [];
    }
    return vehiclestatuss;
  }


}
