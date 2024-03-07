import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Porder} from "../../../entity/porder";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Porderfertilizer} from "../../../entity/porderfertilizer";
import {Fertilizer} from "../../../entity/fertilizer";
import {Porderstatus} from "../../../entity/porderstatus";
import {Supplier} from "../../../entity/supplier";
import {UiAssist} from "../../../util/ui/ui.assist";
import {PorderService} from "../../../service/porderservice";
import {PorderstatusService} from "../../../service/porderstatusservice";
import {FertilizerService} from "../../../service/fertilizerservice";
import {SupplierService} from "../../../service/supplierservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Orderr} from "../../../entity/orderr";
import {Orderrservice} from "../../../service/orderrservice";
import {Orderstatusservice} from "../../../service/orderstatusservice";
import {Orderstatus} from "../../../entity/orderstatus";
import {Distributor} from "../../../entity/distributor";
import {Distributorservice} from "../../../service/distributorservice";
import {Orderrproduct} from "../../../entity/orderrproduct";
import {Product} from "../../../entity/product";
import {ProductService} from "../../../service/productservice";

@Component({
  selector: 'app-orderr',
  templateUrl: './orderr.component.html',
  styleUrls: ['./orderr.component.css']
})
export class OrderrComponent {

  columns: string[] = ['name','distributor','doorder','doexpected', 'expectedgrandtotal','orderstatus','details'];
  headers: string[] = ['Name', 'Distributor', 'Date Of Order', 'Date Of Expected', 'GrandTotal','Order Status','Details'];
  binders: string[] = ['name', 'distributor.name', 'doorder', 'doexpected','expectedgrandtotal','orderstatus.name','getOrderProducts()'];

  cscolumns: string[] = ['csname', 'csdistributor', 'csdoorder', 'csdoexpected','csexpectedgrandtotal','csorderstatus', 'csdetails'];
  csprompts: string[] = ['Search By Order', 'Search By Distributor', 'Search By Order Date', 'Search By Expected Date','Search By Total','Search By Status', 'Search By Details'];

  incolumns: string[] = ['name', 'quatity', 'unitprice', 'linetotal', 'remove'];
  inheaders: string[] = ['Name', 'Quantity', 'Unit Price', 'Line Total', 'Remove'];
  inbinders: string[] = ['product.name', 'qty', 'product.unitprice', 'linetotal', 'getBtn()'];

  public ssearch!: FormGroup;
  public csearch!: FormGroup;
  public form!: FormGroup;
  public innerform!: FormGroup;

  orderr!: Orderr;
  oldorderr!: Orderr|undefined;

  innerdata:any;
  oldinnerdata:any;

  selectedrow: any;

  orderrs: Array<Orderr> = [];

  imageurl: string = '';

  data!: MatTableDataSource<Orderr>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  indata!:MatTableDataSource<Orderrproduct>;

  orderrproducts: Array<Orderrproduct> = [];

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  orderstatuss: Array<Orderstatus> = [];
  distributors: Array<Distributor> = [];
  products: Array<Product> = [];

