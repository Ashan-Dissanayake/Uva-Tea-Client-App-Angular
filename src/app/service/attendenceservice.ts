
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Attendence} from "../entity/attendence";

@Injectable({
  providedIn: 'root'
})
export class AttendenceService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Attendence>> {
    const attendences = await this.http.get<Array<Attendence>>('http://localhost:8080/attendences'+query).toPromise();
    if(attendences == undefined){
      return [];
    }
    return attendences;
  }

  async add(attendence:Attendence): Promise<[]|undefined> {
   return  this.http.post<[]>('http://localhost:8080/attendences', attendence).toPromise();
  }

  async update(attendence:Attendence): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/attendences', attendence).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/attendences/' + id).toPromise();
  }



}
