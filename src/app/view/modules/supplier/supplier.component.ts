import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Supplierstatus} from "../../../entity/supplierstatus";
import {Supplier} from "../../../entity/supplier";
import {Supplierfertilizer} from "../../../entity/supplierfertilizer";
import {Fertilizer} from "../../../entity/fertilizer";
import {MatSelectionList} from "@angular/material/list";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {SupplierstatusService} from "../../../service/supplierstatusservice";
import {FertilizerService} from "../../../service/fertilizerservice";
import {SupplierService} from "../../../service/supplierservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {SupplierfertilizerService} from "../../../service/supplierfertilizerservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {RegexService} from "../../../service/regexservice";

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit{

  public form!: FormGroup;
  public ssearch!: FormGroup;
  public csearch!: FormGroup;

  supplierstatuss: Array<Supplierstatus> = [];
  suppliers: Array<Supplier> = [];
  supplierfertilizers: Array<Supplierfertilizer> = [];
  // userroles: Array<Userrole> = [];

  // @Input()roles: Array<Role> = [];
  @Input()fertilizers: Array<Fertilizer> = [];
  // oldroles:Array<Role>=[];
  oldfertilizers:Array<Fertilizer>=[];

  @Input()selectedfertilizers: Array<Fertilizer> =[];


  // user!:User;
  // olduser!:User;

  supplier!: Supplier;
  oldsupplier!: Supplier;

  @ViewChild('availablelist') availablelist!: MatSelectionList;
  @ViewChild('selectedlist') selectedlist!: MatSelectionList;


  // columns: string[] = ['employee', 'username', 'docreated', 'userstatus','role','description','toreated'];
  // headers: string[] = ['Employee', 'Username', 'DoCreated', 'Status','Role','Description','To Ceated'];
  // binders: string[] = ['employee.callingname', 'username', 'getDate()', 'userstatus.name','getRole()','description','tocreated'];

  columns: string[] = ['name', 'code', 'contactperson', 'email', 'creditlimit','address','officetp','contactpersontp','supplierstatus','fertilizer'];
  headers: string[] = ['Name', 'Code','Contactperson', 'Email', 'Creditlimit','Address','Officetp','Contactpersontp','SupplierStatus','Fertilizer'];
  binders: string[] = ['name','code', 'contactperson', 'email', 'creditlimit','address','officetp','contactpersontp','supplierstatus.name','getFertilizer()'];

  // columns: string[] = ['employee', 'username', 'docreated', 'userstatus','role','description','toreated'];
  // headers: string[] = ['Employee', 'Username', 'DoCreated', 'Status','Role','Description','To Ceated'];
  // binders: string[] = ['employee.callingname', 'username', 'getDate()', 'userstatus.name','getRole()','description','tocreated'];

  // cscolumns: string[] = ['csemployee', 'csusername', 'csdocreated', 'csuserstatus','csrole','csdescription','cstocreated'];
  // csprompts: string[] = ['Search by Employee', 'Search by Username', 'Search by DoCreated',
  //   'Search by User Status','Search by Role','Search by Description','Search by To created'];


  cscolumns: string[] = ['csname','cscode', 'cscontactperson', 'csemail', 'cscreditlimit','csaddress','csofficetp','cscontactpersontp','cssupplierstatus','csfertilizer'];
  csprompts: string[] = ['Search by Name','Search by Code' ,'Search by Con.Per', 'Search by Email','Search by Creditlimit','Search by Address','Search by OfficeTp',
    'Search by conper.TP','Search by Status','Search by Fertilizer'];

  imageurl: string = '';

  // data !:MatTableDataSource<User>;
  data !:MatTableDataSource<Supplier>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedrow: any;

  uiassist: UiAssist;

  regexes:any;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  constructor(
    private fb:FormBuilder,
    private supstaser:SupplierstatusService,
    private fs:FertilizerService,
    private ss:SupplierService,
    private sfs:SupplierfertilizerService,
    private dp:DatePipe,
    private dg:MatDialog,
    private reg:RegexService
  ) {

    this.uiassist = new UiAssist(this);
    // this.user = new User();
    // @ts-ignore
    this.supplier = new Supplier();

    // 'csname', 'cscontactperson', 'csemail', 'cscreditlimit','csaddress','csofficetp','cscontactpersontp','cssupplierstatus','csfertilizer'

    this.csearch = this.fb.group({

      "csname": new FormControl(),
      "cscode": new FormControl(),
      "cscontactperson": new FormControl(),
      "csemail": new FormControl(),
      "cscreditlimit": new FormControl(),
      "csaddress": new FormControl(),
      "csofficetp": new FormControl(),
      "cscontactpersontp": new FormControl(),
      "cssupplierstatus": new FormControl(),
      "csfertilizer": new FormControl(),


    });

    this.form = this.fb.group({

      "name": new FormControl('',[Validators.required]),
      "code": new FormControl('',[Validators.required]),
      "contactperson": new FormControl('',[Validators.required]),
      "email": new FormControl('',[Validators.required]),
      "creditlimit": new FormControl('',[Validators.required]),
      "address": new FormControl('',[Validators.required]),
      "officetp": new FormControl('',[Validators.required]),
      "contactpersontp": new FormControl('',[Validators.required]),
      "supplierstatus": new FormControl('',[Validators.required]),
      "supplierfertilizers": new FormControl('',[Validators.required]),

    });

    this.ssearch = this.fb.group({

      "ssname": new FormControl(),
      "ssfertilizer": new FormControl(),

    });

  }


  ngOnInit(): void{
    this.initialize();
  }


  initialize(){

    this.createView();
    //
    // this.es.getAllListNameId().then((emps: Employee[]) => {
    //   this.employees = emps;
    // });
    //
    // this.ut.getAllList().then((usts:Userstatus[]) => {
    //   this.userstatues = usts;
    // });
    //
    // this.rs.getAllList().then((rlse:Role[])=>{
    //   this.roles = rlse;
    //   this.oldroles = Array.from(this.roles);
    // });
    this.fs.getAll("").then((fertilzers:Fertilizer[])=>{
      this.fertilizers = fertilzers;
      this.oldfertilizers = Array.from(this.fertilizers);
    });

    this.supstaser.getAllList().then((suplierstaus:Supplierstatus[])=>{
      this.supplierstatuss = suplierstaus;
    });


    this.reg.get("supplier").then((regs:[])=>{
      this.regexes = regs;
      this.createForm();
    });
    // this.createForm();
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadTable(query:string):void{

    this.ss.getAll(query)
      .then((supliers: Supplier[]) => {
        this.suppliers = supliers;
        // alert(JSON.stringify(this.suppliers));
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.suppliers);
        this.data.paginator = this.paginator;
      });

  }



  /*getDate(element: User) {
    return this.dp.transform(element.docreated,'yyyy-MM-dd');
  }*/


  /*getRole(element:User){
    let roles = "";
    element.userroles.forEach((e)=>{ roles = roles+e.role.name+","+"\n"; });
    return roles;

  }*/

  getFertilizer(element:Supplier) {
    let fertilizers = "";
    element.supplierfertilizers.forEach((e)=>{fertilizers = fertilizers+e.fertilizer.name+","+"\n"; });
    return fertilizers;

  }


  createForm() {
    this.form.controls['name'].setValidators([Validators.required,Validators.pattern(this.regexes['name']['regex'])]);
    this.form.controls['code'].setValidators([Validators.required,Validators.pattern(this.regexes['code']['regex'])]);
    this.form.controls['contactperson'].setValidators([Validators.required,Validators.pattern(this.regexes['contactperson']['regex'])]);
    this.form.controls['email'].setValidators([Validators.required,Validators.pattern(this.regexes['email']['regex'])]);
    this.form.controls['creditlimit'].setValidators([Validators.required,Validators.pattern("^\\d{5,6}(\\.\\d{1,2})?$")]);
    this.form.controls['address'].setValidators([Validators.required,Validators.pattern(this.regexes['address']['regex'])]);
    this.form.controls['officetp'].setValidators([Validators.required,Validators.pattern(this.regexes['officetp']['regex'])]);
    this.form.controls['contactpersontp'].setValidators([Validators.required,Validators.pattern(this.regexes['contactpersontp']['regex'])]);
    this.form.controls['supplierstatus'].setValidators([Validators.required]);
    this.form.controls['supplierfertilizers'].setValidators([Validators.required]);
    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {

          if (this.oldsupplier != undefined && control.valid) {
            // @ts-ignore
            if (value === this.supplier[controlName]) {
              control.markAsPristine();
            } else {
              control.markAsDirty();
            }
          } else {
            control.markAsPristine();
          }
        }
      );

    }


    this.enableButtons(true,false,false);

  }

  enableButtons(add:boolean, upd:boolean, del:boolean){
    this.enaadd=add;
    this.enaupd=upd;
    this.enadel=del;
  }

  rightSelected(): void {

    this.supplier.supplierfertilizers = this.availablelist.selectedOptions.selected.map(option => {
      const supplierfertilizer = new Supplierfertilizer(option.value);
      this.fertilizers = this.fertilizers.filter(fertilizer => fertilizer !== option.value); //Remove Selected
      this.supplierfertilizers.push(supplierfertilizer); // Add selected to Right Side
      return supplierfertilizer;
    });

    this.form.controls["supplierfertilizers"].clearValidators();
    this.form.controls["supplierfertilizers"].updateValueAndValidity(); // Update status

    // this.user.userroles = this.availablelist.selectedOptions.selected.map(option => {
    //   const userRole = new Userrole(option.value);
    //   this.roles = this.roles.filter(role => role !== option.value); //Remove Selected
    //   this.userroles.push(userRole); // Add selected to Right Side
    //   return userRole;
    // });
    //
    // this.form.controls["userroles"].clearValidators();
    // this.form.controls["userroles"].updateValueAndValidity(); // Update status

  }

  leftSelected(): void {

    const selectedOptions = this.selectedlist.selectedOptions.selected; // Right Side
    for (const option of selectedOptions) {
      const extSupplierFertilizers = option.value;
      this.supplierfertilizers = this.supplierfertilizers.filter(fertilizer => fertilizer !== extSupplierFertilizers); // Remove the Selected one From Right Side
      this.fertilizers.push(extSupplierFertilizers.role)
    }

    // const selectedOptions = this.selectedlist.selectedOptions.selected; // Right Side
    // for (const option of selectedOptions) {
    //   const extUserRoles = option.value;
    //   this.userroles = this.userroles.filter(role => role !== extUserRoles); // Remove the Selected one From Right Side
    //   this.roles.push(extUserRoles.role)
    // }
  }

  rightAll(): void {

    this.supplier.supplierfertilizers = this.availablelist.selectAll().map(option => {
      const SupplierFertilizer = new Supplierfertilizer(option.value);
      this.fertilizers = this.fertilizers.filter(fertilizer => fertilizer !== option.value);
      this.supplierfertilizers.push(SupplierFertilizer);
      return SupplierFertilizer;
    });

    this.form.controls["supplierfertilizers"].clearValidators();
    this.form.controls["supplierfertilizers"].updateValueAndValidity();

    // this.user.userroles = this.availablelist.selectAll().map(option => {
    //   const userRole = new Userrole(option.value);
    //   this.roles = this.roles.filter(role => role !== option.value);
    //   this.userroles.push(userRole);
    //   return userRole;
    // });
    //
    // this.form.controls["userroles"].clearValidators();
    // this.form.controls["userroles"].updateValueAndValidity();
  }

  leftAll():void{

    for(let supplierfertilizer of this.supplierfertilizers) this.fertilizers.push(supplierfertilizer.fertilizer);
    this.supplierfertilizers = [];

    // for(let userrole of this.userroles) this.roles.push(userrole.role);
    // this.userroles = [];
  }

  filterTable(): void {
    const cserchdata = this.csearch.getRawValue();

    // console.log(cserchdata.csfertilizer);

    this.data.filterPredicate = (supplier: Supplier, filter: string) => {
      return (cserchdata.csname == null || supplier.name.toLowerCase().includes(cserchdata.csname)) &&
        (cserchdata.cscontactperson == null || supplier.contactperson.toLowerCase().includes(cserchdata.cscontactperson)) &&
        (cserchdata.cscode == null || supplier.code.toLowerCase().includes(cserchdata.cscode)) &&
        (cserchdata.csemail == null || supplier.email.toLowerCase().includes(cserchdata.csemail)) &&
        (cserchdata.cscreditlimit == null || supplier.creditlimit.toString().includes(cserchdata.cscreditlimit)) &&
        (cserchdata.csaddress == null || supplier.address.toLowerCase().includes(cserchdata.csaddress)) &&
        (cserchdata.csofficetp == null || supplier.officetp.includes(cserchdata.csofficetp)) &&
        (cserchdata.cscontactpersontp == null || supplier.contactpersontp.includes(cserchdata.cscontactpersontp)) &&
        (cserchdata.cssupplierstatus == null || supplier.supplierstatus.name.toLowerCase().includes(cserchdata.cssupplierstatus)) &&
        (cserchdata.csfertilizer == null || this.getFertilizer(supplier).toString().includes(cserchdata.csfertilizer)) ;

    };

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {
    const sserchdata = this.ssearch.getRawValue();

    let suppliername = sserchdata.ssname;
    let fertilizerid = sserchdata.ssfertilizer;

    let query = "";

    if (suppliername != null && suppliername.trim() !== "") query = query + "&suppliername=" + suppliername;
    if (fertilizerid != null ) query = query + "&fertilizerid=" + fertilizerid;

    if (query != "") query = query.replace(/^./, "?")

    this.loadTable(query);
  }


  btnSearchClearMc(): void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {heading: "Search Clear", message: "Are you sure to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.ssearch.reset();
        this.loadTable("");
      }
    });

  }


  getErrors(): string {

    let errors: string = ""

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      if (control.errors) {

        if (this.regexes[controlName] != undefined) {
          errors = errors + "<br>" + this.regexes[controlName]['message'];
        } else {
          errors = errors + "<br>Invalid " + controlName;
        }
        // errors = errors + "<br>Invalid " + controlName;
      }
    }

    // if(this.form.controls['password'].getRawValue() != this.form.controls['confirmpassword'].getRawValue())
    //   errors = errors + "<br> Password doesn't Match";

    return errors;
  }

  add() {

    let errors = this.getErrors();

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplier Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      let supplier:Supplier = this.form.getRawValue();

      console.log(supplier);


      // // @ts-ignore
      // delete user.confirmpassword;
      // // console.log(user);
      supplier.supplierfertilizers = this.supplier.supplierfertilizers;
      this.supplier = supplier;

      let supplidata: string = "";

      supplidata = supplidata + "<br>Supplier is : " + this.supplier.name;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Supplier Add",
          message: "Are you sure to Add the folowing Supplier? <br> <br>" + supplidata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {

          console.log(JSON.stringify(this.supplier));

          this.ss.add(this.supplier).then((responce: [] | undefined) => {
            //console.log("Res-" + responce);
            //console.log("Un-" + responce == undefined);
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              addstatus = responce['errors'] == "";
              console.log("Add Sta-" + addstatus);
              if (!addstatus) { // @ts-ignore
                addmessage = responce['errors'];
              }
            } else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {

            if (addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              this.supplierfertilizers = [];
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Supplier Add", message: addmessage}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }


  /*add() {

    let errors = this.getErrors();

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      let user:User = this.form.getRawValue();


      // @ts-ignore
      delete user.confirmpassword;
      // console.log(user);
      user.userroles = this.user.userroles;
      this.user = user;

      let usrdata: string = "";

      usrdata = usrdata + "<br>Employee is : " + this.user.employee.callingname;
      usrdata = usrdata + "<br>Username is : " + this.user.username;
      usrdata = usrdata + "<br>Password is : " + this.user.password;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - User Add",
          message: "Are you sure to Add the folowing User? <br> <br>" + usrdata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          // console.log("EmployeeService.add(emp)");

          console.log(JSON.stringify(this.user));
          this.us.add(this.user).then((responce: [] | undefined) => {
            //console.log("Res-" + responce);
            //console.log("Un-" + responce == undefined);
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              addstatus = responce['errors'] == "";
              console.log("Add Sta-" + addstatus);
              if (!addstatus) { // @ts-ignore
                addmessage = responce['errors'];
              }
            } else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {

            if (addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              this.userroles = [];
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -User Add", message: addmessage}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }*/


  fillForm(supplier: Supplier) {

    this.enableButtons(false,true,true);

    this.fertilizers = Array.from(this.oldfertilizers);

    this.selectedrow=supplier;

    this.supplier = JSON.parse(JSON.stringify(supplier));
    this.oldsupplier = JSON.parse(JSON.stringify(supplier));

    //@ts-ignore
    this.supplier.supplierstatus = this.supplierstatuss.find(st => st.id === this.supplier.supplierstatus.id);

    this.supplierfertilizers = this.supplier.supplierfertilizers; // Load User Roles

    this.supplier.supplierfertilizers.forEach((sf)=> this.fertilizers = this.fertilizers.filter((f)=> f.id != sf.fertilizer.id )); // Load or remove roles by comparing with user.userroles

    this.form.patchValue(this.supplier);
    // this.form.controls["username"].disable();
    this.form.markAsPristine();


    // this.enableButtons(false,true,true);
    //
    // this.roles = Array.from(this.oldroles);
    //
    // this.selectedrow=user;
    //
    // this.user = JSON.parse(JSON.stringify(user));
    // this.olduser = JSON.parse(JSON.stringify(user));
    //
    // //@ts-ignore
    // this.user.employee = this.employees.find(e => e.id === this.user.employee.id);
    //
    // //@ts-ignore
    // this.user.userstatus = this.userstatues.find(s => s.id === this.user.userstatus.id);
    //
    // this.userroles = this.user.userroles; // Load User Roles
    //
    // this.user.userroles.forEach((ur)=> this.roles = this.roles.filter((r)=> r.id != ur.role.id )); // Load or remove roles by comparing with user.userroles
    //
    // this.form.patchValue(this.user);
    // // this.form.controls["username"].disable();
    // this.form.markAsPristine();

  }

  getUpdates(): string {

    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }
    return updates;
  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplier Update ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

    } else {

      let updates: string = this.getUpdates();

      if (updates != "") {

        let updstatus: boolean = false;
        let updmessage: string = "Server Not Found";

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: "Confirmation - Supplier Update",
            message: "Are you sure to Save folowing Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            //console.log("EmployeeService.update()");
            this.supplier = this.form.getRawValue();

            this.supplier.id = this.oldsupplier.id;

            console.log(this.supplier.id);

            this.ss.update(this.supplier).then((responce: [] | undefined) => {
              //console.log("Res-" + responce);
              // console.log("Un-" + responce == undefined);
              if (responce != undefined) { // @ts-ignore
                //console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
                // @ts-ignore
                updstatus = responce['errors'] == "";
                //console.log("Upd Sta-" + updstatus);
                if (!updstatus) { // @ts-ignore
                  updmessage = responce['errors'];
                }
              } else {
                //console.log("undefined");
                updstatus = false;
                updmessage = "Content Not Found"
              }
            } ).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.form.reset();
                this.leftAll();
                Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
                this.loadTable("");
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Supplier Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Supplier Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }
  }


  delete() : void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Supplier Delete",
        message: "Are you sure to Delete following Supplier? <br> <br>" + this.supplier.name
      }
    });

    console.log("Dele: "+this.supplier.id);

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ss.delete(this.supplier.id).then((responce: [] | undefined) => {

          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        }).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";
            this.form.reset();
            this.leftAll();
            Object.values(this.form.controls).forEach(control => {
              control.markAsTouched();
            });
            this.loadTable("");
          }
          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - User Delete ", message: delmessage}
          });
          stsmsg.afterClosed().subscribe(async result => {
            if (!result) {
              return;
            }
          });

        });
      }
    });
  }



}
