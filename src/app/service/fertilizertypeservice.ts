
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Leaftype} from "../entity/leaftype";
import {Fertilizerbrand} from "../entity/fertilizerbrand";
import {Fertilizertype} from "../entity/fertilizertype";

@Injectable({
  providedIn: 'root'
})
export class FertilizertypeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Fertilizertype>> {
    const fertilizertypes = await this.http.get<Array<Fertilizertype>>('http://localhost:8080/fertilizertypes/list').toPromise();
    if(fertilizertypes == undefined){
      return [];
    }
    return fertilizertypes;
  }


}
