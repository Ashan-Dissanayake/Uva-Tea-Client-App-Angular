export class CountByDesignation {

  public id !: number;
  public designation !: string;
  public count !: number;
  public percentage !: number;

  constructor(id:number,designation:string,count:number,percentage:number) {
    this.id=id;
    this.designation=designation;
    this.count=count;
    this.percentage=percentage;
  }

}
