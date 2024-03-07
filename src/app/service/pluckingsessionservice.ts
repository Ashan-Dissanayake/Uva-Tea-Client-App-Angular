
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Pluckingsession} from "../entity/pluckingsession";

@Injectable({
  providedIn: 'root'
})
export class PluckingsessionService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Pluckingsession>> {
    const pluckingsessions = await this.http.get<Array<Pluckingsession>>('http://localhost:8080/pluckingsessions/list').toPromise();
    if(pluckingsessions == undefined){
      return [];
    }
    return pluckingsessions;
  }


}
