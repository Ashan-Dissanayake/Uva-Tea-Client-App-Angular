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
import {Transport} from "../../../entity/transport";
import {TransportService} from "../../../service/transportservice";
import {Root} from "../../../entity/root";
import {Transportpurpose} from "../../../entity/transportpurpose";
import {TransportpurposeService} from "../../../service/transportpurposeservice";
import {Areaservice} from "../../../service/areaservice";
import {RootService} from "../../../service/rootservice";
import {TransportstatusService} from "../../../service/transportstatusservice";
import {Transportstatus} from "../../../entity/transportstatus";
import {Vehicle} from "../../../entity/vehicle";
import {Employee} from "../../../entity/employee";
import {VehicleService} from "../../../service/vehicleservice";
import {EmployeeService} from "../../../service/employeeservice";

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent {

  columns: string[] = ['number','date','sreading','ereading', 'root', 'description','driver','starttime','endtime','trastatus','tranpurpose'];
  headers: string[] = ['Vehi: Number', 'Date', 'StartReading', 'EndReading', 'Root', 'Description','Driver','Starttime','Endtime','Status','Purpose'];
  binders: string[] = ['vehicle.number','date','startreading', 'endreading', 'root.name','description','driver.callingname', 'strattime','endtime','transportstatus.name','transportpurpose.name'];

  cscolumns: string[] = ['csnumber', 'csdate', 'cssreading', 'csereading', 'csroot', 'csdescription','csdriver','csstarttime','csendtime','cstrastatus','cstranpurpose'];
  csprompts: string[] = ['Search By Number', 'Search By Date', 'Search By StratReading', 'Search By EndReading', 'Search By Root', 'Search By Description','Search By Driver','Search By StartTime','Search By Endtime','Search By Status','Search By purpose'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  transport!: Transport;
  oldtransport!: Transport|undefined;

  selectedrow: any;

  transports: Array<Transport> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Transport>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string ='assets/default.png';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  roots: Array<Root> = [];
  transportpuposes: Array<Transportpurpose> = [];
  transportstatuses: Array<Transportstatus> = [];
  vehicles: Array<Vehicle> = [];
  drivers: Array<Employee> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private ts:TransportService,
    private tps:TransportpurposeService,
    private tss:TransportstatusService,
    private vs:VehicleService,
    private es:EmployeeService,
    private rs:RootService,
    private regexs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csnumber": new FormControl(),
      "csdate": new FormControl(),
      "cssreading": new FormControl(),
      "csereading": new FormControl(),
      "csroot": new FormControl(),
      "csdescription": new FormControl(),
      "csdriver": new FormControl(),
      "csstarttime": new FormControl(),
      "csendtime": new FormControl(),
      "cstrastatus": new FormControl(),
      "cstranpurpose": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssnumber": new FormControl(),
      "ssdriver": new FormControl(),
      "ssdate": new FormControl(),
      "ssroot": new FormControl(),
      "sstrnspurpose": new FormControl(),

    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "startreading": new FormControl(),
      "endreading": new FormControl(),
      "description": new FormControl(),
      "strattime": new FormControl(),
      "endtime": new FormControl(),
      "vehicle": new FormControl(),
      "root": new FormControl(),
      "driver": new FormControl(),
      "transportstatus": new FormControl(),
      "transportpurpose": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.rs.getAllList().then( (roots: Root[]) => {
      this.roots = roots;
    });

    this.tps.getAllList().then( (tppuposes: Transportpurpose[]) => {
      this.transportpuposes = tppuposes;
    });

    this.tss.getAllList().then( (transstauss: Transportstatus[]) => {
      this.transportstatuses = transstauss;
    });

    this.es.getDrivers().then( (driverss: Employee[]) => {
      this.drivers = driverss;
    });

    this.vs.getAll("").then( (vehicles: Vehicle[]) => {
      this.vehicles = vehicles;
    });

    this.regexs.get('transport').then( (regs: []) => {
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
    this.form.controls['startreading'].setValidators([Validators.pattern(this.regexes['startreading']['regex'])]);
    this.form.controls['endreading'].setValidators([Validators.pattern(this.regexes['endreading']['regex'])]);
    this.form.controls['description'].setValidators([Validators.pattern(this.regexes['description']['regex'])]);
    this.form.controls['strattime'].setValidators([Validators.required,]);
    this.form.controls['endtime'].setValidators([Validators.required]);
    this.form.controls['vehicle'].setValidators([Validators.required]);
    this.form.controls['root'].setValidators([]);
    this.form.controls['driver'].setValidators([Validators.required,]);
    this.form.controls['transportstatus'].setValidators([Validators.required,]);
    this.form.controls['transportpurpose'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldtransport != undefined && control.valid) {
          // @ts-ignore
          if (value === this.transport[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldtransport = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.ts.getAll(query)
      .then( (traports: Transport[]) => { this.transports = traports; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.transports); this.data.paginator = this.paginator; } );

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (transport: Transport, filter: string) => {

      return (csearchdata.csnumber==null || transport.vehicle.number.includes(csearchdata.csnumber)) &&
        (csearchdata.csdate==null || transport.date.includes(csearchdata.csdate)) &&
        (csearchdata.cssreading==null || transport.startreading.toString().includes(csearchdata.cssreading)) &&
        (csearchdata.csereading==null || transport.endreading.toString().includes(csearchdata.csereading)) &&
        (csearchdata.csroot==null || transport.root.name.toLowerCase().includes(csearchdata.csroot)) &&
        (csearchdata.csdescription==null || transport.description.toLowerCase().includes(csearchdata.csdescription)) &&
        (csearchdata.csdriver==null || transport.driver.callingname.toLowerCase().includes(csearchdata.csdriver)) &&
        (csearchdata.csstarttime==null || transport.strattime.includes(csearchdata.csstarttime)) &&
        (csearchdata.csendtime==null || transport.endtime.includes(csearchdata.csendtime)) &&
        (csearchdata.cstrastatus==null || transport.transportstatus.name.toLowerCase().includes(csearchdata.cstrastatus)) &&
        (csearchdata.cstranpurpose==null || transport.transportpurpose.name.toLowerCase().includes(csearchdata.cstranpurpose));


    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let driver = ssearchdata.ssdriver;
    let date = ssearchdata.ssdate;
    let rootid = ssearchdata.ssroot;
    let transpurposeid = ssearchdata.sstrnspurpose;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(number!=null && number.trim()!="") query = query + "&number=" + number;
    if(driver!=null && driver.trim()!="") query = query + "&driver=" + driver;
    if(date!=null) query = query + "&date=" + date;
    if(rootid!=null) query = query + "&rootid=" + rootid;
    if(transpurposeid!=null) query = query + "&transpurposeid=" + transpurposeid;

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
        data: {heading: "Errors - Transport Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {

      this.transport = this.form.getRawValue();

      const starttime = document.getElementById("starttime");
      const endtime = document.getElementById("endtime");

      // @ts-ignore
      const starttimevalue = starttime.value;
      // @ts-ignore
      const endtimevalue = endtime.value;

      const starttimearry = starttimevalue.split(':')
      const starthour = starttimearry[0];
      const startminutes = starttimearry[1];
      const startseconds = "00";

      const endtimearry = endtimevalue.split(':')
      const endhour = endtimearry[0];
      const endminutes = endtimearry[1];
      const endseconds = "00";

      this.transport.strattime = `${starthour}:${startminutes}:${startseconds}`;
      this.transport.endtime = `${endhour}:${endminutes}:${endseconds}`;


      let transportdata: string ="";

      transportdata = transportdata + "<br> Number is : " + this.transport.vehicle.number;
      transportdata = transportdata + "<br> Driver is : " + this.transport.driver.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Transport Add", message: "Are you sure to Add the following Transport? <br> <br> "+ transportdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.ts.add(this.transport).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Transport Add", message: addmessage }
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

  fillForm(transport:Transport) {

    this.enableButtons(false,true,true);

    this.selectedrow = transport;

    this.transport = JSON.parse(JSON.stringify(transport));
    this.oldtransport = JSON.parse(JSON.stringify(transport));

    // @ts-ignore
    this.transport.transportpurpose = this.transportpuposes.find(tp => tp.id === this.transport.transportpurpose.id);
    // @ts-ignore
    this.transport.transportstatus = this.transportstatuses.find(ts => ts.id === this.transport.transportstatus.id);
    // @ts-ignore
    this.transport.vehicle = this.vehicles.find(v => v.id === this.transport.vehicle.id);

    if(this.transport.root!=null){
      // @ts-ignore
      this.transport.root = this.roots.find(rt => rt.id === this.transport.root.id);
    }
    // @ts-ignore
    this.transport.driver = this.drivers.find(dr => dr.id === this.transport.driver.id);

    this.form.patchValue(this.transport);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Transport Update",
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
          data: {heading: "Confirmation - Transport Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.transport = this.form.getRawValue();

            // @ts-ignore
            this.transport.id = this.oldtransport.id;

            const starttime = document.getElementById("starttime");
            const endtime = document.getElementById("endtime");

            // @ts-ignore
            const starttimevalue = starttime.value;
            // @ts-ignore
            const endtimevalue = endtime.value;

            const starttimearry = starttimevalue.split(':')
            const starthour = starttimearry[0];
            const startminutes = starttimearry[1];
            const startseconds = "00";

            const endtimearry = endtimevalue.split(':')
            const endhour = endtimearry[0];
            const endminutes = endtimearry[1];
            const endseconds = "00";

            this.transport.strattime = `${starthour}:${startminutes}:${startseconds}`;
            this.transport.endtime = `${endhour}:${endminutes}:${endseconds}`;

            this.ts.update(this.transport).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Transport Update",
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
          data: {heading: "Confirmation - Transport Update",
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
      data: {heading: "Confirmation - Transport Delete",
        message: "Are you sure to delete following Transport? <br> <br> "+ "Driver is "+ this.transport.driver.callingname + "<br>Vehicle No: "+this.transport.vehicle.number}
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.ts.delete(this.transport.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Transport Delete", message:delmessage }
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
