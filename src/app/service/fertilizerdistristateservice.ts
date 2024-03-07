import {Gender} from "../entity/gender";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fertilizerdistributionstate} from "../entity/fertilizerdistributionstate";

@Injectable({
  providedIn: 'root'
})
export class FertilizerdistristateService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Fertilizerdistributionstate>> {
    const fertdisstates = await this.http.get<Array<Fertilizerdistributionstate>>('http://localhost:8080/fertilizerdistributionstates/list').toPromise();
    if(fertdisstates == undefined){
      return [];
    }
    return fertdisstates;
  }


}
