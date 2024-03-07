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
import {Vehicle} from "../../../entity/vehicle";
import {VehicleService} from "../../../service/vehicleservice";
import {Vehiclestatus} from "../../../entity/vehiclestatus";
import {Vehicletype} from "../../../entity/vehicletype";
import {Vehiclebrand} from "../../../entity/vehiclebrand";
import {Vehiclemodel} from "../../../entity/vehiclemodel";
import {VehiclebrandService} from "../../../service/vehiclebrandservice";
import {VehiclemodelService} from "../../../service/vehiclemodelservice";
import {VehiclestatuService} from "../../../service/vehiclestatuservice";
import {VehicletypeService} from "../../../service/vehicletypeservice";
import {AuthorizationManager} from "../../../service/authorizationmanager";

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})

export class VehicleComponent {

  columns: string[] = ['brand','model','vehitype','date', 'number', 'yom','capacity','lastmilage','description','status'];
  headers: string[] = ['Brand', 'Model', 'Type', 'Date', 'Number', 'Year Of Manufacture','Capacity','Mileage','Description','Status'];
  binders: string[] = ['vehiclemodel.vehiclebrand.name', 'vehiclemodel.name','vehicletype.name', 'doattach', 'number', 'yom', 'capacity','lastmeterreading','description','vehiclestatus.name'];

