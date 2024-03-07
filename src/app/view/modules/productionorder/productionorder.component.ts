import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Fertilizer} from "../../../entity/fertilizer";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Fertilizertype} from "../../../entity/fertilizertype";
import {Fertilizerbrand} from "../../../entity/fertilizerbrand";
import {Fertilizerstatus} from "../../../entity/fertilizerstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {FertilizerService} from "../../../service/fertilizerservice";
import {FertilizerbrandService} from "../../../service/fertilizerbrandservice";
import {FertilizertypeService} from "../../../service/fertilizertypeservice";
import {FertilizerstatuService} from "../../../service/fertilizerstatuservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Productionorder} from "../../../entity/Productionorder";
import {ProductionorderService} from "../../../service/productionorderservice";
import {Employee} from "../../../entity/employee";
import {EmployeeService} from "../../../service/employeeservice";
import {Area} from "../../../entity/area";
import {ProductionorderstatusService} from "../../../service/productionorderstatusservice";
import {Productionorderstatus} from "../../../entity/productionorderstatus";
import {Areaservice} from "../../../service/areaservice";

@Component({
  selector: 'app-productionorder',
  templateUrl: './productionorder.component.html',
  styleUrls: ['./productionorder.component.css']
})
export class ProductionorderComponent {

  columns: string[] = ['date','time','area','quantity', 'humidity', 'description','productionorderstatus','teamaker'];
  headers: string[] = ['Date', 'Time', 'Area', 'Quantity', 'Humidity', 'Description','Status','Teamaker'];
  binders: string[] = ['date', 'time', 'area.code', 'quantity', 'humidity', 'description','productionorderstatus.name','teamaker.callingname'];

