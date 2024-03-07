import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Fertilizer} from "../../../entity/fertilizer";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {FertilizerService} from "../../../service/fertilizerservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Porder} from "../../../entity/porder";
import {PorderService} from "../../../service/porderservice";
import {PorderstatusService} from "../../../service/porderstatusservice";
import {SupplierService} from "../../../service/supplierservice";
import {Porderstatus} from "../../../entity/porderstatus";
import {Supplier} from "../../../entity/supplier";
import {Porderfertilizer} from "../../../entity/porderfertilizer";

@Component({
  selector: 'app-purchaseorder',
  templateUrl: './purchaseorder.component.html',
  styleUrls: ['./purchaseorder.component.css']
})
export class PurchaseorderComponent {

  columns: string[] = ['doplaced','costexpected','porderstatus','suppliername', 'fertlizerantquantity'];
  headers: string[] = ['Placed Date', 'Cost Expected', 'Status', 'Supplier', 'Details'];
  binders: string[] = ['doplaced', 'costexpected', 'porderstatus.name', 'supplier.name', 'getPorderDetails()'];

  cscolumns: string[] = ['csdoplaced', 'cscostexpected', 'csporderstatus', 'cssuppliername', 'csfertlizerantquantity'];
  csprompts: string[] = ['Search By Date', 'Search By Cost', 'Search By Status', 'Search By Supplier', 'Search By Order Details'];

  incolumns: string[] = ['name', 'quatity', 'unitprice', 'linetotal', 'remove'];
  inheaders: string[] = ['Name', 'Quantity', 'Unit Price', 'Line Total', 'Remove'];
  inbinders: string[] = ['fertilizer.name', 'qty', 'fertilizer.unitprice', 'linecost', 'getBtn()'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;
  public innerform!: FormGroup;

  porder!: Porder;
  oldporder!: Porder|undefined;

  innerdata:any;
  oldinnerdata:any;

  selectedrow: any;

  porders: Array<Porder> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Porder>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  indata!:MatTableDataSource<Porderfertilizer>;

  porderfertilizers: Array<Porderfertilizer> = [];

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  fertilizers: Array<Fertilizer> = [];
  postatuss: Array<Porderstatus> = [];
  suppliers: Array<Supplier> = [];

  costexpected = 0;
  id = 0;

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private pos:PorderService,
    private poss:PorderstatusService,
    private fs:FertilizerService,
    private ss:SupplierService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);


    this.csearch = this.fb.group( {
      "csdoplaced": new FormControl(),
      "cscostexpected": new FormControl(),
      "csporderstatus": new FormControl(),
      "cssuppliername": new FormControl(),
      "csfertlizerantquantity": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "sssupplier": new FormControl(),
      "sspostatus": new FormControl(),
      "ssfertilizer": new FormControl(),

    });

    this.form = this.fb.group( {
      "doplaced": new FormControl(),
      "costexpected": new FormControl(),
      "porderstatus": new FormControl(),
      "supplier": new FormControl(),
    }, {updateOn:'change'});

    this.innerform = this.fb.group( {
      "fertilizer": new FormControl(),
      "qty": new FormControl(),
    }, {updateOn:'change'});



  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.poss.getAllList().then( (postatuss: Porderstatus[]) => {
      this.postatuss = postatuss;
    });

    this.fs.getAll("").then( (fertilizrs: Fertilizer[]) => {
      this.fertilizers = fertilizrs;
    });

