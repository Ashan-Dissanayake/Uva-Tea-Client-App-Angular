import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CountByDesignation} from "../entity/countbydesignation";
import {CountOfAreasByRoot} from "../entity/countofareasbyroot";
import {AreaTeaQuantity} from "../entity/areateaquantity";
import {Teacrop} from "../entity/teacrop";
import {Fertilizerdistributionsummary} from "../entity/fertilizerdistributionsummary";
import {Fertilizerremaining} from "../entity/fertilizerremaining";

@Injectable({
  providedIn: 'root'
})

export class ReportService {

  constructor(private http: HttpClient) {  }

  async countByDesignation(): Promise<Array<CountByDesignation>> {

    const countbydesignations = await this.http.get<Array<CountByDesignation>>('http://localhost:8080/reports/countbydesignation').toPromise();
    if(countbydesignations == undefined){
      return [];
    }
    return countbydesignations;
  }

  async countByArea(): Promise<Array<CountOfAreasByRoot>> {

    const countbyareas = await this.http.get<Array<CountOfAreasByRoot>>('http://localhost:8080/reports/countbyareas').toPromise();
    if(countbyareas == undefined){
      return [];
    }
    return countbyareas;
  }

  async areaTeaquantity(query:string): Promise<Array<AreaTeaQuantity>> {

    const areateaquantitys = await this.http.get<Array<AreaTeaQuantity>>('http://localhost:8080/reports/areateaquantity'+query).toPromise();
    if(areateaquantitys == undefined){
      return [];
    }
    return areateaquantitys;
  }

  async teaCropSummary(query:string): Promise<Array<Teacrop>> {

    const teacropsummarys = await this.http.get<Array<Teacrop>>('http://localhost:8080/reports/teacropsummary'+query).toPromise();
    if(teacropsummarys == undefined){
      return [];
    }
    return teacropsummarys;
  }

  async ferdissummary(query:string): Promise<Array<Fertilizerdistributionsummary>> {

    const ferdissumarys = await this.http.get<Array<Fertilizerdistributionsummary>>('http://localhost:8080/reports/fertilizerdistributionsummary'+query).toPromise();
    if(ferdissumarys == undefined){
      return [];
    }
    return ferdissumarys;
  }

  async getfertilizereamining(): Promise<Array<Fertilizerremaining>> {

    const fertilizerremains = await this.http.get<Array<Fertilizerremaining>>('http://localhost:8080/reports/fertilizerreamining').toPromise();
    if(fertilizerremains == undefined){
      return [];
    }
    return fertilizerremains;
  }


}
