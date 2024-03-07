export class Teacrop {

  public id!: number;
  public area !: string;
  public currenttotal !: number;
  public prevtotal!: number;
  public difference!: number;
  public status!:string;


  constructor(id:number,area:string,currenttotal:number,prevtotal:number,difference:number,status:string) {

    this.id=id;
    this.area=area;
    this.currenttotal=currenttotal;
    this.prevtotal=prevtotal;
    this.difference=difference;
    this.status=status;
  }

}
