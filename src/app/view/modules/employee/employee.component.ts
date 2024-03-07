import {Component, OnInit, ViewChild} from '@angular/core';
import {Gender} from "../../../entity/gender";
import {Designation} from "../../../entity/designation";
import {Employee} from "../../../entity/employee";
import {EmployeeService} from "../../../service/employeeservice";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui/ui.assist";
import {GenderService} from "../../../service/genderservice";
import {DesignationService} from "../../../service/designationservice";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {Employeestatus} from "../../../entity/employeestatus";
import {EmployeestatusService} from "../../../service/employeestatusservice";
import {RegexService} from "../../../service/regexservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {DatePipe} from "@angular/common";
import {AuthorizationManager} from "../../../service/authorizationmanager";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {
  // cols = '12';
  columns: string[] = ['number','callingname','gender','designation', 'fullname', 'modi'];
  headers: string[] = ['Number', 'Calling Name', 'Gender', 'Designation', 'Full Name', 'Modifications'];
  binders: string[] = ['number', 'callingname', 'gender.name', 'designation.name', 'fullname', 'getModi()'];

  cscolumns: string[] = ['csnumber', 'cscallingname', 'csgender', 'csdesignation', 'csname', 'csmodi'];
  csprompts: string[] = ['Search By Number', 'Search By Name', 'Search By Gender', 'Search By Designation', 'Search By Full Name', 'Search By Modi'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  filterDates = (date: Date | null): boolean => {
    const currentDate = new Date();
    return !date || date.getTime() < currentDate.getTime();
  };

  employee!: Employee;
  oldemployee!: Employee|undefined;

  selectedrow: any;

  employees: Array<Employee> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Employee>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string ='assets/default.png';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  genders: Array<Gender> = [];
  designations: Array<Designation> = [];
  employeestatuses: Array<Employeestatus> = [];
  regexes: any;

  uiassist: UiAssist;

  constructor(
    private es:EmployeeService,
    private fb:FormBuilder,
    private gs:GenderService,
    private ss:EmployeestatusService,
    private rs:RegexService,
    private ds:DesignationService,
    private dg:MatDialog,
    private dp:DatePipe,
    public authService:AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csnumber": new FormControl(),
      "cscallingname": new FormControl(),
      "csgender": new FormControl(),
      "csdesignation": new FormControl(),
      "csname": new FormControl(),
      "csmodi": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssnumber": new FormControl(),
      "ssfullname": new FormControl(),
      "ssgender": new FormControl(),
      "ssdesignation": new FormControl(),
      "ssnic": new FormControl()
    });

    this.form = this.fb.group( {
      "number": new FormControl('',[Validators.required, Validators.pattern("^\\d{4}$") ]),
      "fullname": new FormControl('',[Validators.required]),
      "callingname": new FormControl('',[Validators.required]),
      "gender": new FormControl('',[Validators.required]),
      "nic": new FormControl('',[Validators.required]),
      "dobirth": new FormControl('',[Validators.required]),
      "photo": new FormControl('',[Validators.required]),
      "address": new FormControl('',[Validators.required]),
      "mobile": new FormControl('',[Validators.required]),
      "land": new FormControl('',),
      "designation": new FormControl('',[Validators.required]),
      "doassignment": new FormControl('',[Validators.required]),
      "description": new FormControl('',[Validators.required]),
      "employeestatus": new FormControl('',[Validators.required]),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.gs.getAllList().then( (gens: Gender[]) => {
      this.genders = gens;
      console.log("G-" + this.genders);
    });

    this.ds.getAllList().then( (dess: Designation[]) => {
      this.designations = dess;
      console.log("D-" + this.designations)
    });

    this.ss.getAllList().then( (stes: Employeestatus[]) => {
      this.employeestatuses = stes;
      console.log("S-" + this.employeestatuses);
    });

    this.rs.get('employee').then( (regs: []) => {
      this.regexes = regs;
      console.log("R-" + this.regexes['number']['regex']);
      this.createForm();
    });

    this.createSearch();

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createSearch() {}

  createForm() {
    this.form.controls['number'].setValidators([Validators.required,Validators.pattern(this.regexes['number']['regex'])]);
    this.form.controls['fullname'].setValidators([Validators.required,Validators.pattern(this.regexes['fullname']['regex'])]);
    this.form.controls['callingname'].setValidators([Validators.required,Validators.pattern(this.regexes['callingname']['regex'])]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.required,Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['dobirth'].setValidators([Validators.required]);
    this.form.controls['photo'].setValidators([Validators.required]);
    this.form.controls['address'].setValidators([Validators.required,Validators.pattern(this.regexes['address']['regex'])]);
    this.form.controls['mobile'].setValidators([Validators.required,Validators.pattern(this.regexes['mobile']['regex'])]);
    this.form.controls['land'].setValidators([Validators.pattern(this.regexes['land']['regex'])]);
    this.form.controls['designation'].setValidators([Validators.required]);
    this.form.controls['doassignment'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([Validators.required,Validators.pattern(this.regexes['description']['regex'])]);
    this.form.controls['employeestatus'].setValidators([Validators.required]);

    // Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="dobirth" || controlName =="doassignment")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldemployee != undefined && control.valid) {
          // @ts-ignore
          if (value === this.employee[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();

    // this.enableButtons(true,false,false);

  }

  loadForm() {
    this.oldemployee = undefined;
    this.form.reset();
    this.ClearImage();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    console.log("Buttonpanel")
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.es.getAll(query)
      .then( (emps: Employee[]) => { this.employees = emps; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.employees); this.data.paginator = this.paginator; } );

  }

  getModi(element: Employee) {
    return  element.number + '(' + element.callingname + ')';
  }


  filterTable():void{

    const csearchdata = this.csearch.getRawValue();
    // console.log(csearchdata);

    this.data.filterPredicate = (employee: Employee, filter: string) => {

      return (csearchdata.csnumber==null || employee.number.toLowerCase().includes(csearchdata.csnumber)) &&
        (csearchdata.cscallingname==null || employee.callingname.toLowerCase().includes(csearchdata.cscallingname)) &&
        (csearchdata.csgender==null || employee.gender.name.toLowerCase().includes(csearchdata.csgender)) &&
        (csearchdata.csdesignation==null || employee.designation.name.toLowerCase().includes(csearchdata.csdesignation)) &&
        (csearchdata.csname==null || employee.fullname.toLowerCase().includes(csearchdata.csname)) &&
        (csearchdata.csmodi==null || this.getModi(employee).toLowerCase().includes(csearchdata.csmodi));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let fullname = ssearchdata.ssfullname;
    let nic = ssearchdata.ssnic;
    let genderid = ssearchdata.ssgender;
    let designationid = ssearchdata.ssdesignation;

    let query = "";

    if(number!=null && number.trim()!="") query = query + "&number=" + number;
    if(fullname!=null && fullname.trim()!="") query = query + "&fullname=" + fullname;
    if(nic!=null && nic.trim()!="") query = query + "&nic=" + nic;
    if(genderid!=null) query = query + "&genderid=" + genderid;
    if(designationid!=null) query = query + "&designationid=" + designationid;

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

  selectImage(e:any):void {
    if(e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event:any)=> {
        this.imageempurl = event.target.result;
        this.form.controls['photo'].clearValidators();
      }
    }
  }

  ClearImage():void {
    this.imageempurl = 'assets/default.png';
    this.form.controls['photo'].setErrors( {'required': true})
  }

  add() {

    let errors = this.getErrors();

    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Employee Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.employee = this.form.getRawValue();
      this.employee.photo = btoa(this.imageempurl);
      console.log("Photo-After"+ this.employee.photo);
      // console.log("Emplo->"+this.employee.dob);

      let empdata: string ="";

      empdata = empdata + "<br> Number is : " + this.employee.number;
      empdata = empdata + "<br> Fullname is : " + this.employee.fullname;
      empdata = empdata + "<br> Callingname is : " + this.employee.callingname;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Employee Add", message: "Are you sure to Add the following Employee? <br> <br> "+ empdata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          // console.log("EmployeeService.add(emp)");
          this.es.add(this.employee).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Employee Add", message: addmessage }
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

  fillForm(employee:Employee) {

    this.enableButtons(false,true,true);

    this.selectedrow = employee;

    this.employee = JSON.parse(JSON.stringify(employee));
    this.oldemployee = JSON.parse(JSON.stringify(employee));

    if (this.employee.photo != null) {
      this.imageempurl = atob(this.employee.photo);
      this.form.controls['photo'].clearValidators();
    } else {
      this.ClearImage();
    }

    this.employee.photo = "";

    // @ts-ignore
    this.employee.gender = this.genders.find(g => g.id === this.employee.gender.id);
    // @ts-ignore
    this.employee.designation = this.designations.find(d => d.id === this.employee.designation.id);
    // @ts-ignore
    this.employee.employeestatus = this.employeestatuses.find(s => s.id === this.employee.employeestatus.id);

    this.form.patchValue(this.employee);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Employee Update",
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
          data: {heading: "Confirmation - Employee Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            // console.log("Employee Service Update");
            this.employee = this.form.getRawValue();

            if(this.form.controls['photo'].dirty) this.employee.photo = btoa(this.imageempurl);
            else { // @ts-ignore
              this.employee.photo = this.oldemployee.photo;
            }

            // @ts-ignore
            this.employee.id = this.oldemployee.id;

            this.es.update(this.employee).then( (responce: [] | undefined) => {

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
                // this.oldemployee = undefined;
                // this.form.reset();
                // this.ClearImage();
                //
                // Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
                this.loadForm();
                this.loadTable("");
                // this.enableButtons(true,false,false);
              }

              const stsmsg = this.dg.open(MessageComponent,{
                width:'500px',
                data: {heading: "Status - Employee Update",
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
          data: {heading: "Confirmation - Employee Update",
            message: "Nothing Changed" }
        });

        updmsg.afterClosed().subscribe( async result => {
          if (!result) {
            return;
          }
        });

      }

    }




    // Object.keys(this.form.controls).forEach(key => {
    //   const control = this.form.get(key);
    //
    //   // @ts-ignore
    //   console.log(`${key}-${control.pristine}`);
    // });
    //
    // console.log("==============");

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
      data: {heading: "Confirmation - Employee Delete",
        message: "Are you sure to delete following Employee? <br> <br> "+ this.employee.callingname }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.es.delete(this.employee.id).then( (responce: [] | undefined) => {

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
            // this.oldemployee = undefined;
            // this.form.reset();
            // this.ClearImage();
            //
            // Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
            this.loadForm();
            this.loadTable("");

            // this.enableButtons(true,false,false);
          }

          const stsmsg = this.dg.open(MessageComponent,{
            width:'500px',
            data: {heading: "Status - Employee Delete", message:delmessage }
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
        // this.oldemployee = undefined;
        // this.form.reset();
        // this.ClearImage();
        //
        // Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
        // this.enableButtons(true,false,false);
        // this.selectedrow = null;

      }
    });

  }

  enableButtons(add:boolean, upd:boolean, del:boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }


}
