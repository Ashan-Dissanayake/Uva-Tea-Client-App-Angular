
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Leaftype} from "../entity/leaftype";
import {Fertilizerbrand} from "../entity/fertilizerbrand";

@Injectable({
  providedIn: 'root'
})
export class FertilizerbrandService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Leaftype>> {
    const fertilizerbrands = await this.http.get<Array<Fertilizerbrand>>('http://localhost:8080/fertilizerbrands/list').toPromise();
    if(fertilizerbrands == undefined){
      return [];
    }
    return fertilizerbrands;
  }


}
