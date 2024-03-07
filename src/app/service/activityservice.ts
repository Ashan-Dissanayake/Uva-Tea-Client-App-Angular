import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Activity} from "../entity/activity";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Activity>> {
    const activitys = await this.http.get<Array<Activity>>('http://localhost:8080/activities'+query).toPromise();
    if(activitys == undefined){
      return [];
    }
    return activitys;
  }

  async add(activity:Activity): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/activities', activity).toPromise();
  }

  async update(activity:Activity): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/activities', activity).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/activities/' + id).toPromise();
  }

  async getupcomevt(): Promise<Array<Activity>> {
    const activiys = await this.http.get<Array<Activity>>('http://localhost:8080/activities/currentfutureactivity').toPromise();
    if (activiys == undefined) {
      return [];
    }
    return activiys;
  }



}
