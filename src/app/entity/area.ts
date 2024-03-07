import {Root} from "./root";
import {Areastatus} from "./areastatus";
import {Employee} from "./employee";
import {Areacategory} from "./areacategory";

export class Area {

  public id!: number;
  public code !: string;
  public acres !: number;
  public map !: string;
  public doattached !: string;
  public plantcount !: number;
  public doproofing !: string;
  public root !: Root;
  public areastatus !: Areastatus;
  public empsupervisor !: Employee;
  public empfieldofficer !: Employee;
  public areacategory !: Areacategory;

  constructor(id:number, code:string, acres:number, map:string, doattached:string, palntcount:number,
              doproofing:string, root:Root, areastatus:Areastatus, empsupervisor:Employee,
              empfieldofficer:Employee, areacategory:Areacategory) {
    this.id = id;
    this.code = code;
    this.acres = acres;
    this.map = map;
    this.doattached = doattached;
    this.plantcount = palntcount;
    this.doproofing = doproofing;
    this.root = root;
    this.areastatus = areastatus;
    this.empsupervisor = empsupervisor;
    this.empfieldofficer = empfieldofficer;
    this.areacategory = areacategory;

  }

}
