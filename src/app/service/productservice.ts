
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Product} from "../entity/product";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

 constructor(private http: HttpClient) { }

  async getAllList(): Promise<Array<Product>> {
    const products = await this.http.get<Array<Product>>('http://localhost:8080/products/list').toPromise();
    if(products == undefined){
      return [];
    }
    return products;
  }


}