  cscolumns: string[] = ['csdate', 'cstime', 'csarea', 'csquantity','csstatus','csteamaker'];
  csprompts: string[] = ['Search By Date', 'Search By Time', 'Search By Area', 'Search By Quantity', 'Search By Status', 'Search By Teamaker'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  productionorder!: Productionorder;
  oldproductionorder!: Productionorder|undefined;

  selectedrow: any;

  productionorders: Array<Productionorder> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Productionorder>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  teamakers: Array<Employee> = [];
  areas: Array<Area> = [];
  producordestatuss: Array<Productionorderstatus> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private rs:RegexService,
    private productorderser:ProductionorderService,
    private proodestatus:ProductionorderstatusService,
    private empser:EmployeeService,
    private as:Areaservice,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csdate": new FormControl(),
      "cstime": new FormControl(),
      "csarea": new FormControl(),
      "csquantity": new FormControl(),
      "csstatus": new FormControl(),
      "csteamaker": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssarea": new FormControl(),
      "ssteamaker": new FormControl(),
      "ssstatus": new FormControl(),

    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "time": new FormControl(),
      "quantity": new FormControl(),
      "humidity": new FormControl(),
      "description": new FormControl(),
      "area": new FormControl(),
      "productionorderstatus": new FormControl(),
      "teamaker": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.empser.getTeaMakers().then( (teamkrs: Employee[]) => {
      this.teamakers = teamkrs;
    });

    this.proodestatus.getAllList().then( (proorstauss: Productionorderstatus[]) => {
      this.producordestatuss = proorstauss;
    });

    this.as.getAll("").then( (ares: Area[]) => {
      this.areas = ares;
    });

    this.rs.get('productionorder').then((regs:[])=> {
      this.regexes = regs;
      this.createForm();
    });


  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {
    this.form.controls['date'].setValidators([Validators.required,]);
    this.form.controls['time'].setValidators([Validators.required,]);
    this.form.controls['quantity'].setValidators([Validators.required,Validators.pattern(this.regexes['quantity']['regex'])]);
    this.form.controls['description'].setValidators([Validators.required,Validators.pattern(this.regexes['description']['regex'])]);
    this.form.controls['humidity'].setValidators([Validators.required,Validators.pattern("^\\d{1,2}(\\.\\d{1,2})?$")]);
    this.form.controls['area'].setValidators([Validators.required,]);
    this.form.controls['productionorderstatus'].setValidators([Validators.required]);
    this.form.controls['teamaker'].setValidators([Validators.required]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldproductionorder != undefined && control.valid) {
          // @ts-ignore
          if (value === this.productionorder[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldproductionorder = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.productorderser.getAll(query)
      .then( (proordes: Productionorder[]) => { this.productionorders = proordes; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.productionorders); this.data.paginator = this.paginator; } );

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (productionorder: Productionorder, filter: string) => {

      return (csearchdata.csdate==null || productionorder.date.includes(csearchdata.csdate)) &&
        (csearchdata.cstime==null || productionorder.time.includes(csearchdata.cstime)) &&
        (csearchdata.csarea==null || productionorder.area.code.includes(csearchdata.csarea)) &&
        (csearchdata.csquantity==null || productionorder.quantity.toString().includes(csearchdata.csquantity)) &&
        (csearchdata.csstatus==null || productionorder.productionorderstatus.name.toLowerCase().includes(csearchdata.csstatus)) &&
        (csearchdata.csteamaker==null || productionorder.teamaker.callingname.toLowerCase().includes(csearchdata.csteamaker)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let areaid = ssearchdata.ssarea;
    let teamakerid = ssearchdata.ssteamaker;
    let statusid = ssearchdata.ssstatus;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(date!=null) query = query + "&date=" + date;
    if(areaid!=null) query = query + "&areaid=" + areaid;
    if(teamakerid!=null) query = query + "&teamakerid=" + teamakerid;
    if(statusid!=null) query = query + "&statusid=" + statusid;

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
        data: {heading: "Errors - Production Order Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.productionorder = this.form.getRawValue();

      const productiontimeField = document.getElementById("productiontimeInput");

      // @ts-ignore
      const productiontimeValue = productiontimeField.value;

      const timeComponent = productiontimeValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.productionorder.time = `${hour1}:${minutes1}:${seconds1}`;

      let date = this.dp.transform(new Date(this.productionorder.date),'yyyy-MM-dd');

      // if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}


      let productionorderdata: string ="";

      productionorderdata = productionorderdata + "<br> Date is : " + date;
      productionorderdata = productionorderdata + "<br> Area is : " + this.productionorder.area.code;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Production Order Add", message: "Are you sure to Add the following Production Order? <br> <br> "+ productionorderdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.productorderser.add(this.productionorder).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Production Order Add", message: addmessage }
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
        // errors = errors+"<br>Invalid "+ controlName;
      }
    }
    return errors;
  }

  fillForm(producorder:Productionorder) {

    this.enableButtons(false,true,true);

    this.selectedrow = producorder;

    this.productionorder = JSON.parse(JSON.stringify(producorder));
    this.oldproductionorder = JSON.parse(JSON.stringify(producorder));

    // console.log(this.productionorder)

    // @ts-ignore
    this.productionorder.area = this.areas.find(ar => ar.id === this.productionorder.area.id);
    // @ts-ignore
    this.productionorder.teamaker = this.teamakers.find(tm => tm.id === this.productionorder.teamaker.id);
    // @ts-ignore
    this.productionorder.productionorderstatus = this.producordestatuss.find(proorsts => proorsts.id === this.productionorder.productionorderstatus.id);

    this.form.patchValue(this.productionorder);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Production Order Update",
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
          data: {heading: "Confirmation - Production Order Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.productionorder = this.form.getRawValue();

            // @ts-ignore
            this.productionorder.id = this.oldproductionorder.id;

            // @ts-ignore
            const productionordertimeValue = this.productionorder.time;

            const timeComponent = productionordertimeValue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.productionorder.time = `${hour1}:${minutes1}:${seconds1}`;

            this.productorderser.update(this.productionorder).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Production Order Update",
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
          data: {heading: "Confirmation - Production Order Update",
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

    let date = this.dp.transform(new Date(this.productionorder.date),'yyyy-MM-dd');

    const confirm = this.dg.open(ConfirmComponent,{
      width:'500px',
      data: {heading: "Confirmation - Production Order Delete",
        message: "Are you sure to delete following Production Order? <br> <br> Area is "+ this.productionorder.area.code+ "<br>Date is: "+ date }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.productorderser.delete(this.productionorder.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Production Order Delete", message:delmessage }
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
