import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Fertilizer} from "../../../entity/fertilizer";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Fertilizertype} from "../../../entity/fertilizertype";
import {Fertilizerbrand} from "../../../entity/fertilizerbrand";
import {Fertilizerstatus} from "../../../entity/fertilizerstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {FertilizerService} from "../../../service/fertilizerservice";
import {FertilizerbrandService} from "../../../service/fertilizerbrandservice";
import {FertilizertypeService} from "../../../service/fertilizertypeservice";
import {FertilizerstatuService} from "../../../service/fertilizerstatuservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Fertilizerdistribution} from "../../../entity/fertilizerdistribution";
import {FertilizerdistributionService} from "../../../service/fertilizerdistributionservice";
import {Area} from "../../../entity/area";
import {Fertilizerdistributionstate} from "../../../entity/fertilizerdistributionstate";
import {Employee} from "../../../entity/employee";
import {EmployeeService} from "../../../service/employeeservice";
import {Areaservice} from "../../../service/areaservice";
import {FertilizerdistristateService} from "../../../service/fertilizerdistristateservice";

@Component({
  selector: 'app-fertilizerdistribution',
  templateUrl: './fertilizerdistribution.component.html',
  styleUrls: ['./fertilizerdistribution.component.css']
})
export class FertilizerdistributionComponent {



  columns: string[] = ['areacode','fername','ferbrand','fertype','issusequantity', 'date', 'ferdisstate','kankaniname'];
  headers: string[] = ['Area', 'Fertilizer Name','Brand', 'Type', 'Issuing Quantity', 'Date','Status','Deliver To'];
  binders: string[] = ['area.code', 'fertilizer.name', 'fertilizer.fertilzerbrand.name', 'fertilizer.fertilizertype.name', 'quantitydis', 'date','ferdistributionstate.name','kankani.callingname'];

  cscolumns: string[] = ['csarea', 'csfername', 'csferbrand', 'csfertype', 'csissusequantity', 'csdate','csferdisstate','cskankaniname'];
  csprompts: string[] = ['Search By Area', 'Search By Fertilizer', 'Search By Brand', 'Search By Type', 'Search By Quantity', 'Search By Date','Search By State','Search By Kankani'];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  fertilizerdistribution!: Fertilizerdistribution;
  oldfertilizerdistribution!: Fertilizerdistribution|undefined;

  selectedrow: any;

  fertilizerdistributions: Array<Fertilizerdistribution> = [];
  imageurl: string = '';

