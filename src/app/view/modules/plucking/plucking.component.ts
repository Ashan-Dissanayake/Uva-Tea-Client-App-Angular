import {Component, ViewChild} from '@angular/core';
import {PluckingService} from "../../../service/pluckingservice";
import {MatTableDataSource} from "@angular/material/table";
import {Plucking} from "../../../entity/plucking";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Employee} from "../../../entity/employee";
import {LeaftypeService} from "../../../service/leaftypeservice";
import {Leaftype} from "../../../entity/leaftype";
import {Pluckingsession} from "../../../entity/pluckingsession";
import {PluckingsessionService} from "../../../service/pluckingsessionservice";
import {Area} from "../../../entity/area";
import {Areaservice} from "../../../service/areaservice";
import {EmployeeService} from "../../../service/employeeservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {RegexService} from "../../../service/regexservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-plucking',
  templateUrl: './plucking.component.html',
  styleUrls: ['./plucking.component.css']
})
export class PluckingComponent {

  columns: string[] = ['area','pluckername','session','date', 'time', 'leaftype','qty','bonus','kankaniname'];
  headers: string[] = ['Area', 'Plucker Name', 'Session', 'Date', 'Time', 'Leaf Type','Quantity(kg)','Bonus(kg)','Kankani Name'];
  binders: string[] = ['area.code', 'empplucker.callingname', 'pluckingseesion.name', 'date', 'time', 'leaftype.name','qty','bonus','empkankani.callingname'];

