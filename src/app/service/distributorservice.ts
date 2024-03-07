import {Component, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Distributor} from "../entity/distributor";

@Injectable({
  providedIn: 'root'
})
export class Distributorservice {

  constructor(private http: HttpClient) {
  }
  async getAll(query:string): Promise<Array<Distributor>> {
    const distributors = await this.http.get<Array<Distributor>>('http://localhost:8080/distributors'+query).toPromise();
    if(distributors == undefined){
      return [];
    }
    return distributors;
  }

  async add(distributor: Distributor): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/distributors',distributor).toPromise();
  }

  async update(distributor: Distributor): Promise<[]|undefined>{
    return this.http.put<[]>('http://localhost:8080/distributors', distributor).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/distributors/' + id).toPromise();
  }

  async getAllList(): Promise<Array<Distributor>> {

    const distributors = await this.http.get<Array<Distributor>>('http://localhost:8080/distributors/list').toPromise();
    if(distributors == undefined){
      return [];
    }
    return distributors;
  }
}
