import {Component, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Distributorstatus} from "../entity/distributorstatus";

@Injectable({
  providedIn: 'root'
})
export class Distributorstatusservice {

  constructor(private http: HttpClient) {
  }
  async getAllList(): Promise<Array<Distributorstatus>> {

    const distributorstatuss = await this.http.get<Array<Distributorstatus>>('http://localhost:8080/distributorstatuss/list').toPromise();
    if (distributorstatuss == undefined) {
      return [];
    }
    return distributorstatuss;

  }

}
