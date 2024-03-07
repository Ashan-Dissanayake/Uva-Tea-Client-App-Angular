import {Employee} from "../entity/employee";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Transport} from "../entity/transport";

@Injectable({
  providedIn: 'root'
})
export class TransportService {

 constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Transport>> {
    const transports = await this.http.get<Array<Transport>>('http://localhost:8080/transports'+query).toPromise();
    if(transports == undefined){
      return [];
    }
    return transports;
  }

  async add(trasport:Transport): Promise<[]|undefined> {

   return  this.http.post<[]>('http://localhost:8080/transports', trasport).toPromise();
  }

  async update(trasport:Transport): Promise<[]|undefined> {
    return  this.http.put<[]>('http://localhost:8080/transports', trasport).toPromise();
  }

  async delete(id:number): Promise<[]|undefined> {
    return  this.http.delete<[]>('http://localhost:8080/transports/' + id).toPromise();
  }


}
