import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Attendence} from "../../../entity/attendence";
import {AttendenceService} from "../../../service/attendenceservice";
import {Employee} from "../../../entity/employee";
import {Attendstatus} from "../../../entity/attendstatus";
import {AttendencestatusService} from "../../../service/attendencestatusservice";
import {EmployeeService} from "../../../service/employeeservice";

@Component({
  selector: 'app-attendence',
  templateUrl: './attendence.component.html',
  styleUrls: ['./attendence.component.css']
})
export class AttendenceComponent {

  columns: string[] = ['date','time','attendstatus','employee'];
  headers: string[] = ['Attend Date', 'Attend Time', 'Attend Status', 'Employee Name'];
  binders: string[] = ['date', 'time', 'attendstatus.name', 'employee.callingname'];

  cscolumns: string[] = ['csdate', 'cstime', 'csattendstatus', 'csemployee'];
  csprompts: string[] = ['Search By Date', 'Search By Time', 'Search By Status', 'Search By Employee'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  attendence!: Attendence;
  oldattendence!: Attendence|undefined;

  selectedrow: any;

  attendences: Array<Attendence> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Attendence>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  employees: Array<Employee> = [];
  attendstatuss: Array<Attendstatus> = [];

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private attendser:AttendenceService,
    private attsta:AttendencestatusService,
    private es:EmployeeService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);


    this.csearch = this.fb.group( {
      "csdate": new FormControl(),
      "cstime": new FormControl(),
      "csattendstatus": new FormControl(),
      "csemployee": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssemployee": new FormControl(),
      "ssattndstatus": new FormControl(),

    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "time": new FormControl(),
      "attendstatus": new FormControl(),
      "employee": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.es.getAll("").then( (emps: Employee[]) => {
      this.employees = emps;
    });

    this.attsta.getAllList().then( (attstas: Attendstatus[]) => {
      this.attendstatuss = attstas;
    });

    this,this.createForm();


  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {

    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['time'].setValidators([Validators.required]);
    this.form.controls['attendstatus'].setValidators([Validators.required,]);
    this.form.controls['employee'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldattendence != undefined && control.valid) {
          // @ts-ignore
          if (value === this.attendence[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldattendence = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.attendser.getAll(query)
      .then( (attnds: Attendence[]) => { this.attendences = attnds; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.attendences); this.data.paginator = this.paginator; } );

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (attendence: Attendence, filter: string) => {

      return (csearchdata.csdate==null || attendence.date.includes(csearchdata.csdate)) &&
        (csearchdata.cstime==null || attendence.time.includes(csearchdata.cstime)) &&
        (csearchdata.csattendstatus==null || attendence.attendstatus.name.toLowerCase().includes(csearchdata.csattendstatus)) &&
        (csearchdata.csemployee==null || attendence.employee.callingname.toLowerCase().includes(csearchdata.csemployee)) ;
    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let employeeid = ssearchdata.ssemployee;
    let attndstatusid = ssearchdata.ssattndstatus;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(date!=null) query = query + "&date=" + date;
    if(employeeid!=null) query = query + "&employeeid=" + employeeid;
    if(attndstatusid!=null) query = query + "&attndstatusid=" + attndstatusid;

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
        data: {heading: "Errors - Attendence Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.attendence = this.form.getRawValue();

      const attendtimeField = document.getElementById("attendencetimeInput");

      // @ts-ignore
      const attendtimeFieldValue = attendtimeField.value;

      const timeComponent = attendtimeFieldValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.attendence.time = `${hour1}:${minutes1}:${seconds1}`;


      let attenddata: string ="";

      attenddata = attenddata + "<br> Name is : " + this.attendence.employee.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Attendence Add", message: "Are you sure to Add the following Attendence? <br> <br> "+ attenddata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.attendser.add(this.attendence).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Attendence Add", message: addmessage }
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
        errors = errors+"<br>Invalid "+ controlName;
        // if(this.regexes[controlName]!=undefined)
        // { errors = errors+"<br>"+ this.regexes[controlName]['message']; }
        // else
        // { errors = errors+"<br>Invalid "+ controlName; }
      }
    }
    return errors;
  }

  fillForm(attendence:Attendence) {

    this.enableButtons(false,true,true);

    this.selectedrow = attendence;

    this.attendence = JSON.parse(JSON.stringify(attendence));
    this.oldattendence = JSON.parse(JSON.stringify(attendence));

    // @ts-ignore
    this.attendence.attendstatus = this.attendstatuss.find(as => as.id === this.attendence.attendstatus.id);
    // @ts-ignore
    this.attendence.employee = this.employees.find(emp => emp.id === this.attendence.employee.id);

    this.form.patchValue(this.attendence);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Attendence Update",
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
          data: {heading: "Confirmation - Attendence Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.attendence = this.form.getRawValue();

            // @ts-ignore
            this.attendence.id = this.oldattendence.id;

            // @ts-ignore
            const attendencetimeValue = this.attendence.time;

            const timeComponent = attendencetimeValue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.attendence.time = `${hour1}:${minutes1}:${seconds1}`;

            this.attendser.update(this.attendence).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Attendence Update",
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
          data: {heading: "Confirmation - Attendence Update",
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
      data: {heading: "Confirmation - Attendence Delete",
        message: "Are you sure to delete following Attendence? <br> <br> "+ this.attendence.employee.callingname }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.attendser.delete(this.attendence.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Attendence Delete", message:delmessage }
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