  data!: MatTableDataSource<Fertilizerdistribution>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string ='assets/default.png';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  areas: Array<Area> = [];
  fertilizers: Array<Fertilizer> = [];
  fertilizerbrands: Array<Fertilizerbrand> = [];
  fertilizertypes: Array<Fertilizertype> = [];
  ferdistributionstates: Array<Fertilizerdistributionstate> = [];
  kankanis: Array<Employee> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private fb:FormBuilder,
    private fds:FertilizerdistributionService,
    private es:EmployeeService,
    private as:Areaservice,
    private fs:FertilizerService,
    private fbs:FertilizerbrandService,
    private fts:FertilizertypeService,
    private ftds:FertilizerdistristateService,
    private rs:RegexService,
    private dg:MatDialog,
    private dp:DatePipe) {

    this.uiassist = new UiAssist(this);

    this.csearch = this.fb.group( {
      "csarea": new FormControl(),
      "csfername": new FormControl(),
      "csferbrand": new FormControl(),
      "csfertype": new FormControl(),
      "csissusequantity": new FormControl(),
      "csdate": new FormControl(),
      "csferdisstate": new FormControl(),
      "cskankaniname": new FormControl(),
    });

    this.ssearch = this.fb.group( {
      "ssarea": new FormControl(),
      "ssfername": new FormControl(),
      "ssferbrand": new FormControl(),
      "ssfertype": new FormControl(),
      "ssdate": new FormControl(),
      "ssferdisstate": new FormControl(),
      "sskankaniname": new FormControl(),

    });

    this.form = this.fb.group( {
      "quantitydis": new FormControl(),
      "date": new FormControl(),
      "area": new FormControl(),
      "fertilizer": new FormControl(),
      "ferdistributionstate": new FormControl(),
      "kankani": new FormControl(),
    }, {updateOn:'change'});

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.es.getKankanis().then( (empkankanis: Employee[]) => {
      this.kankanis = empkankanis;
    });

    this.as.getAll("").then( (areas: Area[]) => {
      this.areas = areas;
    });

    this.fs.getAll("").then( (fertilis: Fertilizer[]) => {
      this.fertilizers = fertilis;
    });

    this.fbs.getAllList().then( (fertilibrand: Fertilizerbrand[]) => {
      this.fertilizerbrands = fertilibrand;
    });

    this.fts.getAllList().then( (fetilitypes: Fertilizertype[]) => {
      this.fertilizertypes = fetilitypes;
    });

    this.ftds.getAllList().then( (fertidisstates: Fertilizerdistributionstate[]) => {
      this.ferdistributionstates = fertidisstates;
    });

    this.createForm();

  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createForm() {
    this.form.controls['quantitydis'].setValidators([Validators.required,Validators.pattern("^\\d{1,4}(\\.\\d{1,2})?$")]);
    this.form.controls['date'].setValidators([Validators.required,]);
    this.form.controls['area'].setValidators([Validators.required,]);
    this.form.controls['fertilizer'].setValidators([Validators.required,]);
    this.form.controls['ferdistributionstate'].setValidators([Validators.required,]);
    this.form.controls['kankani'].setValidators([Validators.required]);

    for (const controlName in this.form.controls) {

      const control = this.form.controls[controlName];

      control.valueChanges.subscribe(value => {
        if (controlName =="date")
          value = this.dp.transform(new Date(value),'yyyy-MM-dd');

        if (this.oldfertilizerdistribution != undefined && control.valid) {
          // @ts-ignore
          if (value === this.fertilizerdistribution[controlName]) { control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else { control.markAsPristine(); }

      });

    }

    this.loadForm();
  }

  loadForm() {
    this.oldfertilizerdistribution = undefined;
    this.form.reset();

    Object.values(this.form.controls).forEach(control => {control.markAsTouched();} );
    this.enableButtons(true,false,false);
    this.selectedrow = null;
  }

  loadTable(query:string) {

    this.fds.getAll(query)
      .then( (ferdistibutions: Fertilizerdistribution[]) => { this.fertilizerdistributions = ferdistibutions; this.imageurl='assets/fullfilled.png' } )
      .catch( (error)=> { console.log(error); this.imageurl='assets/rejected.png' } )
      .finally( ()=> { this.data = new MatTableDataSource(this.fertilizerdistributions); this.data.paginator = this.paginator; } );

  }

  getModi(element: Fertilizer) {
    // return  element.number + '(' + element.callingname + ')';
  }


  filterTable():void{

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (ferdis: Fertilizerdistribution, filter: string) => {

      return (csearchdata.csarea==null || ferdis.area.code.toLowerCase().includes(csearchdata.csarea)) &&
        (csearchdata.csfername==null || ferdis.fertilizer.name.toLowerCase().includes(csearchdata.csfername)) &&
        (csearchdata.csferbrand==null || ferdis.fertilizer.fertilzerbrand.name.toLowerCase().includes(csearchdata.csferbrand)) &&
        (csearchdata.csfertype==null || ferdis.fertilizer.fertilizertype.name.toLowerCase().includes(csearchdata.csfertype)) &&
        (csearchdata.csissusequantity==null || ferdis.quantitydis.toString().includes(csearchdata.csissusequantity)) &&
        (csearchdata.csdate==null || ferdis.date.includes(csearchdata.csdate)) &&
        (csearchdata.csferdisstate==null || ferdis.ferdistributionstate.name.toLowerCase().includes(csearchdata.csferdisstate)) &&
        (csearchdata.cskankaniname==null || ferdis.kankani.callingname.toLowerCase().includes(csearchdata.cskankaniname));

    }

    this.data.filter = 'xx';

  }

  btnSearchMc(): void {

    const ssearchdata = this.ssearch.getRawValue();

    let areaid = ssearchdata.ssarea;
    let brandid = ssearchdata.ssferbrand;
    let fertypeid = ssearchdata.ssfertype;
    let date = ssearchdata.ssdate;
    let ferdisstateid = ssearchdata.ssferdisstate;
    let kankaniid = ssearchdata.sskankaniname;
    let fertiname = ssearchdata.ssfername;

    if(date != null) {date = this.dp.transform(new Date(date),'yyyy-MM-dd');}

    let query = "";

    if(areaid!=null) query = query + "&areaid=" + areaid;
    if(brandid!=null) query = query + "&brandid=" + brandid;
    if(fertypeid!=null) query = query + "&fertypeid=" + fertypeid;
    if(ferdisstateid!=null) query = query + "&ferdisstateid=" + ferdisstateid;
    if(kankaniid!=null) query = query + "&kankaniid=" + kankaniid;
    if(fertiname!=null) query = query + "&fertiname=" + fertiname;
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
        data: {heading: "Errors - Fertilizer Distribution Add", message: "You have following Errors <br> "+ errors}
      });

      errmsg.afterClosed().subscribe(async result => { if(!result) {return;} } );
    }
    else {
      this.fertilizerdistribution = this.form.getRawValue();

      let fertilizerdistributiondata: string ="";

      fertilizerdistributiondata = fertilizerdistributiondata + "<br> Area is : " + this.fertilizerdistribution.area.code;
      fertilizerdistributiondata = fertilizerdistributiondata + "<br> Fertilizer Name is : " + this.fertilizerdistribution.fertilizer.name;
      fertilizerdistributiondata = fertilizerdistributiondata + "<br> Quantity is : " + this.fertilizerdistribution.quantitydis;

      const confirm = this.dg.open(ConfirmComponent,{
        width:'500px',
        data: {heading: "Confirmation - Fertilizer Distribution Add", message: "Are you sure to Add the following Fertilizer Distribution? <br> <br> "+ fertilizerdistributiondata }
      });

      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if(result) {
          this.fds.add(this.fertilizerdistribution).then( ( responce: []|undefined ) => {
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
              data: {heading: "Status - Fertilizer Distribution Add", message: addmessage }
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
      }
    }
    return errors;
  }

  fillForm(fertilizerdistribution:Fertilizerdistribution) {

    if(fertilizerdistribution.ferdistributionstate.name=='Approved') this.enableButtons(false,true,false);
    else this.enableButtons(false,true,true);

    // this.enableButtons(false,true,true);

    this.selectedrow = fertilizerdistribution;

    this.fertilizerdistribution = JSON.parse(JSON.stringify(fertilizerdistribution));
    this.oldfertilizerdistribution = JSON.parse(JSON.stringify(fertilizerdistribution));

    // @ts-ignore
    this.fertilizerdistribution.area = this.areas.find(area => area.id === this.fertilizerdistribution.area.id);
    // @ts-ignore
    this.fertilizerdistribution.fertilizer = this.fertilizers.find(fer => fer.id === this.fertilizerdistribution.fertilizer.id);
    // @ts-ignore
    this.fertilizerdistribution.ferdistributionstate = this.ferdistributionstates.find(fds => fds.id === this.fertilizerdistribution.ferdistributionstate.id);
    // @ts-ignore
    this.fertilizerdistribution.kankani = this.kankanis.find(kankani => kankani.id === this.fertilizerdistribution.kankani.id);

    this.form.patchValue(this.fertilizerdistribution);
    this.form.markAsPristine();

  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent,{
        width:'500px',
        data: {heading: "Errors - Fertilizer Distribution Update",
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
          data: {heading: "Confirmation - Fertilizer Distribution Update",
            message: "Are you sure to Save following Updates? <br> <br> "+ updates }
        });

        confirm.afterClosed().subscribe( async result => {
          if (result) {
            this.fertilizerdistribution = this.form.getRawValue();

            // @ts-ignore
            this.fertilizerdistribution.id = this.oldfertilizerdistribution.id;

            this.fds.update(this.fertilizerdistribution).then( (responce: [] | undefined) => {

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
                data: {heading: "Status - Fertilizer Distribution Update",
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
          data: {heading: "Confirmation - Fertilizer Distribution Update",
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
      data: {heading: "Confirmation - Fertilizer Distribution Delete",
        message: "Are you sure to delete following Fertilizer Distribution? <br> <br> Area: "+ this.fertilizerdistribution.area.code + "<br> Fertilizer: "+this.fertilizerdistribution.fertilizer.name }
    });

    confirm.afterClosed().subscribe( async result => {
      if (result) {
        let delstatus: boolean= false;
        let delmessage: string= "Server not Found";

        this.fds.delete(this.fertilizerdistribution.id).then( (responce: [] | undefined) => {

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
            data: {heading: "Status - Fertilizer Distribution Delete", message:delmessage }
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