    this.ss.getAll("").then( (suppliers: Supplier[]) => {
      this.suppliers = suppliers;
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

    this.oldporder = undefined;

    this.form.reset();
    this.innerform.reset();
    this.clearInnerTable();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  createForm() {

    this.form.controls['doplaced'].setValidators([Validators.required]);
    this.form.controls['costexpected'].setValidators([Validators.required,]);
    this.form.controls['porderstatus'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);

    this.innerform.controls['fertilizer'].setValidators([Validators.required]);
    this.innerform.controls['qty'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );
    Object.values(this.innerform.controls).forEach( control => { control.markAsTouched(); } );


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "doplaced")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldporder != undefined && control.valid) {
            // @ts-ignore
            if (value === this.porder[controlName]) {
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

    this.pos.getAll(query)
      .then( (porders: Porder[]) => { this.porders = porders; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.porders); this.data.paginator = this.paginator; } );

  }

  loadsupplierrelatedFertilizers(supplier:Supplier) {

    this.fertilizers = [];

    let suplyfertilizs = supplier.supplierfertilizers;
    suplyfertilizs.forEach((supfer)=>{this.fertilizers.push(supfer.fertilizer)})

  }

  // for viewtable
  getPorderDetails(element:Porder) {

    let porderDetails = "";
    element.porderfertilizers.forEach((pof)=>{ porderDetails = porderDetails + pof.fertilizer.name+" "+ pof.qty+","+"\n" });
    return porderDetails;

  }

  calculatecostexpected() {
    this.costexpected = 0;

    this.indata.data.forEach((e)=>{
      this.costexpected = this.costexpected+e.linecost
    })

    this.form.controls['costexpected'].setValue(this.costexpected);
  }

  deleteRaw(x:any) {

    // this.indata.data = this.indata.data.reduce((element) => element.id !== x.id);

    let datasources = this.indata.data;

    const index = datasources.findIndex(fertilzr => fertilzr.id === x.id);
    if (index > -1) {
      datasources.splice(index, 1);
    }
    this.indata.data = datasources;
    this.porderfertilizers = this.indata.data;

    this.calculatecostexpected();
  }

  btnaddMc() {

    this.innerdata = this.innerform.getRawValue();

    if( this.innerdata.qty != null && this.innerdata.fertilizer!=null){

      let linetotal = this.innerdata.qty * this.innerdata.fertilizer.unitprice;

      let porderfertilizer = new  Porderfertilizer(this.id,this.innerdata.fertilizer,this.innerdata.qty,linetotal);

      let pofertilizer: Porderfertilizer[] = [];
      if(this.indata != null) this.indata.data.forEach((i) => pofertilizer.push(i));

      this.porderfertilizers = [];
      pofertilizer.forEach((t)=> this.porderfertilizers.push(t));

      this.porderfertilizers.push(porderfertilizer);
      this.indata = new MatTableDataSource(this.porderfertilizers);

      this.id++;

      this.calculatecostexpected();
      this.innerform.reset();

    }

  }

  fillForm(porder: Porder) {

    this.enableButtons(false,true,true);

    this.selectedrow=porder;

    this.porder = JSON.parse(JSON.stringify(porder));
    this.oldporder = JSON.parse(JSON.stringify(porder));

    //@ts-ignore
    this.porder.supplier = this.suppliers.find(s => s.id === this.porder.supplier.id);

    this.loadsupplierrelatedFertilizers(this.porder.supplier);

    //@ts-ignore
    this.porder.porderstatus = this.postatuss.find(posta => posta.id === this.porder.porderstatus.id);

    this.indata = new MatTableDataSource(this.porder.porderfertilizers);

    this.form.patchValue(this.porder);
    this.form.markAsPristine();

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (porder: Porder, filter: string) => {

      return (csearchdata.csdoplaced==null || porder.doplaced.includes(csearchdata.csdoplaced)) &&
        (csearchdata.cscostexpected==null || porder.costexpected.toString().includes(csearchdata.cscostexpected)) &&
        (csearchdata.csporderstatus==null || porder.porderstatus.name.toLowerCase().includes(csearchdata.csporderstatus)) &&
        (csearchdata.cssuppliername==null || porder.supplier.name.toLowerCase().includes(csearchdata.cssuppliername)) &&
        (csearchdata.csfertlizerantquantity==null || this.getPorderDetails(porder).toLowerCase().includes(csearchdata.csfertlizerantquantity)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let supplierid = ssearchdata.sssupplier;
    let postatusid = ssearchdata.sspostatus;
    let fertilizerid = ssearchdata.ssfertilizer;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(supplierid!=null) query = query + "&supplierid=" + supplierid;
    if(postatusid!=null) query = query + "&postatusid=" + postatusid;
    if(fertilizerid!=null) query = query + "&fertilizerid=" + fertilizerid;
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
        data: {heading: "Errors - Purchase Order Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.porder = this.form.getRawValue();
      this.porder.porderfertilizers = this.porderfertilizers;

      // @ts-ignore
      this.porderfertilizers.forEach((i)=> delete  i.id);

      // @ts-ignore
      this.porder.doplaced = this.dp.transform(new Date(this.porder.doplaced),'yyyy-MM-dd');

      let porderdata: string = "";

      porderdata = porderdata + "<br>Supplier is : " + this.porder.supplier.name
      porderdata = porderdata + "<br>Expected Cost is : " + this.porder.costexpected;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Purchase Order Add",
          message: "Are you sure to Add the following Purchase Order? <br> <br>" + porderdata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.pos.add(this.porder).then((responce: [] | undefined) => {
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
              data: {heading: "Status - Purchase Order Add", message: addmessage}
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
        data: {heading: "Errors - Purchase Order Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Purchase Order Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {

            this.porder = this.form.getRawValue();

           /* // console.log("porder "+this.porder.id);
            // @ts-ignore
            // console.log("oldporder "+this.oldporder.id);*/

            // @ts-ignore
            this.porder.id = this.oldporder.id;

            this.porder.porderfertilizers = this.porderfertilizers;

            // @ts-ignore
            this.porderfertilizers.forEach((i)=> delete  i.id);

            // @ts-ignore
            this.porder.doplaced = this.dp.transform(new Date(this.porder.doplaced),'yyyy-MM-dd');

            this.pos.update(this.porder).then((responce: [] | undefined) => {
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
                data: {heading: "Status -Purchase Order Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Purchase Order Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }


  }

  delete() : void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Purchase Order Delete",
        message: "Are you sure to Delete following Purchase Order? <br> <br>" + "Date Of Placed: "+this.porder.doplaced
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.pos.delete(this.porder.id).then((responce: [] | undefined) => {

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
            data: {heading: "Status - Purchase Order Delete ", message: delmessage}
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
