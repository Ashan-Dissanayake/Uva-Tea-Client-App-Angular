import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Gender} from "../../../entity/gender";
import {Designation} from "../../../entity/designation";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Fertilizer} from "../../../entity/fertilizer";
import {FertilizerService} from "../../../service/fertilizerservice";
import {Fertilizertype} from "../../../entity/fertilizertype";
import {Fertilizerbrand} from "../../../entity/fertilizerbrand";
import {Fertilizerstatus} from "../../../entity/fertilizerstatus";
import {FertilizerbrandService} from "../../../service/fertilizerbrandservice";
import {FertilizertypeService} from "../../../service/fertilizertypeservice";
import {FertilizerstatuService} from "../../../service/fertilizerstatuservice";
import {RegexService} from "../../../service/regexservice";

@Component({
  selector: 'app-fertilizer',
  templateUrl: './fertilizer.component.html',
  styleUrls: ['./fertilizer.component.css']
})
export class FertilizerComponent {

  columns: string[] = ['name','brand','fertilizertype','quantity', 'unitprice', 'reorderpoint','fertilizerstatus','dointro'];
  headers: string[] = ['Name', 'Brand', 'Type', 'Quantity', 'Unit Price', 'Reorder','Status','IntroDate'];
  binders: string[] = ['name', 'fertilzerbrand.name', 'fertilizertype.name', 'quantity', 'unitprice', 'rop','fertilizerstatus.name','dointroduced'];

