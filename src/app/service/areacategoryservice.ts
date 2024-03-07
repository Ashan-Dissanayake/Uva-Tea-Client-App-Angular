import {Areacategory} from "../entity/areacategory";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AreacategoryService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Areacategory>> {
    const areacategorys = await this.http.get<Array<Areacategory>>('http://localhost:8080/areacategorys/list').toPromise();
    if(areacategorys == undefined){
      return [];
    }
    return areacategorys;
  }


}
