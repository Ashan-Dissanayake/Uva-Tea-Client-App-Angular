import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Fertilizer} from "../../../entity/fertilizer";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Pluckingpayment} from "../../../entity/pluckingpayment";
import {PluckingpaymentService} from "../../../service/pluckingpaymentservice";
import {Employee} from "../../../entity/employee";
import {EmployeeService} from "../../../service/employeeservice";
import {PluckingService} from "../../../service/pluckingservice";
import {Plucking} from "../../../entity/plucking";

@Component({
  selector: 'app-pluckingpayment',
  templateUrl: './pluckingpayment.component.html',
  styleUrls: ['./pluckingpayment.component.css']
})
export class PluckingpaymentComponent {

  columns: string[] = ['startdate','enddate','plucker','issuer', 'dopayment', 'bonusqty','bonusperkg','bonuspayment','basicpayment','totalpayment'];
  headers: string[] = ['StartDate', 'EndDate', 'Plucker', 'Issuer', 'Payment Date', 'Bonus(kg)','BonusPer(kg)','Bonus Payment','Basic Payment','Total Payment'];
  binders: string[] = ['startdate', 'enddate', 'plucker.callingname', 'issuer.callingname', 'dopayment', 'bonusqty','bonusperkilo','bonuspayment','basicpayment','totalpayment'];

  cscolumns: string[] = ['csdostart', 'csdoend', 'csplucker', 'csissuer','csdopayment','csbonuspayment'];
  csprompts: string[] = ['Search By Start Date', 'Search By End Date', 'Search By Plucker', 'Search By Issuer', 'Search By Payment Date', 'Search By Bonus Payment'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  pluckingpayment!: Pluckingpayment;
  oldpluckingpayment!: Pluckingpayment|undefined;

  selectedrow: any;

  pluckingpayments: Array<Pluckingpayment> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Pluckingpayment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  pluckers: Array<Employee> = [];
  issuers: Array<Employee> = [];

  regexes: any;

  uiassist: UiAssist;

  basicpayment:number = 13500;
  bonusperkilo:number = 40;
  bonuspayment:number = 0;
  totalpayment:number = 0;
  bonusqty:number = 0;



  constructor(
    private fb:FormBuilder,
    private rs:RegexService,
    private pps:PluckingpaymentService,
    private es:EmployeeService,
    private ps:PluckingService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csdostart": new FormControl(),
      "csdoend": new FormControl(),
      "csplucker": new FormControl(),
      "csissuer": new FormControl(),
      "csdopayment": new FormControl(),
      "csbonuspayment": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssplucker": new FormControl(),
      "ssissuer": new FormControl(),
      "dopayment": new FormControl(),
    });