  cscolumns: string[] = ['csname', 'csbrand', 'cstype', 'csquantity', 'csunitprice', 'csreorderpoint','csstatus','csdointro'];
  csprompts: string[] = ['Search By Name', 'Search By Brand', 'Search By type', 'Search By Quantity', 'Search By Unitprice', 'Search By Orderpoint','Search By Status','Search By Date'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  fertilizer!: Fertilizer;
  oldfertilizer!: Fertilizer|undefined;

  selectedrow: any;

  fertilizers: Array<Fertilizer> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Fertilizer>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string ='assets/default.png';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

   fertilizertypes: Array<Fertilizertype> = [];
   fertilizerbrands: Array<Fertilizerbrand> = [];
   fertilizerstatuss: Array<Fertilizerstatus> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private fs:FertilizerService,
    private fbs:FertilizerbrandService,
    private fts:FertilizertypeService,
    private fss:FertilizerstatuService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csname": new FormControl(),
      "csbrand": new FormControl(),
      "cstype": new FormControl(),
      "csunitprice": new FormControl(),
      "csreorderpoint": new FormControl(),
      "csquantity": new FormControl(),
      "csstatus": new FormControl(),
      "csdointro": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssname": new FormControl(),
      "ssbrand": new FormControl(),
      "sstype": new FormControl(),
      "ssstatus": new FormControl(),

    });

    this.form = this.fb.group( {
      "name": new FormControl(),
      "quantity": new FormControl(),
      "unitprice": new FormControl(),
      "rop": new FormControl(),
      "dointroduced": new FormControl(),
      "fertilzerbrand": new FormControl(),
      "fertilizertype": new FormControl(),
      "fertilizerstatus": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.fbs.getAllList().then( (ferbrands: Fertilizerbrand[]) => {
      this.fertilizerbrands = ferbrands;
    });

    this.fts.getAllList().then( (fertyps: Fertilizertype[]) => {
      this.fertilizertypes = fertyps;
    });

    this.fss.getAllList().then( (fests: Fertilizerstatus[]) => {
      this.fertilizerstatuss = fests;
    });

    this.rs.get('fertilizer').then( (regs: []) => {
      this.regexes = regs;
      this.createForm();
    });



  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {
    this.form.controls['name'].setValidators([Validators.required,Validators.pattern(this.regexes['name']['regex'])]);
    this.form.controls['quantity'].setValidators([Validators.required,Validators.pattern("^\\d{1,6}(\\.\\d{1,2})?$")]);
    this.form.controls['unitprice'].setValidators([Validators.required,Validators.pattern("^\\d{1,4}(\\.\\d{1,2})?$")]);
    this.form.controls['rop'].setValidators([Validators.required,Validators.pattern("^\\d{1,3}(\\.\\d{1,2})?$")]);
    this.form.controls['dointroduced'].setValidators([Validators.required,]);
    this.form.controls['fertilzerbrand'].setValidators([Validators.required]);
    this.form.controls['fertilizertype'].setValidators([Validators.required]);
    this.form.controls['fertilizerstatus'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="dointroduced")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldfertilizer != undefined && control.valid) {
          // @ts-ignore
          if (value === this.fertilizer[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldfertilizer = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.fs.getAll(query)
      .then( (fertis: Fertilizer[]) => { this.fertilizers = fertis; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.fertilizers); this.data.paginator = this.paginator; } );

  }

  getModi(element: Fertilizer) {
    // return  element.number + '(' + element.callingname + ')';
  }


  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (fertilizer: Fertilizer, filter: string) => {

      return (csearchdata.csname==null || fertilizer.name.toLowerCase().includes(csearchdata.csname)) &&
        (csearchdata.csbrand==null || fertilizer.fertilzerbrand.name.toLowerCase().includes(csearchdata.csbrand)) &&
        (csearchdata.cstype==null || fertilizer.fertilizertype.name.toLowerCase().includes(csearchdata.cstype)) &&
        (csearchdata.csunitprice==null || fertilizer.unitprice.toString().includes(csearchdata.csunitprice)) &&
        (csearchdata.csreorderpoint==null || fertilizer.rop.toString().includes(csearchdata.csreorderpoint)) &&
        (csearchdata.csquantity==null || fertilizer.quantity.toString().includes(csearchdata.csquantity)) &&
        (csearchdata.csstatus==null || fertilizer.fertilizerstatus.name.toString().toLowerCase().includes(csearchdata.csstatus)) &&
        (csearchdata.csdointro==null || fertilizer.dointroduced.includes(csearchdata.csdointro));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let name = ssearchdata.ssname;
    let brandid = ssearchdata.ssbrand;
    let fertypeid = ssearchdata.sstype;
    let ferstatusid = ssearchdata.ssstatus;

    let query = "";

    if(name!=null && name.trim()!="") query = query + "&name=" + name;
    if(brandid!=null) query = query + "&brandid=" + brandid;
    if(fertypeid!=null) query = query + "&fertypeid=" + fertypeid;
    if(ferstatusid!=null) query = query + "&ferstatusid=" + ferstatusid;

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

    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Fertilizer Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.fertilizer = this.form.getRawValue();
      // console.log("FER"+this.fertilizer);

      let fertilizerdata: string ="";

      fertilizerdata = fertilizerdata + "<br> Name is : " + this.fertilizer.name;
      fertilizerdata = fertilizerdata + "<br> Brand is : " + this.fertilizer.fertilzerbrand.name;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Fertilizer Add", message: "Are you sure to Add the following Fertilizer? <br> <br> "+ fertilizerdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.fs.add(this.fertilizer).then( ( responce: []|undefined ) => {
            console.log("Res-"+responce);
            console.log("Un-"+responce==undefined);
            if(responce!=undefined) {
              // @ts-ignore
              console.log("Add-"+responce['id']+"-"+responce['url']+"-"+(responce['errors']==""));
              // @ts-ignore
              addstatus = responce['errors']=="";
              console.log("Add Sta-"+addstatus);
              if(!addstatus) {
                // @ts-ignore
                addmessage = responce['errors'];
              }
            }
            else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found";
            }

          }).finally( () => {

            if(addstatus) {
              addmessage = "Successfully Saved";
             this.loadForm();
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent,{
              width:'500px',
              data: {heading: "Status - Fertilizer Add", message: addmessage }
            });

            stsmsg.afterClosed().subscribe( async result => {
              if(!result) {return;}
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
        if(this.regexes[controlName]!=undefined)
        { errors = errors+"<br>"+ this.regexes[controlName]['message']; }
        else
        { errors = errors+"<br>Invalid "+ controlName; }
      }
    }
    return errors;
  }

  fillForm(fertilizer:Fertilizer) {

    this.enableButtons(false,true,true);

    this.selectedrow = fertilizer;

    this.fertilizer = JSON.parse(JSON.stringify(fertilizer));
    this.oldfertilizer = JSON.parse(JSON.stringify(fertilizer));

    // @ts-ignore
    this.fertilizer.fertilzerbrand = this.fertilizerbrands.find(fb => fb.id === this.fertilizer.fertilzerbrand.id);
    // @ts-ignore
    this.fertilizer.fertilizertype = this.fertilizertypes.find(ft => ft.id === this.fertilizer.fertilizertype.id);
    // @ts-ignore
    this.fertilizer.fertilizerstatus = this.fertilizerstatuss.find(fs => fs.id === this.fertilizer.fertilizerstatus.id);

    this.form.patchValue(this.fertilizer);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Fertilizer Update",
          message: "You have following Errors <br> " + errors }
      });

      errmsg.afterClosed().subscribe( async result => {
        if (!result) {
          return;
        }
      });

    }
    else {

      let updates:string = this.getUpdates();

      if (updates != "") {

        let updstatus:boolean = false;
        let updmessage:string = "Server Not Found";

        const confirm = this.dg.open(ConfirmComponent,{
          width:'500px',
          data: {heading: "Confirmation - Fertilizer Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.fertilizer = this.form.getRawValue();

            // @ts-ignore
            this.fertilizer.id = this.oldfertilizer.id;

            this.fs.update(this.fertilizer).then( (responce: [] | undefined) => {

              if(responce != undefined) {
                // @ts-ignore
                updstatus = responce['errors'] == "";

                if (!updstatus) {
                  // @ts-ignore
                  updmessage = responce['errors'];
                }
              }
              else {
                updstatus = false;
                updmessage = "Content Not Found";
              }

            }).finally( () => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.loadForm();
                this.loadTable("");

              }

              const stsmsg = this.dg.open(MessageComponent,{
                width:'500px',
                data: {heading: "Status - Fertilizer Update",
                  message: updmessage }
              });

              stsmsg.afterClosed().subscribe( async result => {if (!result) { return; } });

            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent,{
          width:'500px',
          data: {heading: "Confirmation - Fertilizer Update",
            message: "Nothing Changed" }
        });

        updmsg.afterClosed().subscribe( async result => {
          if (!result) {
            return;
          }
        });

      }

    }
  }

  getUpdates(): string {

    let updates: string = "";

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1) + " Changed";
      }
    }
    return updates;
  }

  delete() {

    const confirm = this.dg.open(ConfirmComponent,{
      width:'500px',
      data: {heading: "Confirmation - Fertilizer Delete",
        message: "Are you sure to delete following Fertilizer? <br> <br> "+ this.fertilizer.name }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.fs.delete(this.fertilizer.id).then( (responce: [] | undefined) => {

          if(responce != undefined) {
            // @ts-ignore
            delstatus = responce['errors'] == "";

            if (!delstatus) {
              // @ts-ignore
              delmessage = responce['errors'];
            }
          }
          else {
            delstatus = false;
            delmessage = "Content Not Found";
          }

        }).finally( () => {
          if (delstatus) {
            delmessage = "Successfully Deleted";

            this.loadForm();
            this.loadTable("");

          }

          const stsmsg = this.dg.open(MessageComponent,{
            width:'500px',
            data: {heading: "Status - Fertilizer Delete", message:delmessage }
          });

          stsmsg.afterClosed().subscribe( async result => {if (!result) { return; } });

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