  cscolumns: string[] = ['csarea','cspluckername','cssession','csdate','cstime','csleaftype','csqty','csbonus','cskankaniname'];
  csprompts: string[] = ['Search By Area','Search By Plucker','Search By Session','Search By Date','Search By Time','Search By LeafType','Search By Quantity','Search By Bonus','Search By Kankani'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  selectedrow:any;

  plucking!:Plucking;
  oldplucking!: Plucking|undefined;

  regexes:any;

  pluckings: Array<Plucking> = [];
  leaftypes: Array<Leaftype> = [];
  areas: Array<Area> = [];
  pluckers:Array<Employee> = [];
  kankanis:Array<Employee> = [];
  pluckingsessions: Array<Pluckingsession> = [];

  data!: MatTableDataSource<Plucking>
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  imageurl: string ='';

  uiassist: UiAssist;

  constructor(private pluckingservice: PluckingService,
              private fb: FormBuilder,
              private lts: LeaftypeService,
              private plusessions: PluckingsessionService,
              private areaser: Areaservice,
              private es: EmployeeService,
              private dg: MatDialog,
              private dp: DatePipe,
              private rs: RegexService

              ) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group({
      "csarea":new FormControl(),
      "cspluckername":new FormControl(),
      "cssession":new FormControl(),
      "csdate":new FormControl(),
      "cstime":new FormControl(),
      "csleaftype":new FormControl(),
      "csqty":new FormControl(),
      "csbonus":new FormControl(),
      "cskankaniname":new FormControl(),
    });

    this.ssearch = this.fb.group({

     "ssarea":new FormControl(),
     "sspluckername":new FormControl(),
     "sssession":new FormControl(),
     "ssdate":new FormControl(),
     "ssleaftype":new FormControl(),
     "sskankaniname":new FormControl(),

    });

    this.form = this.fb.group({
      "date":new FormControl(),
      "time":new FormControl('',[Validators.required]),
      "qty":new FormControl(),
      "bonus":new FormControl(),
      "area":new FormControl(),
      "empplucker":new FormControl(),
      "pluckingseesion":new FormControl(),
      "leaftype":new FormControl(),
      "empkankani":new FormControl(),

    },{updateOn:'change'});



  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    this.createView();

    this.lts.getAllList().then( (leafts: Leaftype[]) => {
      this.leaftypes = leafts;
      console.log("leafTy-"+ this.leaftypes);
      });

    this.plusessions.getAllList().then( (plucksessions: Pluckingsession[]) => {
      this.pluckingsessions = plucksessions;
      console.log("PluckSession-"+ this.pluckingsessions);
    });

    this.areaser.getAll("").then( (ara: Area[]) => {
      this.areas = ara;
      console.log("Areas-"+ this.areas);
    });

    this.es.getPluckers().then( (pluk: Employee[]) => {
      this.pluckers = pluk;
      console.log("Pluckrers-"+ this.pluckers);
    });

    this.es.getKankanis().then( (kan: Employee[]) => {
      this.kankanis = kan;
      console.log("Kankanis-"+ this.kankanis);
    });

    this.rs.get('plucking').then( (regs:[]) => {
      this.regexes = regs;
      console.log("Regex"+ this.regexes);
      this.createForm();
    });





  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  getModi(element: Plucking) {
    // return  element.number + '(' + element.callingname + ')';
  }

  loadTable(query:string) {

    this.pluckingservice.getAll(query)
      .then( (pluck: Plucking[]) => { this.pluckings = pluck; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> {
        this.data = new MatTableDataSource(this.pluckings); this.data.paginator = this.paginator;
        console.log("pluck:" + this.pluckings);
      } );

  }

  createForm() {
    this.form.controls['date'].setValidators([Validators.required,]);
    this.form.controls['time'].setValidators([Validators.required]);
    this.form.controls['qty'].setValidators([Validators.required,Validators.pattern(this.regexes['qty']['regex']) ]);
    // this.form.controls['bonus'].setValidators([Validators.required]);
    this.form.controls['area'].setValidators([Validators.required]);
    this.form.controls['empplucker'].setValidators([Validators.required]);
    this.form.controls['pluckingseesion'].setValidators([Validators.required]);
    this.form.controls['leaftype'].setValidators([Validators.required]);
    this.form.controls['empkankani'].setValidators([Validators.required]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldplucking != undefined && control.valid) {
          // @ts-ignore
          if (value === this.plucking[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();

  }

  loadForm() {
    this.oldplucking = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow= null;
  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();
    console.log(csearchdata);

    this.data.filterPredicate = (plucking: Plucking, filter: string) => {

      return (csearchdata.csarea==null || plucking.area.code.toLowerCase().includes(csearchdata.csarea)) &&
        (csearchdata.cspluckername==null || plucking.empplucker.callingname.toLowerCase().includes(csearchdata.cspluckername)) &&
        (csearchdata.cssession==null || plucking.pluckingseesion.name.toLowerCase().includes(csearchdata.cssession)) &&
        (csearchdata.csdate==null || plucking.date.toLowerCase().includes(csearchdata.csdate)) &&
        (csearchdata.cstime==null || plucking.time.toLowerCase().includes(csearchdata.cstime)) &&
        (csearchdata.csleaftype==null || plucking.leaftype.name.toLowerCase().includes(csearchdata.csleaftype)) &&
        (csearchdata.csqty==null || plucking.qty.toString().includes(csearchdata.csqty)) &&
        (csearchdata.csbonus==null || plucking.bonus.toString().includes(csearchdata.csbonus)) &&
        (csearchdata.cskankaniname==null || plucking.empkankani.callingname.toLowerCase().includes(csearchdata.cskankaniname));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let areaid = ssearchdata.ssarea;
    let pluckerid = ssearchdata.sspluckername;
    let sessionid = ssearchdata.sssession;
    let date = ssearchdata.ssdate;
    let leaftypeid = ssearchdata.ssleaftype;
    let kankaniid = ssearchdata.sskankaniname;



    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}
    // date = this.dp.transform(new Date(date),'yyyy-MM-dd');

    // console.log(date);

    let query = "";

    if(areaid!=null) query = query + "&areaid=" + areaid;
    if(pluckerid!=null) query = query + "&pluckerid=" + pluckerid;
    if(sessionid!=null) query = query + "&sessionid=" + sessionid;
    if(leaftypeid!=null) query = query + "&leaftypeid=" + leaftypeid;
    if(kankaniid!=null) query = query + "&kankaniid=" + kankaniid;
    if(date!=null) query = query + "&date=" + date;

    if(query!="") query = query.replace(/^./,"?");

    this.loadTable(query);
    // console.log(query);

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

  fillform(plucking:Plucking) {

    // console.log(plucking);

    this.selectedrow = plucking;
    this.enableButtons(false,true,true);

    this.plucking = JSON.parse(JSON.stringify(plucking));
    this.oldplucking = JSON.parse(JSON.stringify(plucking));

    // @ts-ignore
    this.plucking.area = this.areas.find(ar=> ar.id === this.plucking.area.id);
    // @ts-ignore
    this.plucking.empplucker = this.pluckers.find(pl=> pl.id === this.plucking.empplucker.id);
    // @ts-ignore
    this.plucking.empkankani = this.kankanis.find(ka=> ka.id === this.plucking.empkankani.id);
    // @ts-ignore
    this.plucking.pluckingseesion = this.pluckingsessions.find(ps=> ps.id === this.plucking.pluckingseesion.id);
    // @ts-ignore
    this.plucking.leaftype = this.leaftypes.find(lf=> lf.id === this.plucking.leaftype.id);

    this.form.patchValue(this.plucking);
    this.form.markAsPristine();



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

  add() {

    let errors = this.getErrors();

    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Plucking Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.plucking = this.form.getRawValue();

      const pluckingtimeField = document.getElementById("pluckingtimeInput");

      // @ts-ignore
      const pluckingtimeValue = pluckingtimeField.value;

      const timeComponent = pluckingtimeValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.plucking.time = `${hour1}:${minutes1}:${seconds1}`;

      // if(this.plucking.time != null) {this.plucking.time = this.dp.transform(this.plucking.time,'h:mm:ss a');}
      // this.plucking.time = this.dp.transform(this.plucking.time,'h:mm:ss a');

      let pluckingdata: string ="";

      pluckingdata = pluckingdata + "<br> Area is : " + this.plucking.area.code;
      pluckingdata = pluckingdata + "<br> Plucker is : " + this.plucking.empplucker.callingname;
      pluckingdata = pluckingdata + "<br> Session is : " + this.plucking.pluckingseesion.name;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Plucking Add", message: "Are you sure to Add the following Plucking Record? <br> <br> "+ pluckingdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          // console.log("EmployeeService.add(emp)");
          this.pluckingservice.add(this.plucking).then( ( responce: []|undefined ) => {
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

              this.loadTable("");
              this.loadForm();
            }

            const stsmsg = this.dg.open(MessageComponent,{
              width:'500px',
              data: {heading: "Status - Plucking Add", message: addmessage }
            });

            stsmsg.afterClosed().subscribe( async result => {
              if(!result) {return;}
            });

          });

        }
      });

    }

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Plucking Update",
          message: "You have following Errors <br><br>" + errors }
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
          data: {heading: "Confirmation - Plucking Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {

            this.plucking = this.form.getRawValue();

            // @ts-ignore
            this.plucking.id= this.oldplucking.id;

            // @ts-ignore
            const pluckingtimeValue = this.plucking.time;

            const timeComponent = pluckingtimeValue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.plucking.time = `${hour1}:${minutes1}:${seconds1}`;


            this.pluckingservice.update(this.plucking).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - plucking Update",
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
          data: {heading: "Confirmation - Plucking Update",
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

  delete() {

    const confirm = this.dg.open(ConfirmComponent,{
      width:'500px',
      data: {heading: "Confirmation - Plucking Delete",
        message: "Are you sure to delete following Plucking? <br> <br> "+"Area: "+ this.plucking.area.code+ "<br>"+ "Plucker Name: "+this.plucking.empplucker.callingname }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.pluckingservice.delete(this.plucking.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Plucking Delete", message:delmessage }
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
