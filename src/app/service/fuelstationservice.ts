
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fueltype} from "../entity/fueltype";
import {Fuelstation} from "../entity/fuelstation";

@Injectable({
  providedIn: 'root'
})
export class FuelstationService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Fuelstation>> {
   const fuelstations = await this.http.get<Array<Fuelstation>>('http://localhost:8080/fuelstations/list').toPromise();
   if(fuelstations == undefined) {
     return[];
   }
   return fuelstations;
  }


}
