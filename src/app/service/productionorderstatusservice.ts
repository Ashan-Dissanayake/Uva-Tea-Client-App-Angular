
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productionorderstatus} from "../entity/productionorderstatus";

@Injectable({
  providedIn: 'root'
})
export class ProductionorderstatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Productionorderstatus>> {
    const productionorderstatuss = await this.http.get<Array<Productionorderstatus>>('http://localhost:8080/productionorderstatuss/list').toPromise();
    if(productionorderstatuss == undefined){
      return [];
    }
    return productionorderstatuss;
  }


}
