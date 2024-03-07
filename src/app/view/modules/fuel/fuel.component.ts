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
import {FuelService} from "../../../service/fuelservice";
import {Fuel} from "../../../entity/fuel";
import {Fueltype} from "../../../entity/fueltype";
import {Fuelstation} from "../../../entity/fuelstation";
import {Employee} from "../../../entity/employee";
import {Vehicle} from "../../../entity/vehicle";
import {FueltypeService} from "../../../service/fueltypeservice";
import {FuelstationService} from "../../../service/fuelstationservice";
import {VehicleService} from "../../../service/vehicleservice";
import {EmployeeService} from "../../../service/employeeservice";

@Component({
  selector: 'app-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.css']
})
export class FuelComponent {

  columns: string[] = ['date','qty','vehicle','fueltype', 'cost', 'meterreading','time','driveronduty','fuelstation'];
  headers: string[] = ['Date', 'Quantity(Liters)', 'Vehicle', 'FuelType', 'Cost(Rs)', 'Meterreading(km)','Time','Driver','FuelStation'];
  binders: string[] = ['date', 'qty', 'vehicle.number', 'fueltype.name', 'cost', 'meterreading','time','driveronduty.callingname','fuelstation.name'];

  cscolumns: string[] = ['csdate', 'csqty', 'csvehicle', 'csfueltype', 'cscost', 'csmeterreading','cstime','csdriveronduty','csfuelstation'];
  csprompts: string[] = ['Search By Date', 'Search By Quantity','Search By Number', 'Search By FuelType', 'Search By Cost', 'Search By Meterreading', 'Search By Time','Search By Driver','Search By Station'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  fuel!: Fuel;
  oldfuel!: Fuel|undefined;

  selectedrow: any;

  fuels: Array<Fuel> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Fuel>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string ='assets/default.png';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  fueltypes: Array<Fueltype> = [];
  fuelstations: Array<Fuelstation> = [];
  drivers: Array<Employee> = [];
  vehicles: Array<Vehicle> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private fuser:FuelService,
    private futy:FueltypeService,
    private fusta:FuelstationService,
    private vs:VehicleService,
    private es:EmployeeService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csdate": new FormControl(),
      "csqty": new FormControl(),
      "csvehicle": new FormControl(),
      "csfueltype": new FormControl(),
      "cscost": new FormControl(),
      "csmeterreading": new FormControl(),
      "cstime": new FormControl(),
      "csdriveronduty": new FormControl(),
      "csfuelstation": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "vehinumber": new FormControl(),
      "fueltype": new FormControl(),
      "driver": new FormControl(),
      "fuelstation": new FormControl(),
      "date": new FormControl(),
    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "qty": new FormControl(),
      "cost": new FormControl(),
      "meterreading": new FormControl(),
      "time": new FormControl(),
      "vehicle": new FormControl(),
      "fueltype": new FormControl(),
      "driveronduty": new FormControl(),
      "fuelstation": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.futy.getAllList().then((futyps: Fueltype[])=>{
      this.fueltypes = futyps;
    })

    this.fusta.getAllList().then((fustations: Fuelstation[])=>{
      this.fuelstations = fustations;
    })

    this.vs.getAll("").then( (vehicls: Vehicle[]) => {
      this.vehicles = vehicls;
    });

    this.es.getDrivers().then( (drivs: Employee[]) => {
      this.drivers = drivs;
    });

    this.rs.get('fuel').then((regs:[])=>{
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
    this.form.controls['qty'].setValidators([Validators.required,Validators.pattern("^\\d{1,3}(\\.\\d{1,2})?$")]);
    this.form.controls['cost'].setValidators([Validators.required,Validators.pattern("^\\d{1,6}(\\.\\d{1,2})?$")]);
    this.form.controls['meterreading'].setValidators([Validators.required,Validators.pattern(this.regexes['meterreading']['regex'])]);
    this.form.controls['time'].setValidators([Validators.required,]);
    this.form.controls['vehicle'].setValidators([Validators.required]);
    this.form.controls['fueltype'].setValidators([Validators.required]);
    this.form.controls['driveronduty'].setValidators([Validators.required,]);
    this.form.controls['fuelstation'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldfuel != undefined && control.valid) {

          // @ts-ignore
          if(typeof this.fuel[controlName] != "number") {

            // @ts-ignore
            if (value === this.fuel[controlName]) { control.markAsPristine(); }
            else { control.markAsDirty(); }

          }
          else {
            // @ts-ignore
            if( value === this.fuel[controlName].toString()) {control.markAsPristine();}
            else { control.markAsDirty(); }
          }

        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldfuel = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.fuser.getAll(query)
      .then( (fuels: Fuel[]) => { this.fuels = fuels; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.fuels); this.data.paginator = this.paginator; } );

  }


  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (fuel: Fuel, filter: string) => {

      return (csearchdata.csdate==null || fuel.date.includes(csearchdata.csdate)) &&
        (csearchdata.csqty==null || fuel.qty.toString().includes(csearchdata.csqty)) &&
        (csearchdata.cscost==null || fuel.cost.toString().includes(csearchdata.cscost)) &&
        (csearchdata.csvehicle==null || fuel.vehicle.number.includes(csearchdata.csvehicle)) &&
        (csearchdata.csfueltype==null || fuel.fueltype.name.toLowerCase().includes(csearchdata.csfueltype)) &&
        (csearchdata.csmeterreading==null || fuel.meterreading.toString().includes(csearchdata.csmeterreading)) &&
        (csearchdata.cstime==null || fuel.time.includes(csearchdata.cstime)) &&
        (csearchdata.csdriveronduty==null || fuel.driveronduty.callingname.toLowerCase().includes(csearchdata.csdriveronduty)) &&
        (csearchdata.csfuelstation==null || fuel.fuelstation.name.toLowerCase().includes(csearchdata.csfuelstation));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let vehiclenumber = ssearchdata.vehinumber;
    let fueltypeid = ssearchdata.fueltype;
    let driverid = ssearchdata.driver;
    let fuelstationid = ssearchdata.fuelstation;
    let date = ssearchdata.date;

    if(date != null) { date = this.dp.transform(new Date(date),'yyyy-MM-dd'); }

    let query = "";

    if(vehiclenumber!=null && vehiclenumber.trim()!="") query = query + "&vehiclenumber=" + vehiclenumber;
    if(fueltypeid!=null) query = query + "&fueltypeid=" + fueltypeid;
    if(driverid!=null) query = query + "&driverid=" + driverid;
    if(fuelstationid!=null) query = query + "&fuelstationid=" + fuelstationid;
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

    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Fuel Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.fuel = this.form.getRawValue();
      // console.log("FER"+this.fertilizer);

      const fillingtimeField = document.getElementById("fillingtimeInput");

      // @ts-ignore
      const fillingtimeValue = fillingtimeField.value;

      const timeComponent = fillingtimeValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.fuel.time = `${hour1}:${minutes1}:${seconds1}`;

      let fueldata: string ="";

      fueldata = fueldata + "<br> Vehicle Number is : " + this.fuel.vehicle.number;
      fueldata = fueldata + "<br> Driver Name is : " + this.fuel.driveronduty.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Fuel Add", message: "Are you sure to Add the following Fuel? <br> <br> "+ fueldata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.fuser.add(this.fuel).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Fuel Add", message: addmessage }
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

  fillForm(fuel:Fuel) {

    this.enableButtons(false,true,true);

    this.selectedrow = fuel;

    this.fuel = JSON.parse(JSON.stringify(fuel));
    this.oldfuel = JSON.parse(JSON.stringify(fuel));

    // @ts-ignore
    this.fuel.fueltype = this.fueltypes.find(fut => fut.id === this.fuel.fueltype.id);
    // @ts-ignore
    this.fuel.fuelstation = this.fuelstations.find(fst => fst.id === this.fuel.fuelstation.id);
    // @ts-ignore
    this.fuel.vehicle = this.vehicles.find(v => v.id === this.fuel.vehicle.id);
    // @ts-ignore
    this.fuel.driveronduty = this.drivers.find(dr => dr.id === this.fuel.driveronduty.id);

    this.form.patchValue(this.fuel);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Fuel Update",
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
          data: {heading: "Confirmation - Fuel Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.fuel = this.form.getRawValue();

            // @ts-ignore
            this.fuel.id = this.oldfuel.id;

            // @ts-ignore
            const fueltimevalue = this.fuel.time;

            const timeComponent = fueltimevalue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.fuel.time = `${hour1}:${minutes1}:${seconds1}`;

            this.fuser.update(this.fuel).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Fuel Update",
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
          data: {heading: "Confirmation - Fuel Update",
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
      data: {heading: "Confirmation - Fuel Delete",
        message: "Are you sure to delete following Fuel? <br> <br> "+ "Vehicle Number: "+this.fuel.vehicle.number +"<br>Date: "+ this.fuel.date }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.fuser.delete(this.fuel.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Fuel Delete", message:delmessage }
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
