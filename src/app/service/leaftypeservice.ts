
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Leaftype} from "../entity/leaftype";

@Injectable({
  providedIn: 'root'
})
export class LeaftypeService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Leaftype>> {
    const leaftypes = await this.http.get<Array<Leaftype>>('http://localhost:8080/leaftypes/list').toPromise();
    if(leaftypes == undefined){
      return [];
    }
    return leaftypes;
  }


}
