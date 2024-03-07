
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Attendstatus} from "../entity/attendstatus";

@Injectable({
  providedIn: 'root'
})
export class AttendencestatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Attendstatus>> {
    const attendstatuss = await this.http.get<Array<Attendstatus>>('http://localhost:8080/attendencestatuss/list').toPromise();
    if(attendstatuss == undefined){
      return [];
    }
    return attendstatuss;
  }


}
