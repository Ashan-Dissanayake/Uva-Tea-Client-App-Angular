import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Orderr} from "../../../entity/orderr";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Orderrproduct} from "../../../entity/orderrproduct";
import {Orderstatus} from "../../../entity/orderstatus";
import {Distributor} from "../../../entity/distributor";
import {Product} from "../../../entity/product";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Orderrservice} from "../../../service/orderrservice";
import {Orderstatusservice} from "../../../service/orderstatusservice";
import {Distributorservice} from "../../../service/distributorservice";
import {ProductService} from "../../../service/productservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {Porder} from "../../../entity/porder";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Invoice} from "../../../entity/invoice";
import {Invoicestatusservice} from "../../../service/invoicestatusservice";
import {Invoiceservice} from "../../../service/invoiceservice";
import {EmployeeService} from "../../../service/employeeservice";
import {Employee} from "../../../entity/employee";
import {Invoicestatus} from "../../../entity/invoicestatus";
import {Invoiceproduct} from "../../../entity/invoiceproduct";

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {


  columns: string[] = ['name','distributor','date','grandtotal','status','manager','details'];
  headers: string[] = ['Name', 'Distributor', 'Date', 'Total', 'Status','Manager','Details'];
  binders: string[] = ['name', 'orderr.distributor.name', 'date', 'grandtotal','invoicestatus.name','manager.callingname','getInvoiceProducts()'];

  cscolumns: string[] = ['csname', 'csdistributor', 'csdate', 'csgrandtotal','csstatus','csmanager', 'csdetails'];
  csprompts: string[] = ['Search By Invoice', 'Search By Distributor', 'Search By Date', 'Search By Total','Search By Status','Search By Manager', 'Search By Details'];

  incolumns: string[] = ['name', 'quatity', 'unitprice', 'linetotal', 'remove'];
  inheaders: string[] = ['Name', 'Quantity', 'Unit Price', 'Line Total', 'Remove'];
  inbinders: string[] = ['product.name', 'qty', 'product.unitprice', 'linetotal', 'getBtn()'];

  public ssearch!: FormGroup;
  public csearch!: FormGroup;
  public form!: FormGroup;
  public innerform!: FormGroup;

  invoice!: Invoice;
  oldinvoice!: Invoice|undefined;

  innerdata:any;
  oldinnerdata:any;

  selectedrow: any;

  invoices: Array<Invoice> = [];

  imageurl: string = '';

  data!: MatTableDataSource<Invoice>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  indata!:MatTableDataSource<Invoiceproduct>;

  invoiceproducts: Array<Invoiceproduct> = [];

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  distributors: Array<Distributor> = [];
  managers: Array<Employee> = [];
  orderrs: Array<Orderr> = [];
  invoicestatuss: Array<Invoicestatus> = [];
  products: Array<Product> = [];

  costexpected = 0;
  id = 0;

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private ors:Orderrservice,
    private iss:Invoicestatusservice,
    private is:Invoiceservice,
    private es:EmployeeService,
    private ds:Distributorservice,
    private ps:ProductService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csname": new FormControl(),
      "csdistributor": new FormControl(),
      "csdate": new FormControl(),
      "csgrandtotal": new FormControl(),
      "csstatus": new FormControl(),
      "csmanager": new FormControl(),
      "csdetails": new FormControl(),

    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssdistributor": new FormControl(),
      "ssmanager": new FormControl(),
      "ssstatus": new FormControl(),

    });

    this.form = this.fb.group( {
      "name": new FormControl(),
      "date": new FormControl(),
      "grandtotal": new FormControl(),
      "orderr": new FormControl(),
      "invoicestatus": new FormControl(),
      "manager": new FormControl(),
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

    this.ds.getAllList().then( (distibuts: Distributor[]) => {
      this.distributors = distibuts;
    });
    //
    this.es.getManagers().then( (mangrs: Employee[]) => {
      this.managers = mangrs;
    });

    this.iss.getAllList().then( (nvoicestauss: Invoicestatus[]) => {
      this.invoicestatuss = nvoicestauss;
    });

    this.ors.getAll("").then( (ordrs: Orderr[]) => {
      this.orderrs = ordrs;
    });

    this.ps.getAllList().then( (procts: Product[]) => {
      this.products = procts;
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

    this.oldinvoice = undefined;

    this.form.reset();
    this.innerform.reset();
    this.clearInnerTable();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }



  createForm() {

    this.form.controls['name'].setValidators([Validators.required,]);
    this.form.controls['date'].setValidators([Validators.required,]);
    this.form.controls['grandtotal'].setValidators([Validators.required]);
    this.form.controls['orderr'].setValidators([Validators.required]);
    this.form.controls['invoicestatus'].setValidators([Validators.required]);
    this.form.controls['manager'].setValidators([Validators.required]);

    this.innerform.controls['product'].setValidators([Validators.required]);
    this.innerform.controls['qty'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );
    Object.values(this.innerform.controls).forEach( control => { control.markAsTouched(); } );


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "date")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldinvoice != undefined && control.valid) {
            // @ts-ignore
            if (value === this.invoice[controlName]) {
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

    this.is.getAll(query)
      .then( (invis: Invoice[]) => { this.invoices = invis; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.invoices); this.data.paginator = this.paginator; } );

  }


  // for viewtable
  getInvoiceProducts(element:Invoice) {

    let invoiceDetails = "";
    element.invoiceproducts.forEach((invp)=>{ invoiceDetails = invoiceDetails + invp.product.name+" "+ invp.qty+","+"\n" });
    return invoiceDetails;

  }

  calculatecostexpected() {
    this.costexpected = 0;

    this.indata.data.forEach((e)=>{
      this.costexpected = this.costexpected+e.linetotal
    })

    this.form.controls['grandtotal'].setValue(this.costexpected);
  }

  deleteRaw(x:any) {

    let datasources = this.indata.data;

    const index = datasources.findIndex(invoiproct => invoiproct.id === x.id);
    if (index > -1) {
      datasources.splice(index, 1);
    }
    this.indata.data = datasources;
    this.invoiceproducts = this.indata.data;

    this.calculatecostexpected();
  }

  btnaddMc() {

    this.innerdata = this.innerform.getRawValue();

    if( this.innerdata.qty != null && this.innerdata.product!=null){

      let linetotal = this.innerdata.qty * this.innerdata.product.unitprice;

      let invoiproduct = new  Invoiceproduct(this.id,this.innerdata.product,this.innerdata.qty,linetotal);

      let invoiprts: Invoiceproduct[] = [];

      if(this.indata != null) this.indata.data.forEach((i) => invoiprts.push(i));

      this.invoiceproducts = [];

      invoiprts.forEach((t)=> this.invoiceproducts.push(t));

      this.invoiceproducts.push(invoiproduct);
      this.indata = new MatTableDataSource(this.invoiceproducts);

      this.id++;

      this.calculatecostexpected();
      this.innerform.reset();

    }

  }

  fillForm(invoice: Invoice) {

    this.enableButtons(false,true,true);

    this.selectedrow=invoice;

    this.invoice = JSON.parse(JSON.stringify(invoice));
    this.oldinvoice = JSON.parse(JSON.stringify(invoice));

    //@ts-ignore
    this.invoice.orderr = this.orderrs.find(ord => ord.id === this.invoice.orderr.id);

    //@ts-ignore
    this.invoice.invoicestatus = this.invoicestatuss.find(is => is.id === this.invoice.invoicestatus.id);

    //@ts-ignore
    this.invoice.manager = this.managers.find(man => man.id === this.invoice.manager.id);

    this.indata = new MatTableDataSource(this.invoice.invoiceproducts);

    this.form.patchValue(this.invoice);
    this.form.markAsPristine();

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (invoice: Invoice, filter: string) => {

      return (csearchdata.csname==null || invoice.name.toLowerCase().includes(csearchdata.csname)) &&
        (csearchdata.csdistributor==null || invoice.orderr.distributor.name.toLowerCase().includes(csearchdata.csdistributor)) &&
        (csearchdata.csdate==null || invoice.date.includes(csearchdata.csdate)) &&
        (csearchdata.csgrandtotal==null || invoice.grandtotal.toString().includes(csearchdata.csgrandtotal)) &&
        (csearchdata.csstatus==null || invoice.invoicestatus.name.toLowerCase().includes(csearchdata.csstatus)) &&
        (csearchdata.csmanager==null || invoice.manager.callingname.toLowerCase().includes(csearchdata.csmanager)) &&
        (csearchdata.csdetails==null || this.getInvoiceProducts(invoice).includes(csearchdata.csdetails)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let distributorid = ssearchdata.ssdistributor;
    let managerid = ssearchdata.ssmanager;
    let statusid = ssearchdata.ssstatus;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(distributorid!=null) query = query + "&distributorid=" + distributorid;
    if(managerid!=null) query = query + "&managerid=" + managerid;
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
        data: {heading: "Errors - Invoice Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.invoice = this.form.getRawValue();
      this.invoice.invoiceproducts = this.invoiceproducts;

      // @ts-ignore
      this.invoiceproducts.forEach((i)=> delete  i.id);

      // @ts-ignore
      this.invoice.date = this.dp.transform(new Date(this.invoice.date),'yyyy-MM-dd');


      let invoicedata: string = "";

      invoicedata = invoicedata + "<br>Invoice is : " + this.invoice.name
      invoicedata = invoicedata + "<br>Total Cost is : " + this.invoice.grandtotal;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Invoice Add",
          message: "Are you sure to Add the following Order? <br> <br>" + invoicedata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.is.add(this.invoice).then((responce: [] | undefined) => {
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
              data: {heading: "Status -Invoice Add", message: addmessage}
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
        data: {heading: "Errors - Invoice Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Invoice Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {

            this.invoice = this.form.getRawValue();

            // @ts-ignore
            this.invoice.id = this.oldinvoice.id;

            this.invoice.invoiceproducts = this.invoiceproducts;

            // @ts-ignore
            this.invoiceproducts.forEach((i)=> delete  i.id);

            // @ts-ignore
            this.invoice.date = this.dp.transform(new Date(this.invoice.date),'yyyy-MM-dd');

            this.is.update(this.invoice).then((responce: [] | undefined) => {
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
                data: {heading: "Status - Invoice Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Invoice Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }


  }

  delete() : void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Invoice Delete",
        message: "Are you sure to Delete following Invoice? <br> <br>" + "Invoice Name: "+this.invoice.name
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.is.delete(this.invoice.id).then((responce: [] | undefined) => {

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
            data: {heading: "Status - Invoice Delete ", message: delmessage}
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
