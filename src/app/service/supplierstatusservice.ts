import {Designation} from "../entity/designation";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Supplierstatus} from "../entity/supplierstatus";

@Injectable({
  providedIn: 'root'
})
export class SupplierstatusService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Supplierstatus>> {
    const supplierstatuss = await this.http.get<Array<Supplierstatus>>('http://localhost:8080/supplierstatuss/list').toPromise();
    if(supplierstatuss == undefined){
      return [];
    }
    return supplierstatuss;
  }


}
