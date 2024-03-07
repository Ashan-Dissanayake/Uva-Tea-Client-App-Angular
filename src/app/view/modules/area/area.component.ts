import {Component, Input, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Employee} from "../../../entity/employee";
import {Area} from "../../../entity/area";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Areaservice} from "../../../service/areaservice";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {RootService} from "../../../service/rootservice";
import {Root} from "../../../entity/root";
import {AreacategoryService} from "../../../service/areacategoryservice";
import {Areacategory} from "../../../entity/areacategory";
import {EmployeeService} from "../../../service/employeeservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {AreastatusService} from "../../../service/areastatusservice";
import {Areastatus} from "../../../entity/areastatus";
import {RegexService} from "../../../service/regexservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent {

  columns: string[] = ['code','fieldofficer','supervisor','areacategory','acres','plantcount','doproofing', 'root','modi'];
  headers: string[] = ['Code', 'Field-Officer', 'Supervisor', 'Category', 'Acres', 'Plant Count', 'Proofing Date','Root','Modify'];
  binders: string[] = ['code', 'empfieldofficer.fullname', 'empsupervisor.fullname', 'areacategory.name', 'acres', 'plantcount','doproofing','root.name','getModi()'];

  cscolumns: string[] = ['cscode', 'csempfieldofficer', 'csempsupervisor', 'csareacategory', 'csacres', 'csplantcount','csdoproofing','csroot','csmodi'];
  csprompts: string[] = ['Search By Code','Search By FieldOfficer', 'Search By Supervisor', 'Search By Category', 'Search By Acres', 'Search By Plantcount', 'Search By ProofingDate','Search By Root','Search By Modi'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  area!: Area;
  oldarea!: Area|undefined;

  selectedrow: any;

  areas : Array<Area> = [];
  roots: Array<Root> = [];
  areacategorys: Array<Areacategory> = [];
  fieldofficers: Array<Employee> = [];
  supervisors: Array<Employee> = [];
  supervisorfieldofficer: Array<Employee> = [];
  areastatusses: Array<Areastatus> = [];

  regexes:any;

  imageurl: string = '';
  imageempurl: string = 'assets/mapdefault.jpeg';

  data!: MatTableDataSource<Area>
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  uiassist!: UiAssist;

  mindate = new Date();

  constructor(
    private as: Areaservice,
    private fb: FormBuilder,
    private rootser:RootService,
    private areacateser: AreacategoryService,
    private es: EmployeeService,
    private arestatus: AreastatusService,
    private rs: RegexService,
    private dg: MatDialog,
    private dp: DatePipe,
    ) {

    this.uiassist = new UiAssist(this);

    this.csearch = fb.group( {

      "cscode": new FormControl(),
      "csempfieldofficer": new FormControl(),
      "csempsupervisor": new FormControl(),
      "csareacategory": new FormControl(),
      "csacres": new FormControl(),
      "csplantcount": new FormControl(),
      "csdoproofing": new FormControl(),
      "csroot": new FormControl(),
      "csmodi": new FormControl(),
    });

    this.ssearch = fb.group( {

      "sscode": new FormControl(),
      "ssempfieldofficer": new FormControl(),
      "ssempsupervisor": new FormControl(),
      "ssareacategory": new FormControl(),
      "ssroot": new FormControl(),
    });

    this.form = fb.group( {

      "code": new FormControl('',[ Validators.required,Validators.pattern("^[A-Z]-\\d{3}$") ]),
      "acres": new FormControl('',[ Validators.required]),
      "map": new FormControl(),
      "doattached": new FormControl(),
      "plantcount": new FormControl('', [Validators.required]),
      "doproofing": new FormControl('',[Validators.required]),
      "root": new FormControl('',[Validators.required]),
      "areastatus": new FormControl('',[Validators.required]),
      "empsupervisor": new FormControl('',[Validators.required]),
      "empfieldofficer": new FormControl('',[Validators.required]),
      "areacategory": new FormControl('',[Validators.required]),
      }, {updateOn:'change'} );

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    this.createView();

    this.rootser.getAllList().then( (root: Root[]) => {
      this.roots = root;
    });

    this.areacateser.getAllList().then( (areacats: Areacategory[])=>{
      this.areacategorys = areacats;
    });

    this.arestatus.getAllList().then( (areastatu: Areastatus[])=>{
      this.areastatusses = areastatu;
    });

    this.es.getsuperandfieldofficer().then( (supervifield:Employee[])=> {
      this.supervisorfieldofficer = supervifield;
    }).finally( ()=> {
      this.supervisorfieldofficer.forEach( (supfield: Employee) => {
        if(supfield.designation.name == 'Field-Officer') this.fieldofficers.push(supfield)
        else this.supervisors.push(supfield)
      })
    });

    this.rs.get('area').then( (regs: []) => {
      this.regexes = regs;
      this.createForm();
    });

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {

    this.form.controls['code'].setValidators([Validators.required,Validators.pattern(this.regexes['code']['regex'])]);
    this.form.controls['doproofing'].setValidators([Validators.required]);
    this.form.controls['doattached'].setValidators([Validators.required]);
    this.form.controls['acres'].setValidators([Validators.required,Validators.pattern("^\\d{1,3}(\\.\\d{1,2})?$")]);
    this.form.controls['root'].setValidators([Validators.required]);
    this.form.controls['plantcount'].setValidators([Validators.required]);
    this.form.controls['areastatus'].setValidators([Validators.required]);
    this.form.controls['empsupervisor'].setValidators([Validators.required]);
    this.form.controls['empfieldofficer'].setValidators([Validators.required]);
    this.form.controls['areacategory'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="doproofing" || controlName =="doattached"){
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');
        }
        if ( this.oldarea !=undefined && control.valid) {
          // @ts-ignore
          if (value === this.area[controlName]) control.markAsPristine();
          else control.markAsDirty();
        }
        else control.markAsPristine();

      });

    }

    this.loadForm();

  }

  loadForm() {
    this.oldarea = undefined;
    this.form.reset();
    this.ClearImage();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {
    this.as.getAll(query)
      .then( (areas: Area[]) => { this.areas = areas; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( () => { this.data = new MatTableDataSource(this.areas); this.data.paginator = this.paginator; } )

  }
  getModi(element: Area) {
    if(element.empfieldofficer==null)
      return element.code + '(--)';
      else
    return  element.code + '(' + element.empfieldofficer.callingname + ')';
  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (area: Area, filter: string) => {

      return (csearchdata.cscode==null || area.code.includes(csearchdata.cscode)) &&
        (csearchdata.csempfieldofficer==null || area.empfieldofficer.fullname.toLowerCase().includes(csearchdata.csempfieldofficer)) &&
        (csearchdata.csempsupervisor==null || area.empsupervisor.fullname.toLowerCase().includes(csearchdata.csempsupervisor)) &&
        (csearchdata.csareacategory==null || area.areacategory.name.includes(csearchdata.csareacategory)) &&
         (csearchdata.csacres==null || area.acres.toString().includes(csearchdata.csacres) ) &&
        (csearchdata.csdoproofing==null || area.doproofing.toLowerCase().includes(csearchdata.csdoproofing)) &&
        (csearchdata.csroot==null || area.root.name.toLowerCase().includes(csearchdata.csroot)) &&
        (csearchdata.csplantcount==null || area.plantcount.toString().includes(csearchdata.csplantcount)) &&
        (csearchdata.csmodi==null || this.getModi(area).toLowerCase().includes(csearchdata.csmodi)) ;

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let code = ssearchdata.sscode;
    let fieldofficerid = ssearchdata.ssempfieldofficer;
    let supervisorid = ssearchdata.ssempsupervisor;
    let areacategoryid = ssearchdata.ssareacategory;
    let rootid = ssearchdata.ssroot;

    let query = "";

    if(code!=null && code.trim()!="") query = query + "&code=" + code;
    if(fieldofficerid!=null) query = query + "&fieldofficerid=" + fieldofficerid;
    if(supervisorid!=null) query = query + "&supervisorid=" + supervisorid;
    if(areacategoryid!=null) query = query + "&areacategoryid=" + areacategoryid;
    if(rootid!=null) query = query + "&rootid=" + rootid;

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

  selectImage(e:any):void {
    if(e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event:any)=> {
        this.imageempurl = event.target.result;
        this.form.controls['map'].clearValidators();
      }
    }
  }

  ClearImage():void {
    this.imageempurl = 'assets/mapdefault.jpeg';
    //this.form.controls['map'].setErrors( {'required': false})
  }

  add() {

    let errors = this.getErrors();

    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Area Add", message: "You have following Errors <br> "+ errors}
      });
      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.area = this.form.getRawValue();
      this.area.map = btoa(this.imageempurl);
      console.log("Map-After"+ this.area.map);

      let areadata: string ="";

      areadata = areadata + "<br> Code is : " + this.area.code;
      areadata = areadata + "<br> Root is : " + this.area.root.name;
      areadata = areadata + "<br> Field-Officer is : " + this.area.empfieldofficer.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Area Add", message: "Are you sure to Add the following Area? <br> <br> "+ areadata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          // console.log("EmployeeService.add(emp)");
          this.as.add(this.area).then( ( responce: []|undefined ) => {
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
              this.form.reset();
              this.ClearImage();
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent,{
              width:'500px',
              data: {heading: "Status - Area Add", message: addmessage }
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

  fillForm(area:Area) {

    this.enableButtons(false,true,true);

    this.selectedrow = area;

    this.area = JSON.parse(JSON.stringify(area));
    this.oldarea = JSON.parse(JSON.stringify(area));

    if (this.area.map != null) {
      this.imageempurl = atob(this.area.map);
      this.form.controls['map'].clearValidators();
    } else {
      this.ClearImage();
    }

    this.area.map = "";

    // @ts-ignore
    this.area.root = this.roots.find(r => r.id === this.area.root.id);
    // @ts-ignore
    this.area.areastatus = this.areastatusses.find(s => s.id === this.area.areastatus.id);
    // @ts-ignore
    this.area.areacategory = this.areacategorys.find(c => c.id === this.area.areacategory.id);

    if(this.area.empfieldofficer != null)
      // @ts-ignore
      this.area.empfieldofficer = this.fieldofficers.find(fo => fo.id === this.area.empfieldofficer.id );

    // @ts-ignore
    this.area.empsupervisor = this.supervisors.find(sv => sv.id === this.area.empsupervisor.id);

    this.form.patchValue(this.area);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Area Update",
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
          data: {heading: "Confirmation - Area Update",
            message: "Are you sure to Save following Updates? <br><br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            // console.log("Employee Service Update");
            this.area = this.form.getRawValue();

            if(this.form.controls['map'].dirty) this.area.map = btoa(this.imageempurl);
            else { // @ts-ignore
              this.area.map = this.oldarea.map;
            }

            // @ts-ignore
            this.area.id = this.oldarea.id;

            this.as.update(this.area).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Area Update", message: updmessage }
              });

              stsmsg.afterClosed().subscribe( async result => {if (!result) { return; } });

            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent,{
          width:'500px',
          data: {heading: "Confirmation - Area Update",
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
      data: {heading: "Confirmation - Area Delete",
        message: "Are you sure to delete following Area? <br> <br> "+ this.area.code }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.as.delete(this.area.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Area Delete", message:delmessage }
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
