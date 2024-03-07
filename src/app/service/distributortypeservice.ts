import {Component, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Distributortype} from "../entity/distributortype";

@Injectable({
  providedIn: 'root'
})
export class Distributortypeservice {

  constructor(private http: HttpClient) {
  }
  async getAllList(): Promise<Array<Distributortype>> {

    const distributortypes = await this.http.get<Array<Distributortype>>('http://localhost:8080/distributortypes/list').toPromise();
    if (distributortypes == undefined) {
      return [];
    }
    return distributortypes;

  }

}