    this.form = this.fb.group( {
      "startdate": new FormControl(),
      "enddate": new FormControl(),
      "dopayment": new FormControl(),
      "bonusqty": new FormControl(),
      "bonusperkilo": new FormControl(),
      "bonuspayment": new FormControl(),
      "basicpayment": new FormControl(),
      "totalpayment": new FormControl(),
      "plucker": new FormControl(),
      "issuer": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    this.createView();

    this.es.getManagers().then( (mangrs: Employee[]) => {
      this.issuers = mangrs;
    });

    this.es.getPluckers().then( (plukrs: Employee[]) => {
      this.pluckers = plukrs;
    });

    // this.rs.get('fertilizer').then( (regs: []) => {
    //   this.regexes = regs;
    //   this.createForm();
    // });
    this.createForm();

  }

  getPluckerBonus(plucker:Employee) {

    if(this.form.controls['startdate'].value!=null && this.form.controls['enddate'].value!=null) {

      let dostart = this.form.controls['startdate'].value;
      let doend = this.form.controls['enddate'].value;

      dostart = this.dp.transform(new Date(dostart),'yyyy-MM-dd');
      doend = this.dp.transform(new Date(doend),'yyyy-MM-dd');

      let pluckerid = plucker.id;

      // let bonusqty:number = 0;

      let query = "";

      if(pluckerid!=null) query = query + "&pluckerid=" + pluckerid;
      if(dostart!=null) query = query + "&dostart=" + dostart;
      if(doend!=null) query = query + "&doend=" + doend;

      if(query!="") query = query.replace(/^./,"?");

      this.ps.getpluckerbonuss(query).then((pluckingbonus:Plucking)=>{

        if(pluckingbonus.empplucker!=null) {
          // console.log(pluckingbonus.empplucker.callingname+" Bonus "+pluckingbonus.bonus);
          this.bonusqty = pluckingbonus.bonus;

          this.form.controls['bonusqty'].setValue(this.bonusqty);
          this.form.controls['bonusperkilo'].setValue(this.bonusperkilo);
          this.form.controls['basicpayment'].setValue(this.basicpayment);

          this.bonuspayment = this.bonusperkilo * this.bonusqty;
          this.form.controls['bonuspayment'].setValue(this.bonuspayment);

          this.totalpayment = this.bonuspayment +this.basicpayment;
          this.form.controls['totalpayment'].setValue(this.totalpayment);

        }
        else{
          this.form.controls['bonusqty'].setValue(0);
          this.form.controls['bonusperkilo'].setValue(0);
          this.form.controls['bonuspayment'].setValue(0);
          this.form.controls['basicpayment'].setValue(this.basicpayment);
          this.form.controls['totalpayment'].setValue(this.basicpayment);
        }


      })
    }

  }

  setbonusperkgandbasicpayment() {

    this.bonusperkilo = this.form.controls['bonusperkilo'].value;
    this.basicpayment = this.form.controls['basicpayment'].value;


    this.bonuspayment = this.bonusperkilo * this.bonusqty;
    this.form.controls['bonuspayment'].setValue(this.bonuspayment);

    this.totalpayment = this.bonuspayment +this.basicpayment;
    this.form.controls['totalpayment'].setValue(this.totalpayment);

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {

    this.form.controls['startdate'].setValidators([Validators.required,]);
    this.form.controls['enddate'].setValidators([Validators.required]);
    this.form.controls['dopayment'].setValidators([Validators.required]);
    this.form.controls['bonusqty'].setValidators([Validators.required,]);
    this.form.controls['bonusperkilo'].setValidators([Validators.required,]);
    this.form.controls['bonuspayment'].setValidators([Validators.required,]);
    this.form.controls['basicpayment'].setValidators([Validators.required,]);
    this.form.controls['totalpayment'].setValidators([Validators.required,]);
    this.form.controls['plucker'].setValidators([Validators.required,]);
    this.form.controls['issuer'].setValidators([Validators.required,]);

    // this.form.controls['bonusqty'].setValue(34);


    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="startdate" || controlName =="enddate" || controlName =="dopayment")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldpluckingpayment != undefined && control.valid) {
          // @ts-ignore
          if (value === this.pluckingpayment[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldpluckingpayment = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.pps.getAll(query)
      .then( (pluckpayments: Pluckingpayment[]) => { this.pluckingpayments = pluckpayments; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.pluckingpayments); this.data.paginator = this.paginator; } );

  }


  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (pluckingpayment: Pluckingpayment, filter: string) => {

      return (csearchdata.csdostart==null || pluckingpayment.startdate.includes(csearchdata.csdostart)) &&
        (csearchdata.csdoend==null || pluckingpayment.enddate.includes(csearchdata.csdoend)) &&
        (csearchdata.csplucker==null || pluckingpayment.plucker.callingname.toLowerCase().includes(csearchdata.csplucker)) &&
        (csearchdata.csissuer==null || pluckingpayment.issuer.callingname.toLowerCase().includes(csearchdata.csissuer)) &&
        (csearchdata.csdopayment==null || pluckingpayment.dopayment.includes(csearchdata.csdopayment)) &&
        (csearchdata.csbonuspayment==null || pluckingpayment.bonuspayment.toString().includes(csearchdata.csbonuspayment));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let pluckerid = ssearchdata.ssplucker;
    let issuerid = ssearchdata.ssissuer;
    let dopayment = ssearchdata.dopayment;

    if(dopayment != null) {dopayment = this.dp.transform(new Date(dopayment),'yyyy-MM-dd');}

    let query = "";

    if(pluckerid!=null) query = query + "&pluckerid=" + pluckerid;
    if(issuerid!=null) query = query + "&issuerid=" + issuerid;
    if(dopayment!=null) query = query + "&dopayment=" + dopayment;

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
        data: {heading: "Errors - Plucking Payment Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.pluckingpayment = this.form.getRawValue();

      let pluckingpaymentdata: string ="";

      pluckingpaymentdata = pluckingpaymentdata + "<br> Payment Date is : " + this.dp.transform(new Date(this.pluckingpayment.dopayment),'yyyy-MM-dd');
      pluckingpaymentdata = pluckingpaymentdata + "<br> Plucker is : " + this.pluckingpayment.plucker.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Plucking Payment Add", message: "Are you sure to Add the following Payment? <br> <br> "+ pluckingpaymentdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.pps.add(this.pluckingpayment).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Plucking Payment Add", message: addmessage }
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
        // if(this.regexes[controlName]!=undefined)
        // { errors = errors+"<br>"+ this.regexes[controlName]['message']; }
        // else
        // { errors = errors+"<br>Invalid "+ controlName; }
        errors = errors+"<br>Invalid "+ controlName;
      }
    }
    return errors;
  }

  fillForm(pluckingpayment:Pluckingpayment) {

    this.enableButtons(false,true,true);

    this.selectedrow = pluckingpayment;

    this.pluckingpayment = JSON.parse(JSON.stringify(pluckingpayment));
    this.oldpluckingpayment = JSON.parse(JSON.stringify(pluckingpayment));

    // console.log(pluckingpayment.bonusqty);
    this.bonusqty = this.pluckingpayment.bonusqty;
    this.basicpayment = this.pluckingpayment.basicpayment;

    // @ts-ignore
    this.pluckingpayment.plucker = this.pluckers.find(pluck => pluck.id === this.pluckingpayment.plucker.id);
    // @ts-ignore
    this.pluckingpayment.issuer = this.issuers.find(isur => isur.id === this.pluckingpayment.issuer.id);

    this.form.patchValue(this.pluckingpayment);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Plucking Payment Update",
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
          data: {heading: "Confirmation - Plucking Payment Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.pluckingpayment = this.form.getRawValue();

            // @ts-ignore
            this.pluckingpayment.id = this.oldpluckingpayment.id;

            this.pps.update(this.pluckingpayment).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Plucking Payment Update",
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
          data: {heading: "Confirmation - Plucking Payment Update",
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
      data: {heading: "Confirmation - Plucking Payment Delete",
        message: "Are you sure to delete following Plucking Payment? <br> <br> Payment Date is "+ this.dp.transform(new Date(this.pluckingpayment.dopayment),'yyyy-MM-dd') }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.pps.delete(this.pluckingpayment.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Plucking Payment Delete", message:delmessage }
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
