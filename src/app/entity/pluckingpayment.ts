import {Employee} from "./employee";

export class Pluckingpayment {

  public id !: number;
  public startdate !: string;
  public enddate !: string;
  public dopayment !: string;
  public bonusqty !: number;
  public bonusperkilo !: number;
  public bonuspayment !: number;
  public basicpayment !: number;
  public totalpayment !: number;
  public plucker !: Employee;
  public issuer !: Employee;

  constructor(id:number, startdate:string,enddate:string,dopayment:string,bonusqty:number,
              bonusperkilo:number,bonuspayment:number,basicpayment:number,totalpayment:number,
              plucker:Employee,issuer:Employee
  ) {
    this.id = id;
    this.startdate = startdate;
    this.enddate = enddate;
    this.dopayment = dopayment;
    this.bonusqty = bonusqty;
    this.bonusperkilo = bonusperkilo;
    this.bonuspayment = bonuspayment;
    this.basicpayment = basicpayment;
    this.totalpayment = totalpayment;
    this.plucker = plucker;
    this.issuer = issuer;

  }



}
