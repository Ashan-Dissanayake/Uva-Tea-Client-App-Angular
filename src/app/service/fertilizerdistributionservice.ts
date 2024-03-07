
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Fertilizerdistribution} from "../entity/fertilizerdistribution";

@Injectable({
  providedIn: 'root'
})
export class FertilizerdistributionService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Fertilizerdistribution>> {
    const ferdistributions = await this.http.get<Array<Fertilizerdistribution>>('http://localhost:8080/fertilizerdistributions'+query).toPromise();
    if(ferdistributions == undefined){
      return [];
    }
    return ferdistributions;
  }

  async add(fertilizerdistribution:Fertilizerdistribution): Promise<[]|undefined> {

   return  this.http.post<[]>('http://localhost:8080/fertilizerdistributions', fertilizerdistribution).toPromise();
  }

  async update(fertilizerdistribution:Fertilizerdistribution): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/fertilizerdistributions', fertilizerdistribution).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/fertilizerdistributions/' + id).toPromise();
  }


}