  costexpected = 0;
  id = 0;

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private ors:Orderrservice,
    private orss:Orderstatusservice,
    private ds:Distributorservice,
    private ps:ProductService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csname": new FormControl(),
      "csdistributor": new FormControl(),
      "csdoorder": new FormControl(),
      "csdoexpected": new FormControl(),
      "csexpectedgrandtotal": new FormControl(),
      "csorderstatus": new FormControl(),
      "csdetails": new FormControl(),

    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssname": new FormControl(),
      "ssdistributor": new FormControl(),
      "ssstatus": new FormControl(),

    });

    this.form = this.fb.group( {
      "name": new FormControl(),
      "doorder": new FormControl(),
      "doexpected": new FormControl(),
      "expectedgrandtotal": new FormControl(),
      "distributor": new FormControl(),
      "orderstatus": new FormControl(),
    }, {updateOn:'change'});

    this.innerform = this.fb.group( {
      "product": new FormControl(),
      "qty": new FormControl(),
    }, {updateOn:'change'});



  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.orss.getAllList().then( (ordrstatuss: Orderstatus[]) => {
      this.orderstatuss = ordrstatuss;
    });

    this.ds.getAll("").then( (distbtes: Distributor[]) => {
      this.distributors = distbtes;
    });

    this.ps.getAllList().then( (prodts: Product[]) => {
      this.products = prodts;
      // console.log("UNIT "+ JSON.stringify(this.products))
    });

    this.createForm();

  }

  clearInnerTable(){
    if (this.indata.data != null){
      this.indata.data = [];
    }
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadForm() {

    this.oldorderr = undefined;

    this.form.reset();
    this.innerform.reset();
    this.clearInnerTable();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  createForm() {

    this.form.controls['name'].setValidators([Validators.required,Validators.pattern("^.*$")]);
    this.form.controls['doorder'].setValidators([Validators.required,]);
    this.form.controls['doexpected'].setValidators([Validators.required]);
    this.form.controls['distributor'].setValidators([Validators.required]);
    this.form.controls['expectedgrandtotal'].setValidators([Validators.required]);
    this.form.controls['orderstatus'].setValidators([Validators.required]);

    this.innerform.controls['product'].setValidators([Validators.required]);
    this.innerform.controls['qty'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );
    Object.values(this.innerform.controls).forEach( control => { control.markAsTouched(); } );


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "doorder" || controlName == "doexpected")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldorderr != undefined && control.valid) {
            // @ts-ignore
            if (value === this.orderr[controlName]) {
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

    this.enableButtons(true,false,false);

  }


  getBtn(element:Porder){
    return `<button mat-raised-button>Modify</button>`;
  }

  loadTable(query:string) {

    this.ors.getAll(query)
      .then( (ordrs: Orderr[]) => { this.orderrs = ordrs; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.orderrs); this.data.paginator = this.paginator; } );

  }


  // for viewtable
  getOrderProducts(element:Orderr) {

    let orderDetails = "";
    element.orderrproducts.forEach((orp)=>{ orderDetails = orderDetails + orp.product.name+" "+ orp.qty+","+"\n" });
    return orderDetails;

  }

  calculatecostexpected() {
    this.costexpected = 0;

    this.indata.data.forEach((e)=>{
      this.costexpected = this.costexpected+e.linetotal
    })

    this.form.controls['expectedgrandtotal'].setValue(this.costexpected);
  }

  deleteRaw(x:any) {

    let datasources = this.indata.data;

    const index = datasources.findIndex(orprodt => orprodt.id === x.id);
    if (index > -1) {
      datasources.splice(index, 1);
    }
    this.indata.data = datasources;
    this.orderrproducts = this.indata.data;

    this.calculatecostexpected();
  }

  btnaddMc() {

    this.innerdata = this.innerform.getRawValue();

    // console.log(this.innerdata.product.unitprice)

    if( this.innerdata.qty != null && this.innerdata.product!=null){

      let linetotal = this.innerdata.qty * this.innerdata.product.unitprice;

      let orderproduct = new  Orderrproduct(this.id,this.innerdata.product,this.innerdata.qty,linetotal);

      let orprodt: Orderrproduct[] = [];
      if(this.indata != null) this.indata.data.forEach((i) => orprodt.push(i));

      this.orderrproducts = [];

      orprodt.forEach((t)=> this.orderrproducts.push(t));

      this.orderrproducts.push(orderproduct);
      this.indata = new MatTableDataSource(this.orderrproducts);

      this.id++;

      this.calculatecostexpected();
      this.innerform.reset();

    }

  }

  fillForm(orderr: Orderr) {

    this.enableButtons(false,true,true);

    this.selectedrow=orderr;

    this.orderr = JSON.parse(JSON.stringify(orderr));
    this.oldorderr = JSON.parse(JSON.stringify(orderr));

    //@ts-ignore
    this.orderr.distributor = this.distributors.find(db => db.id === this.orderr.distributor.id);

    //@ts-ignore
    this.orderr.orderstatus = this.orderstatuss.find(os => os.id === this.orderr.orderstatus.id);

    this.indata = new MatTableDataSource(this.orderr.orderrproducts);

    this.form.patchValue(this.orderr);
    this.form.markAsPristine();

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (order: Orderr, filter: string) => {

      return (csearchdata.csname==null || order.name.includes(csearchdata.csname)) &&
        (csearchdata.csdistributor==null || order.distributor.name.toLowerCase().includes(csearchdata.csdistributor)) &&
        (csearchdata.csdoorder==null || order.doorder.includes(csearchdata.csdoorder)) &&
        (csearchdata.csdoexpected==null || order.doexpected.includes(csearchdata.csdoexpected)) &&
        (csearchdata.csexpectedgrandtotal==null || order.expectedgrandtotal.toString().includes(csearchdata.csexpectedgrandtotal)) &&
        (csearchdata.csorderstatus==null || order.orderstatus.name.toLowerCase().includes(csearchdata.csorderstatus)) &&
        (csearchdata.csdetails==null || this.getOrderProducts(order).includes(csearchdata.csdetails)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let name = ssearchdata.ssname;
    let distributorid = ssearchdata.ssdistributor;
    let statusid = ssearchdata.ssstatus;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(name!=null && name.trim()!= null) query = query + "&name=" + name;
    if(distributorid!=null) query = query + "&distributorid=" + distributorid;
    if(statusid!=null) query = query + "&statusid=" + statusid;
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
        data: {heading: "Errors - Order Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.orderr = this.form.getRawValue();
      this.orderr.orderrproducts = this.orderrproducts;

      // @ts-ignore
      this.orderrproducts.forEach((i)=> delete  i.id);

      // @ts-ignore
      this.orderr.doorder = this.dp.transform(new Date(this.orderr.doorder),'yyyy-MM-dd');
      // @ts-ignore
      this.orderr.doexpected = this.dp.transform(new Date(this.orderr.doexpected),'yyyy-MM-dd');

      let orderdata: string = "";

      orderdata = orderdata + "<br>Order Name is : " + this.orderr.name
      orderdata = orderdata + "<br>Total Cost is : " + this.orderr.expectedgrandtotal;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Order Add",
          message: "Are you sure to Add the following Order? <br> <br>" + orderdata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.ors.add(this.orderr).then((responce: [] | undefined) => {
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
              // this.form.reset();
              // this.innerform.reset();
              // this.indata.data = [];
              // Object.values(this.form.controls).forEach(control => {
              //   control.markAsTouched();
              // });
              this.loadForm();
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status - Order Add", message: addmessage}
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
    return errors;
  }

  getUpdates(): string {

    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }
    return updates;

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Order Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Order Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {

            this.orderr = this.form.getRawValue();

            // @ts-ignore
            this.orderr.id = this.oldorderr.id;

            this.orderr.orderrproducts = this.orderrproducts;

            // @ts-ignore
            this.orderrproducts.forEach((i)=> delete  i.id);

            // @ts-ignore
            this.orderr.doorder = this.dp.transform(new Date(this.orderr.doorder),'yyyy-MM-dd');

            // @ts-ignore
            this.orderr.doexpected = this.dp.transform(new Date(this.orderr.doexpected),'yyyy-MM-dd');

            this.ors.update(this.orderr).then((responce: [] | undefined) => {
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
                // this.form.reset();
                // this.innerform.reset();
                // this.indata.data = [];
                // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
                this.loadForm();
                this.loadTable("");
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status - Order Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Order Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }


  }

  delete() : void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Order Delete",
        message: "Are you sure to Delete following Order? <br> <br>" + "Order Name: "+this.orderr.name
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ors.delete(this.orderr.id).then((responce: [] | undefined) => {

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
            this.loadForm()
            this.loadTable("");
          }
          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Order Delete ", message: delmessage}
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
