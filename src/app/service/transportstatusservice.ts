
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Transportpurpose} from "../entity/transportpurpose";
import {Transportstatus} from "../entity/transportstatus";

@Injectable({
  providedIn: 'root'
})
export class TransportstatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Transportstatus>> {
    const transportstatuss = await this.http.get<Array<Transportstatus>>('http://localhost:8080/transportstatuss/list').toPromise();
    if(transportstatuss == undefined){
      return [];
    }
    return transportstatuss;
  }


}
