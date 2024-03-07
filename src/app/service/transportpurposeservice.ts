
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Transportpurpose} from "../entity/transportpurpose";

@Injectable({
  providedIn: 'root'
})
export class TransportpurposeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Transportpurpose>> {
    const transpurposes = await this.http.get<Array<Transportpurpose>>('http://localhost:8080/transportpurposes/list').toPromise();
    if(transpurposes == undefined){
      return [];
    }
    return transpurposes;
  }


}
