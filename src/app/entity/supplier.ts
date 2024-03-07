import {Supplierstatus} from "./supplierstatus";
import {Supplierfertilizer} from "./supplierfertilizer";

export class Supplier {

  public id !: number;

  public name !: string;

  public code !: string;

  public contactperson !: string;

  public email !: string;

  public creditlimit !: number;

  public address !: string;

  public officetp !: string;

  public contactpersontp !: string;

  public supplierstatus !: Supplierstatus;

  public supplierfertilizers !: Array<Supplierfertilizer>;

  constructor(id:number, name:string,code:string, contactperson:string, email:string,
              creditlimit:number, address:string, officetp:string, contactpersontp:string, supplierstatus:Supplierstatus,
              supplierfertilizers:Array<Supplierfertilizer>

               ) {
   this.id = id;
   this.name = name;
   this.code = code;
   this.contactperson = contactperson;
   this.email = email;
   this.creditlimit = creditlimit;
   this.address = address;
   this.officetp = officetp;
   this.contactpersontp = contactpersontp;
   this.supplierstatus = supplierstatus;
   this.supplierfertilizers = supplierfertilizers;
  }
}
