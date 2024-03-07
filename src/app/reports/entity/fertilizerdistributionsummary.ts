export class Fertilizerdistributionsummary {

  public id!: number;
  public area !: string;
  public prevyear !: number;
  public currentyear!: number;

  constructor(id:number,area:string,prevyear:number,currentyear:number) {

    this.id=id;
    this.area=area;
    this.prevyear=prevyear;
    this.currentyear=currentyear;
  }

}
