
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fueltype} from "../entity/fueltype";

@Injectable({
  providedIn: 'root'
})
export class FueltypeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Fueltype>> {
    const fueltypes = await this.http.get<Array<Fueltype>>('http://localhost:8080/fueltypes/list').toPromise();
    if(fueltypes == undefined){
      return [];
    }
    return fueltypes;
  }


}