  cscolumns: string[] = ['csbrand', 'csmodel', 'csvehitype', 'csdate', 'csnumber', 'csyom','cscapacity','cslastmilage','csdescription','csstatus'];
  csprompts: string[] = ['Search By Brand', 'Search By Model', 'Search By Date', 'Search By Number', 'Search By YOM', 'Search By Capacity','Search By Mileage','Search By Description','Search By Status'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  vehicle!: Vehicle;
  oldvehicle!: Vehicle|undefined;

  selectedrow: any;

  vehicles: Array<Vehicle> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Vehicle>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  vehiclestatuss: Array<Vehiclestatus> = [];
  vehiclestypes: Array<Vehicletype> = [];
  vehiclebrands: Array<Vehiclebrand> = [];
  vehiclemodels: Array<Vehiclemodel> = [];


  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private vs:VehicleService,
    private vbs:VehiclebrandService,
    private vms:VehiclemodelService,
    private vss:VehiclestatuService,
    private vts:VehicletypeService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe,
    public authService:AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csbrand": new FormControl(),
      "csmodel": new FormControl(),
      "csvehitype": new FormControl(),
      "csdate": new FormControl(),
      "csnumber": new FormControl(),
      "csyom": new FormControl(),
      "cscapacity": new FormControl(),
      "cslastmilage": new FormControl(),
      "csdescription": new FormControl(),
      "csstatus": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssnumber": new FormControl(),
      "ssvehiclestatus": new FormControl(),
      "ssvehicletype": new FormControl(),
      "ssvehiclebrand": new FormControl(),

    });

    this.form = this.fb.group( {
      "doattach": new FormControl(),
      "number": new FormControl(),
      "yom": new FormControl(),
      "lastmeterreading": new FormControl(),
      "capacity": new FormControl(),
      "description": new FormControl(),
      "vehiclemodel": new FormControl(),
      "vehicletype": new FormControl(),
      "vehiclestatus": new FormControl(),

      "vehiclebrand": new FormControl(),
    }, {updateOn:'change'});

  }



  ngOnInit() {
    this.initialize();
  }

  loadBrandModels(vehiclebrand: Vehiclebrand){
    const branId = vehiclebrand.id;

    this.vms.getByBrandModels(branId).then( (vehimodls: Vehiclemodel[]) => {
      this.vehiclemodels = vehimodls;
    } );

  }

  initialize() {
    this.createView();

    this.vbs.getAllList().then( (vehibrands: Vehiclebrand[]) => {
      this.vehiclebrands = vehibrands;
    });

    // this.vms.getAllList().then( (vehimodels: Vehiclemodel[]) => {
    //   this.vehiclemodels = vehimodels;
    // });

    this.vss.getAllList().then( (vehistatuss: Vehiclestatus[]) => {
      this.vehiclestatuss = vehistatuss;
    });

    this.vts.getAllList().then( (vehitypes: Vehicletype[]) => {
      this.vehiclestypes = vehitypes;
    });

    this.rs.get('vehicle').then((regs:[])=> {
      this.regexes = regs;
      this.createForm();
    });


  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {
    this.form.controls['doattach'].setValidators([Validators.required,]);
    this.form.controls['number'].setValidators([Validators.required,Validators.pattern(this.regexes['number']['regex'])]);
    this.form.controls['yom'].setValidators([Validators.required,Validators.pattern(this.regexes['yom']['regex'])]);
    this.form.controls['lastmeterreading'].setValidators([Validators.required,Validators.pattern(this.regexes['lastmeterreading']['regex'])]);
    this.form.controls['capacity'].setValidators([Validators.required,Validators.pattern(this.regexes['capacity']['regex'])]);
    this.form.controls['description'].setValidators([Validators.required,Validators.pattern(this.regexes['description']['regex'])]);
    this.form.controls['vehiclemodel'].setValidators([Validators.required]);
    this.form.controls['vehicletype'].setValidators([Validators.required,]);
    this.form.controls['vehiclestatus'].setValidators([Validators.required,]);

    this.form.controls['vehiclebrand'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="doattach")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldvehicle != undefined && control.valid) {
          // @ts-ignore
          if (value === this.vehicle[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldvehicle = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.vs.getAll(query)
      .then( (vehs: Vehicle[]) => { this.vehicles = vehs; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.vehicles); this.data.paginator = this.paginator;} );

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (vehicle: Vehicle, filter: string) => {

      return (csearchdata.csbrand==null || vehicle.vehiclemodel.vehiclebrand.name.toLowerCase().includes(csearchdata.csbrand)) &&
        (csearchdata.csmodel==null || vehicle.vehiclemodel.name.toLowerCase().includes(csearchdata.csmodel)) &&
        (csearchdata.csvehitype==null || vehicle.vehicletype.name.toLowerCase().includes(csearchdata.csvehitype)) &&
        (csearchdata.csdate==null || vehicle.doattach.includes(csearchdata.csdate)) &&
        (csearchdata.csnumber==null || vehicle.number.includes(csearchdata.csnumber)) &&
        (csearchdata.csyom==null || vehicle.yom.toString().includes(csearchdata.csyom)) &&
        (csearchdata.cscapacity==null || vehicle.capacity.toString().includes(csearchdata.cscapacity)) &&
        (csearchdata.cslastmilage==null || vehicle.lastmeterreading.toString().includes(csearchdata.cslastmilage)) &&
        (csearchdata.csdescription==null || vehicle.description.toLowerCase().includes(csearchdata.csdescription)) &&
        (csearchdata.cscapacity==null || vehicle.capacity.toString().includes(csearchdata.cscapacity)) &&
        (csearchdata.csstatus==null || vehicle.vehiclestatus.name.toLowerCase().includes(csearchdata.csstatus));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let vehiclestatusid = ssearchdata.ssvehiclestatus;
    let vehicletypeid = ssearchdata.ssvehicletype;
    let vehiclebrandid = ssearchdata.ssvehiclebrand;

    let query = "";

    if(number!=null && number.trim()!="") query = query + "&number=" + number;
  if(vehiclestatusid!=null) query = query + "&vehiclestatusid=" + vehiclestatusid;
  if(vehicletypeid!=null) query = query + "&vehicletypeid=" + vehicletypeid;
  if(vehiclebrandid!=null) query = query + "&vehiclebrandid=" + vehiclebrandid;

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
        data: {heading: "Errors - Vehicle Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.vehicle = this.form.getRawValue();

      let vehicledata: string ="";

      vehicledata = vehicledata + "<br> Model is : " + this.vehicle.vehiclemodel.name;
      vehicledata = vehicledata + "<br> Number is : " + this.vehicle.number;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Vehicle Add", message: "Are you sure to Add the following Vehicle? <br> <br> "+ vehicledata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.vs.add(this.vehicle).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Vehicle Add", message: addmessage }
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
        // errors = errors+"<br>Invalid "+ controlName;
        if(this.regexes[controlName]!=undefined)
        { errors = errors+"<br>"+ this.regexes[controlName]['message']; }
        else
        { errors = errors+"<br>Invalid "+ controlName; }
      }
    }
    return errors;
  }

  fillForm(vehicle:Vehicle) {

    this.enableButtons(false,true,true);

    this.selectedrow = vehicle;

    this.vehicle = JSON.parse(JSON.stringify(vehicle));
    // console.log("Brand "+this.vehicle.vehiclebrand);
    // console.log("Model "+this.vehicle.vehiclemodel.name);

    this.oldvehicle = JSON.parse(JSON.stringify(vehicle));

    // this.vms.getByBrandModels(vehicle.vehiclemodel.vehiclebrand.id).then( (vehimodls: Vehiclemodel[]) => {
    //   this.vehiclemodels = vehimodls;
    //
    // } );

    // // @ts-ignore
    // this.vehicle.vehiclemodel = this.vehiclemodels.find(vm => vm.id === this.vehicle.vehiclemodel.id);
    // @ts-ignore
    this.vehicle.vehicletype = this.vehiclestypes.find(vt => vt.id === this.vehicle.vehicletype.id);
    // @ts-ignore
    this.vehicle.vehiclestatus = this.vehiclestatuss.find(vs => vs.id === this.vehicle.vehiclestatus.id);

    this.vbs.getAllList().then( (vehibrands: Vehiclebrand[]) => {
      this.vehiclebrands = vehibrands;
      // @ts-ignore
      this.vehicle.vehiclebrand = this.vehiclebrands.find(vb=> vb.id === this.vehicle.vehiclemodel.vehiclebrand.id);
    });

    this.vms.getByBrandModels(vehicle.vehiclemodel.vehiclebrand.id).then( (vehimodls: Vehiclemodel[]) => {
      this.vehiclemodels = vehimodls;
      // @ts-ignore
      this.vehicle.vehiclemodel = this.vehiclemodels.find(vm => vm.id === this.vehicle.vehiclemodel.id);

    }).finally(()=>{
      this.form.patchValue(this.vehicle);
      this.form.markAsPristine();
    });



    // this.form.patchValue(this.vehicle);
    // this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Vehicle Update",
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
          data: {heading: "Confirmation - Vehicle Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.vehicle = this.form.getRawValue();

            // @ts-ignore
            this.vehicle.id = this.oldvehicle.id;

            this.vs.update(this.vehicle).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Vehicle Update",
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
          data: {heading: "Confirmation - Vehicle Update",
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
      data: {heading: "Confirmation - Vehicle Delete",
        message: "Are you sure to delete following Vehicle? <br> <br> Number: "+ this.vehicle.number }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.vs.delete(this.vehicle.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Vehicle Delete", message:delmessage }
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
