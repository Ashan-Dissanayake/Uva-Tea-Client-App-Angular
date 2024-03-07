import {Root} from "../entity/root";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class RootService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Root>> {
    const roots = await this.http.get<Array<Root>>('http://localhost:8080/roots/list').toPromise();
    if(roots == undefined){
      return [];
    }
    return roots;
  }


}
