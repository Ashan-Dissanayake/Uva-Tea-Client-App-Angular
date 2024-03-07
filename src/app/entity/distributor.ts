import {Distributortype} from "./distributortype";
import {Distributorstatus} from "./distributorstatus";

export class Distributor {

  public id !: number;
  public name !: string;
  public telephone !: string;
  public email !: string;
  public address !: string;
  public contactperson !: string;
  public contactpersontp !: string;
  public description !: string;
  public creditlimit !: string;

  public distributorstatus !: Distributorstatus;
  public distributortype !: Distributortype;


  constructor(id:number, name:string, telephone:string, email:string, address:string, contactperson:string,
              contactpersontp:string, description:string, creditlimit:string, distributorstatus:Distributorstatus, distributortype:Distributortype) {
    this.id=id;
    this.name=name;
    this.telephone=telephone;
    this.email=email;
    this.address=address;
    this.contactperson=contactperson;
    this.contactpersontp=contactpersontp;
    this.description=description;
    this.creditlimit=creditlimit;
    this.distributorstatus=distributorstatus;
    this.distributortype=distributortype;
  }
}
