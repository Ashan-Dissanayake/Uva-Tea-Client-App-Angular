import {Designation} from "../entity/designation";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Supplierstatus} from "../entity/supplierstatus";
import {Supplierfertilizer} from "../entity/supplierfertilizer";

@Injectable({
  providedIn: 'root'
})
export class SupplierfertilizerService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Supplierfertilizer>> {
    const supplierfertilizers = await this.http.get<Array<Supplierfertilizer>>('http://localhost:8080/supllierfetilizer/list').toPromise();
    if(supplierfertilizers == undefined){
      return [];
    }
    return supplierfertilizers;
  }


}
