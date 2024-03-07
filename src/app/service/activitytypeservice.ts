
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Activitytype} from "../entity/activitytype";

@Injectable({
  providedIn: 'root'
})
export class ActivitytypeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Activitytype>> {
    const activitytypes = await this.http.get<Array<Activitytype>>('http://localhost:8080/activitytypes/list').toPromise();
    if(activitytypes == undefined){
      return [];
    }
    return activitytypes;
  }


}
