import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Production} from "../../../entity/production";
import {ProductionService} from "../../../service/productionservice";
import {Employee} from "../../../entity/employee";
import {Area} from "../../../entity/area";
import {Product} from "../../../entity/product";
import {Areaservice} from "../../../service/areaservice";
import {ProductService} from "../../../service/productservice";
import {EmployeeService} from "../../../service/employeeservice";
import {Productionproduct} from "../../../entity/productionproduct";
import {ProductionorderService} from "../../../service/productionorderservice";
import {Productionorder} from "../../../entity/Productionorder";

@Component({
  selector: 'app-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.css']
})
export class ProductionComponent {

  columns: string[] = ['date','time','area','teamaker', 'productquantity'];
  headers: string[] = ['Date', 'Time', 'Area', 'TeaMaker', 'Details(Product and Quantity(kg))'];
  binders: string[] = ['date', 'time', 'productionorder.area.code', 'productionorder.teamaker.callingname', 'getProductionDetails()'];

  cscolumns: string[] = ['csdate', 'cstime', 'csarea', 'csteamaker', 'csproductquantity'];
  csprompts: string[] = ['Search By Date', 'Search By Time','Search By Area' ,'Search By TeaMaker', 'Search By Details'];

  incolumns: string[] = ['name', 'quatity','remove'];
  inheaders: string[] = ['Product', 'Quantity','Remove'];
  inbinders: string[] = ['product.name', 'quantity','getBtn()'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;
  public innerform!: FormGroup;

  production!: Production;
  oldproduction!: Production|undefined;

  innerdata:any;
  oldinnerdata:any;

  selectedrow: any;

  productions: Array<Production> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Production>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  indata!:MatTableDataSource<Productionproduct>;

  productionproducts: Array<Productionproduct> = [];

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  innerDataChanged:boolean = false;

  areas: Array<Area> = [];
  teamakers: Array<Employee> = [];
  products: Array<Product> = [];
  productionorders: Array<Productionorder> = [];

  id = 0;

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private rs:RegexService,
    private ps:ProductionService,
    private as:Areaservice,
    private productser:ProductService,
    private porderser:ProductionorderService,
    private es:EmployeeService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csdate": new FormControl(),
      "cstime": new FormControl(),
      "csarea": new FormControl(),
      "csteamaker": new FormControl(),
      "csproductquantity": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssarea": new FormControl(),
      "ssteamaker": new FormControl(),
      "ssproduct": new FormControl(),

    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "time": new FormControl(),
      "productionorder": new FormControl(),
    }, {updateOn:'change'});

    this.innerform = this.fb.group( {
      "product": new FormControl(),
      "quantity": new FormControl(),
    }, {updateOn:'change'});



  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.as.getAll("").then( (areas: Area[]) => {
      this.areas = areas;
    });

    this.es.getTeaMakers().then( (teamakrs: Employee[]) => {
      this.teamakers = teamakrs;
    });

    this.productser.getAllList().then( (prodts: Product[]) => {
      this.products = prodts;
    });

    this.porderser.getAll("").then( (proordes: Productionorder[]) => {
      this.productionorders = proordes;
    });

    this.createForm();

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadForm() {

    this.oldproduction = undefined;

    this.form.reset();
    this.innerform.reset();
    this.innerDataChanged = false;
    // this.indata.data = [];

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    Object.values(this.innerform.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  createForm() {

    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['time'].setValidators([Validators.required,]);
    this.form.controls['productionorder'].setValidators([Validators.required]);

    this.innerform.controls['product'].setValidators([Validators.required,]);
    this.innerform.controls['quantity'].setValidators([Validators.required,Validators.pattern("^\\d{1,4}(\\.\\d{1,2})?$")]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );
    Object.values(this.innerform.controls).forEach( control => { control.markAsTouched(); } );


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "date")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldproduction != undefined && control.valid) {
            // @ts-ignore
            if (value === this.production[controlName]) {
              control.markAsPristine();
            } else {
              control.markAsDirty();
            }
          } else {
            control.markAsPristine();
          }
        }
      );

    }


    for (const controlName in this.innerform.controls) {
      const control = this.innerform.controls[controlName];
      control.valueChanges.subscribe(value => {

          if (this.oldinnerdata != undefined && control.valid) {
            // @ts-ignore
            if (value === this.innerdata[controlName]) {
              control.markAsPristine();
            } else {
              control.markAsDirty();
            }
          } else {
            control.markAsPristine();
          }
        }
      );

    }

    this.loadForm();
  }


  getBtn(element:Production){
    return `<button mat-raised-button>Modify</button>`;
  }

  loadTable(query:string) {

    this.ps.getAll(query)
      .then( (produtons: Production[]) => { this.productions = produtons; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.productions); this.data.paginator = this.paginator; } );

  }

  getProductionDetails(element:Production) {
    let productiondetails:string = "";
    element.productionproducts.forEach((pp)=> { productiondetails = productiondetails+ pp.product.name+" "+pp.quantity+","+"\n"});
    return productiondetails;
  }

  deleteRaw(x:any) {

    let datasources = this.indata.data;

    const index = datasources.findIndex(prodct => prodct.id === x.id);
    if (index > -1) {
      datasources.splice(index, 1);
    }
    this.indata.data = datasources;
    this.productionproducts = this.indata.data;

    if(this.innerDataChanged) this.innerDataChanged = !this.innerDataChanged;
  }

  btnaddMc() {

    this.innerdata = this.innerform.getRawValue();

    if( this.innerdata.quantity != null && this.innerdata.product!=null){

      let producproduct = new  Productionproduct(this.id,this.innerdata.product,this.innerdata.quantity);

      let productionproductInside: Productionproduct[] = [];
      if(this.indata != null) this.indata.data.forEach((i) => productionproductInside.push(i));

      this.productionproducts = [];
      productionproductInside.forEach((t)=> this.productionproducts.push(t));

      this.productionproducts.push(producproduct);
      this.indata = new MatTableDataSource(this.productionproducts);

      this.id++;
      this.innerform.reset();

      if(this.innerDataChanged) this.innerDataChanged = !this.innerDataChanged;

    }

  }

  fillForm(production: Production) {

    this.enableButtons(false,true,true);

    this.innerDataChanged = true;

    this.selectedrow=production;

    this.production = JSON.parse(JSON.stringify(production));
    this.oldproduction = JSON.parse(JSON.stringify(production));

    //@ts-ignore
    this.production.productionorder = this.productionorders.find(pors => pors.id === this.production.productionorder.id);

    this.indata = new MatTableDataSource(this.production.productionproducts);

    this.form.patchValue(this.production);
    this.form.markAsPristine();

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (production: Production, filter: string) => {

      return (csearchdata.csdate==null || production.date.includes(csearchdata.csdate)) &&
        (csearchdata.cstime==null || production.time.includes(csearchdata.cstime)) &&
        (csearchdata.csarea==null || production.productionorder.area.code.includes(csearchdata.csarea)) &&
        (csearchdata.csteamaker==null || production.productionorder.teamaker.callingname.toLowerCase().includes(csearchdata.csteamaker)) &&
        (csearchdata.csproductquantity==null || this.getProductionDetails(production).toLowerCase().includes(csearchdata.csproductquantity)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let areaid = ssearchdata.ssarea;
    let teamakerid = ssearchdata.ssteamaker;
    let productid = ssearchdata.ssproduct;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(areaid!=null) query = query + "&areaid=" + areaid;
    if(teamakerid!=null) query = query + "&teamakerid=" + teamakerid;
    if(productid!=null) query = query + "&productid=" + productid;
    if(date!=null) query = query + "&date=" + date;

    if(query!="") query = query.replace(/^./,"?");

    this.loadTable(query);
  }

  btnSearchClearMc(): void {

    const confirm = this.dg.open(ConfirmComponent,{
      width: '500px',
      data: {heading: "Search Clear", message: "Are you sure to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result =>{
      if(result){
        this.ssearch.reset();
        this.loadTable("");
      }
    });

  }

  add() {

    let errors = this.getErrors();

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Production Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.production = this.form.getRawValue();
      this.production.productionproducts = this.productionproducts;

      // @ts-ignore
      this.productionproducts.forEach((i)=> delete  i.id);

      // @ts-ignore
      this.production.date = this.dp.transform(new Date(this.production.date),'yyyy-MM-dd');

      const productiontimeField = document.getElementById("productiontimeInput");

      // @ts-ignore
      const productiontimeValue = productiontimeField.value;

      const timeComponent = productiontimeValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.production.time = `${hour1}:${minutes1}:${seconds1}`;

      let date = this.dp.transform(new Date(this.production.date),'yyyy-MM-dd');

      let productionData: string = "";

      productionData = productionData + "<br>Date is : " + date;
      productionData = productionData + "<br>Area is : " + this.production.productionorder.area.code;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Production Add",
          message: "Are you sure to Add the following Production? <br> <br>" + productionData
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.ps.add(this.production).then((responce: [] | undefined) => {
            //console.log("Res-" + responce);
            //console.log("Un-" + responce == undefined);
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              addstatus = responce['errors'] == "";
              console.log("Add Sta-" + addstatus);
              if (!addstatus) { // @ts-ignore
                addmessage = responce['errors'];
              }
            } else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {

            if (addstatus) {
              addmessage = "Successfully Saved";

              this.indata.data = [];
              this.loadForm();
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status - Production Add", message: addmessage}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }


  getErrors(): string {
    let errors: string="";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if(control.errors) {
        // if(this.regexes[controlName]!=undefined)
        // { errors = errors+"<br>"+ this.regexes[controlName]['message']; }
        // else
        // { errors = errors+"<br>Invalid "+ controlName; }
        errors = errors+"<br>Invalid "+ controlName;
      }
    }

    if(!this.innerDataChanged) {
      console.log("wda")
      if(this.productionproducts.length===0)  errors = errors+"<br>Product is Not Selected";
    }


    // if(!this.innerDataChanged) {
    //   errors = errors + "<br>Product is Not Added";
    // }


    return errors;
  }

  getUpdates(): string {

    // console.log(this.productionproducts)

    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }

    // if(this.productionproducts.length != this.production.productionproducts.length){
    //   console.log("new "+this.productionproducts.length);
    //   console.log("old "+this.production.productionproducts.length);
    //   updates = updates + "<br> Products Changed";
    // }

    if(!this.innerDataChanged) {
      updates = updates + "<br>Product is Changed";
      this.innerDataChanged = true;
    }

    return updates;

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Production Update ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

    } else {

      let updates: string = this.getUpdates();

      if (updates != "") {

        let updstatus: boolean = false;
        let updmessage: string = "Server Not Found";

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: "Confirmation - Production Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {

            this.production = this.form.getRawValue();

            // @ts-ignore
            this.production.id = this.oldproduction.id;

            this.production.productionproducts = this.productionproducts;

            console.log("Insi"+this.production.productionproducts)

            // @ts-ignore
            const productiontimeValue = this.production.time;

            const timeComponent = productiontimeValue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.production.time = `${hour1}:${minutes1}:${seconds1}`;

            // @ts-ignore
            this.productionproducts.forEach((i)=> delete  i.id);

            // @ts-ignore
            this.production.date = this.dp.transform(new Date(this.production.date),'yyyy-MM-dd');

            this.ps.update(this.production).then((responce: [] | undefined) => {
              //console.log("Res-" + responce);
              // console.log("Un-" + responce == undefined);
              if (responce != undefined) { // @ts-ignore
                //console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
                // @ts-ignore
                updstatus = responce['errors'] == "";
                //console.log("Upd Sta-" + updstatus);
                if (!updstatus) { // @ts-ignore
                  updmessage = responce['errors'];
                }
              } else {
                //console.log("undefined");
                updstatus = false;
                updmessage = "Content Not Found"
              }
            } ).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";

                this.indata.data = [];
                this.loadForm();
                this.loadTable("");
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Production Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Production Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }


  }

  delete() : void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Production Delete",
        message: "Are you sure to Delete following Production? <br> <br>" + "Production Date: "+this.production.date
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ps.delete(this.production.id).then((responce: [] | undefined) => {

          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        }).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";

            this.indata.data = [];
            this.loadForm()
            this.loadTable("");
          }
          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Production Delete ", message: delmessage}
          });
          stsmsg.afterClosed().subscribe(async result => {
            if (!result) {
              return;
            }
          });

        });
      }
    });

  }

  clear() {

    const confirm = this.dg.open(ConfirmComponent,{
      width:'500px',
      data: {heading: "Confirmation - Clear Form",
        message: "Are you sure to Clear the Form? <br> <br> You will lost your updates."}
    });

    confirm.afterClosed().subscribe( async result => {
      if(result) {

        this.indata.data = [];
        this.loadForm();
      }
    });

  }

  enableButtons(add:boolean, upd:boolean, del:boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

}
