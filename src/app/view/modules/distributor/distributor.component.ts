import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import {DatePipe} from "@angular/common";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Distributor} from "../../../entity/distributor";
import {Distributorstatus} from "../../../entity/distributorstatus";
import {Distributortype} from "../../../entity/distributortype";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Distributorservice} from "../../../service/distributorservice";
import {Distributorstatusservice} from "../../../service/distributorstatusservice";
import {Distributortypeservice} from "../../../service/distributortypeservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Fertilizer} from "../../../entity/fertilizer";

@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.component.html',
  styleUrls: ['./distributor.component.css']
})
export class DistributorComponent {


  public form!: FormGroup;
  public csearch!: FormGroup;
  public ssearch!: FormGroup;

  distributor!: Distributor;
  olddistributor!: Distributor|undefined;

  distributors: Array<Distributor> = [];
  distributorstatuss: Array<Distributorstatus>=[];
  distributortypes: Array<Distributortype>=[];

  regexes!:any;

  columns: string[] = ['name', 'telephone', 'email', 'address','contactperson','contacttlp','description','creditlimit','exporterstatus','exportertype'];
  headers: string[] = ['Name', 'Telephone', 'Email', 'Address','Contact Person','Contact Telephone','Description','Credit Limit','Distributor Status','Distributor Type'];
  binders: string[] = ['name', 'telephone', 'email', 'address','contactperson','contactpersontp','description','creditlimit','distributorstatus.name','distributortype.name'];

  cscolumns: string[] = ['csname', 'cstelephone', 'csemail', 'csaddress','cscontactperson','cscontacttlp','csdescription','cscreditlimit','csdistributorstatus','csdistributortype'];
  csprompts: string[] = ['Search by Name', 'Search by Telephone', 'Search by Email', 'Search by Address',
    'Search by Contact Person', 'Search by Contact Telephone','Search by Description','Search by Credit Limit',
    'Search by Distributor Status','Search by Distributor Type'];

  imageurl: string = '';

  data !:MatTableDataSource<Distributor>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist: UiAssist;

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  selectedrow:any;

  constructor(
    private fb:FormBuilder,
    private dg:MatDialog,
    private dp:DatePipe,
    // private rs:RegexService,
    private ds:Distributorservice,
    private dss:Distributorstatusservice,
    private dts:Distributortypeservice
  ){
    this.uiassist = new UiAssist(this);

    this.form = this.fb.group({
      "name": new FormControl(),
      "telephone": new FormControl(),
      "email": new FormControl(),
      "address": new FormControl(),
      "contactperson": new FormControl(),
      "contactpersontp": new FormControl(),
      "description": new FormControl(),
      "creditlimit": new FormControl(),
      "distributorstatus": new FormControl(),
      "distributortype": new FormControl()
    });

    this.csearch = this.fb.group({
      "csname": new FormControl(),
      "cstelephone": new FormControl(),
      "csemail": new FormControl(),
      "csaddress": new FormControl(),
      "cscontactperson": new FormControl(),
      "cscontacttlp": new FormControl(),
      "csdescription": new FormControl(),
      "cscreditlimit": new FormControl(),
      "csdistributorstatus": new FormControl(),
      "csdistributortype": new FormControl()

    });

    this.ssearch = this.fb.group({
      "ssname": new FormControl(),
      "ssemail": new FormControl(),
      "ssdistributortype": new FormControl(),
    })
  }

  async ngOnInit(): Promise<void> {
    this.initialize();

  }

  initialize(){
    this.createView();

    this.dts.getAllList().then((distyps:Distributortype[])=> {
      this.distributortypes = distyps;
    });

    this.dss.getAllList().then((diststs:Distributorstatus[])=> {
      this.distributorstatuss = diststs;
    });

    this.createForm();


    //
    // this.rs.get("product").then((rxs:RegexService[])=> {
    //   this.regexes = rxs;
    //   this.createForm();
    // });
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadTable(query:string):void{

    this.ds.getAll(query)
      .then((distrbuts: Distributor[]) => {
        this.distributors = distrbuts;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.distributors);
        this.data.paginator = this.paginator;
      });
  }

  filterTable():void{
    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (distributor: Distributor, filter: string) =>{

      return(csearchdata.csname==null||distributor.name.toLowerCase().includes(csearchdata.csname)) &&
        (csearchdata.cstelephone==null||distributor.telephone.includes(csearchdata.cstelephone)) &&
        (csearchdata.csemail==null||distributor.email.toString().includes(csearchdata.csemail)) &&
        (csearchdata.csaddress==null||distributor.address.toString().includes(csearchdata.csaddress)) &&
        (csearchdata.cscontactperson==null||distributor.contactperson.toLowerCase().includes(csearchdata.cscontactperson)) &&
        (csearchdata.cscontacttlp==null||distributor.contactpersontp.toLowerCase().includes(csearchdata.cscontacttlp)) &&
        (csearchdata.csdescription==null||distributor.description.toLowerCase().includes(csearchdata.csdescription)) &&
        (csearchdata.cscreditlimit==null||distributor.creditlimit.toString().includes(csearchdata.cscreditlimit)) &&
        (csearchdata.csdistributorstatus==null||distributor.distributorstatus.name.toString().includes(csearchdata.csdistributorstatus)) &&
        (csearchdata.csdistributortype==null||distributor.distributortype.name.toLowerCase().includes(csearchdata.csdistributortype))
    }
    this.data.filter = 'xx';
  }

