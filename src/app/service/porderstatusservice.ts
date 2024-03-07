import {Designation} from "../entity/designation";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Porder} from "../entity/porder";
import {Porderstatus} from "../entity/porderstatus";

@Injectable({
  providedIn: 'root'
})
export class PorderstatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Porderstatus>> {
    const porderstatuss = await this.http.get<Array<Porderstatus>>('http://localhost:8080/porderstatuss/list').toPromise();
    if(porderstatuss == undefined){
      return [];
    }
    return porderstatuss;
  }


}
