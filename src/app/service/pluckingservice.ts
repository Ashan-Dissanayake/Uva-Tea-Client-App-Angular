import {HttpClient} from "@angular/common/http";
import {Plucking} from "../entity/plucking";
import {Injectable} from "@angular/core";
import {Employee} from "../entity/employee";

@Injectable({
  providedIn: 'root'
})

export class PluckingService {

  constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Plucking>> {
    const pluckings = await this.http.get<Array<Plucking>>('http://localhost:8080/pluckings'+query).toPromise();
    if(pluckings == undefined){
      return [];
    }
    return pluckings;
  }

  async add(plucking:Plucking): Promise<[]|undefined> {
    // console.log("PLO"+plucking);
    // return [];
    return  this.http.post<[]>('http://localhost:8080/pluckings', plucking).toPromise();
  }

  async update(plucking:Plucking): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/pluckings', plucking).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/pluckings/' + id).toPromise();
  }

  async getpluckerbonuss(query:string): Promise<Plucking> {
    const pluckerbonus = await this.http.get<Plucking>('http://localhost:8080/pluckings/pluckerbonus'+query).toPromise();
    // console.log(pluckerbonus)
    if(pluckerbonus == undefined){
      // @ts-ignore
      return;
    }
    return pluckerbonus;
  }




}
