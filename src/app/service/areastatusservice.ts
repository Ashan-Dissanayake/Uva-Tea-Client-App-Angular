import {Areastatus} from "../entity/areastatus";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AreastatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Areastatus>> {
    const areastatuss = await this.http.get<Array<Areastatus>>('http://localhost:8080/areastatuss/list').toPromise();
    if(areastatuss == undefined){
      return [];
    }
    return areastatuss;
  }


}
