export class AreaTeaQuantity {

  public id !: number;
  public code !: string;
  public date!: string;
  public teaTotal !: number;
  public percentage !: number;

  constructor(id:number,code:string,date:string,teaTotal:number,percentage:number) {
    this.id=id;
    this.code=code;
    this.date=date;
    this.teaTotal=teaTotal;
    this.percentage=percentage;
  }

}
