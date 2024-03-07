import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {Activity} from "../../../entity/activity";
import {ActivityService} from "../../../service/activityservice";
import {Activitytype} from "../../../entity/activitytype";
import {Employee} from "../../../entity/employee";
import {ActivitytypeService} from "../../../service/activitytypeservice";
import {EmployeeService} from "../../../service/employeeservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent {

  columns: string[] = ['date','time','approver','activity'];
  headers: string[] = ['Date', 'Time', 'Approved By', 'Activity'];
  binders: string[] = ['date', 'time', 'approver.callingname', 'activitytype.name'];

  cscolumns: string[] = ['csdate', 'cstime', 'csapprover', 'csactivity'];
  csprompts: string[] = ['Search By Date', 'Search By Time', 'Search By Approver', 'Search By Activity'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  activity!: Activity;
  oldactivity!: ActivityComponent|undefined;

  selectedrow: any;

  activities: Array<Activity> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Activity>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  activitytypes: Array<Activitytype> = [];
  approvers: Array<Employee> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private as:ActivityService,
    private ats:ActivitytypeService,
    private es:EmployeeService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csdate": new FormControl(),
      "cstime": new FormControl(),
      "csapprover": new FormControl(),
      "csactivity": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssdate": new FormControl(),
      "ssapprover": new FormControl(),
      "ssactivitytype": new FormControl(),

    });

    this.form = this.fb.group( {
      "date": new FormControl(),
      "time": new FormControl(),
      "approver": new FormControl(),
      "activitytype": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ats.getAllList().then( (actityps: Activitytype[]) => {
      this.activitytypes = actityps;
    });

    this.es.getManagers().then( (mangrs: Employee[]) => {
      this.approvers = mangrs;
    });

    this.createForm();

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {
    this.form.controls['date'].setValidators([Validators.required,]);
    this.form.controls['time'].setValidators([Validators.required,]);
    this.form.controls['approver'].setValidators([Validators.required,]);
    this.form.controls['activitytype'].setValidators([Validators.required,]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldactivity != undefined && control.valid) {
          // @ts-ignore
          if (value === this.activity[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldactivity = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.as.getAll(query)
      .then( (activitys: Activity[]) => { this.activities = activitys; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.activities); this.data.paginator = this.paginator; } );

  }

  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (activity: Activity, filter: string) => {

      return (csearchdata.csdate==null || activity.date.includes(csearchdata.csdate)) &&
        (csearchdata.cstime==null || activity.time.includes(csearchdata.cstime)) &&
        (csearchdata.csapprover==null || activity.approver.callingname.toLowerCase().includes(csearchdata.csapprover)) &&
        (csearchdata.csactivity==null || activity.activitytype.name.toLowerCase().includes(csearchdata.csactivity)) ;
    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let date = ssearchdata.ssdate;
    let approverid = ssearchdata.ssapprover;
    let ssactivitytypeid = ssearchdata.ssactivitytype;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}


    let query = "";

    if(date!=null) query = query + "&date=" + date;
    if(approverid!=null) query = query + "&approverid=" + approverid;
    if(ssactivitytypeid!=null) query = query + "&ssactivitytypeid=" + ssactivitytypeid;

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
        data: {heading: "Errors - Activity Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.activity = this.form.getRawValue();

      const activitytimeField = document.getElementById("activityTime");

      // @ts-ignore
      const activitytimeFieldValue = activitytimeField.value;

      const timeComponent = activitytimeFieldValue.split(':');
      const hour1 = timeComponent[0];
      const minutes1 = timeComponent[1];
      const seconds1 = "00";

      this.activity.time = `${hour1}:${minutes1}:${seconds1}`;

      let activitydata: string ="";

      activitydata = activitydata + "<br> Activity is : " + this.activity.activitytype.name;
      activitydata = activitydata + "<br> Approver is : " + this.activity.approver.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Activity Add", message: "Are you sure to Add the following Activity? <br> <br> "+ activitydata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.as.add(this.activity).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Activity Add", message: addmessage }
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

  fillForm(activity:Activity) {

    this.enableButtons(false,true,true);

    this.selectedrow = activity;

    this.activity = JSON.parse(JSON.stringify(activity));
    this.oldactivity = JSON.parse(JSON.stringify(activity));

    // @ts-ignore
    this.activity.approver = this.approvers.find(ap => ap.id === this.activity.approver.id);
    // @ts-ignore
    this.activity.activitytype = this.activitytypes.find(at => at.id === this.activity.activitytype.id);

    this.form.patchValue(this.activity);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Activity Update",
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
          data: {heading: "Confirmation - Activity Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.activity = this.form.getRawValue();

            // @ts-ignore
            this.activity.id = this.oldactivity.id;

            // @ts-ignore
            const activitytimeValue = this.activity.time;

            const timeComponent = activitytimeValue.split(':');
            const hour1 = timeComponent[0];
            const minutes1 = timeComponent[1];
            const seconds1 = "00";

            this.activity.time = `${hour1}:${minutes1}:${seconds1}`;


            this.as.update(this.activity).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Activity Update",
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
          data: {heading: "Confirmation - Activity Update",
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
      data: {heading: "Confirmation - Activity Delete",
        message: "Are you sure to delete following Activity? <br> <br> "+ this.activity.activitytype.name }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.as.delete(this.activity.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Activity Delete", message:delmessage }
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
