export class CountOfAreasByRoot {

  public id !: number;
  public area !: string;
  public count !: number;
  public percentage !: number;

  constructor(id:number,area:string,count:number,percentage:number) {
    this.id=id;
    this.area=area;
    this.count=count;
    this.percentage=percentage;
  }

}