  btnSearchMc(): void{
    const ssearchdata = this.ssearch.getRawValue();

    let name = ssearchdata.ssname;
    let email = ssearchdata.ssemail;
    let distributortypeid = ssearchdata.ssdistributortype;

    let query="";

    if (name!=null && name.trim()!="") query=query+"&name="+name;
    if (email!=null && email.trim()!="") query=query+"&email="+email;
    if (distributortypeid!=null) query=query+"&distributortypeid="+distributortypeid;

    if (query!="") query = query.replace(/^./, "?")

    this.loadTable(query);

  }

  btnSearchClearMc(): void{
    const confirm = this.dg.open(ConfirmComponent,{
      width: '400px',
      data:{heading:"Clear Search", message: "This will clear current search results. Confirm?"}
    });
    confirm.afterClosed().subscribe(async result =>{
      if (result){
        this.ssearch.reset();
        this.loadTable("");
      }
    });
  }

  createForm() {

    this.form.controls['name'].setValidators([Validators.required]);
    this.form.controls['telephone'].setValidators([Validators.required]);
    this.form.controls['email'].setValidators([Validators.required]);
    this.form.controls['address'].setValidators([Validators.required]);
    this.form.controls['contactperson'].setValidators([Validators.required]);
    this.form.controls['contactpersontp'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([Validators.required]);
    this.form.controls['creditlimit'].setValidators([Validators.required]);
    this.form.controls['distributorstatus'].setValidators([Validators.required]);
    this.form.controls['distributortype'].setValidators([Validators.required]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {

        if (this.olddistributor != undefined && control.valid) {
          // @ts-ignore
          if (value === this.distributor[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();

  }

  loadForm() {
    this.olddistributor = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  enableButtons(add:boolean, upd:boolean, del:boolean){
    this.enaadd=add;
    this.enaupd=upd;
    this.enadel=del;
  }

  getErrors(): string {
    let errors:string="";
    for (const controlName in this.form.controls){
      const control = this.form.controls[controlName];
      if (control.errors){
        // if (this.regexes[controlName]!=undefined){
        //   errors=errors+"<br>"+ this.regexes[controlName]['message'];
        // }
        // else {
        //   errors=errors+"<br>Invalid " + controlName;
        // }
        errors=errors+"<br>Invalid " + controlName;
      }
    }
    return errors;
  }

  add(){
    let errors:string = this.getErrors();
    if (errors!="") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Distributor Add", message: "You have Following errors: <br> " + errors}
      });

      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    }
    else{
      this.distributor = this.form.getRawValue();

      let disdata: string = "";
      disdata = disdata + "<br>Name is : "+ this.distributor.name;
      disdata = disdata + "<br>Code is : "+ this.distributor.email;
      disdata = disdata + "<br>Code is : "+ this.distributor.contactperson;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px', data: {heading: "Confirmation - Distributor Add", message: "Are you sure to Add the following Distributor? <br> <br>"+ disdata}
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {

        if (result) {
          this.ds.add(this.distributor).then((response: [] | undefined) => {
            if (response != undefined) {
              // @ts-ignore
              addstatus = response['errors'] == "";
              if (!addstatus) { // @ts-ignore
                addmessage = response['errors'];
              }
            } else {
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {
            if (addstatus) {
              addmessage = "Successfully Saved";

              this.form.reset();
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });

              this.loadTable("");
            }
            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status - Distributor Add", message: addmessage}
            });
            stsmsg.afterClosed().subscribe(async result => {if (!result) { return; }
            });
          });
        }
      });
    }
  }

  fillForm(distributor:Distributor) {

    this.enableButtons(false,true,true);

    this.selectedrow = distributor;

    this.distributor = JSON.parse(JSON.stringify(distributor));
    this.olddistributor = JSON.parse(JSON.stringify(distributor));

    // @ts-ignore
    this.distributor.distributortype = this.distributortypes.find(dt => dt.id === this.distributor.distributortype.id);
    // @ts-ignore
    this.distributor.distributorstatus = this.distributorstatuss.find(ds => ds.id === this.distributor.distributorstatus.id);

    this.form.patchValue(this.distributor);
    this.form.markAsPristine();

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

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Distributor Update",
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
          data: {heading: "Confirmation - Distributor Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.distributor = this.form.getRawValue();

            // @ts-ignore
            this.distributor.id = this.olddistributor.id;

            this.ds.update(this.distributor).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Distributor Update",
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
          data: {heading: "Confirmation - Distributor Update",
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
      data: {heading: "Confirmation - Distributor Delete",
        message: "Are you sure to delete following Distributor? <br> <br> "+ this.distributor.name }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.ds.delete(this.distributor.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Distributor Delete", message:delmessage }
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

}
