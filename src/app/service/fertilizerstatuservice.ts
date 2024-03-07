
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Leaftype} from "../entity/leaftype";
import {Fertilizerbrand} from "../entity/fertilizerbrand";
import {Fertilizertype} from "../entity/fertilizertype";
import {Fertilizerstatus} from "../entity/fertilizerstatus";

@Injectable({
  providedIn: 'root'
})
export class FertilizerstatuService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Fertilizerstatus>> {
    const fertilizerstatuss = await this.http.get<Array<Fertilizerstatus>>('http://localhost:8080/fertilizerstatuss/list').toPromise();
    if(fertilizerstatuss == undefined){
      return [];
    }
    return fertilizerstatuss;
  }


}
