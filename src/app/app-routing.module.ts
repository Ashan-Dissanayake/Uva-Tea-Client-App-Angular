import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./view/login/login.component";
import {MainwindowComponent} from "./view/mainwindow/mainwindow.component";
import {EmployeeComponent} from "./view/modules/employee/employee.component";
import {HomeComponent} from "./view/home/home.component";
import {UserComponent} from "./view/user/user.component";
import {AreaComponent} from "./view/modules/area/area.component";
import {CountbydesignationComponent} from "./reports/view/countbydesignation/countbydesignation.component";
import {CountareabyrootComponent} from "./reports/view/countareabyroot/countareabyroot.component";
import {ArrearsByProgramComponent} from "./reports/view/arrearsbyprogram/arrearsbyprogram.component";
import {TeacropcomparisonComponent} from "./reports/view/teacropcomparison/teacropcomparison.component";
import {PluckingComponent} from "./view/modules/plucking/plucking.component";
import {AreateaquantityComponent} from "./reports/view/areateaquantity/areateaquantity.component";
import {DashboardComponent} from "./view/dashboard/dashboard.component";
import {FertilizerComponent} from "./view/modules/fertilizer/fertilizer.component";
import {FertilizerdistributionComponent} from "./view/modules/fertilizerdistribution/fertilizerdistribution.component";
import {VehicleComponent} from "./view/modules/vehicle/vehicle.component";
import {FertilizerdistrisummaryComponent} from "./reports/view/fertilizerdistrisummary/fertilizerdistrisummary.component";
import {TransportComponent} from "./view/modules/transport/transport.component";
import {FuelComponent} from "./view/modules/fuel/fuel.component";
import {MydashboardComponent} from "./view/mydashboard/mydashboard.component";
import {ActivityComponent} from "./view/modules/activity/activity.component";
import {AttendenceComponent} from "./view/modules/attendence/attendence.component";
import {SupplierComponent} from "./view/modules/supplier/supplier.component";
import {PurchaseorderComponent} from "./view/modules/purchaseorder/purchaseorder.component";
import {ProductionorderComponent} from "./view/modules/productionorder/productionorder.component";
import {ProductionComponent} from "./view/modules/production/production.component";
import {PrivilageComponent} from "./view/modules/privilage/privilage.component";
import {PluckingpaymentComponent} from "./view/modules/pluckingpayment/pluckingpayment.component";
import {DistributorComponent} from "./view/modules/distributor/distributor.component";
import {OrderrComponent} from "./view/modules/orderr/orderr.component";
import {InvoiceComponent} from "./view/modules/invoice/invoice.component";

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {
    path: "main",
    component: MainwindowComponent,
    children: [
      {path: "home", component: HomeComponent},
      {path: "dashboard", component: DashboardComponent},
      {path: "employee", component: EmployeeComponent},
      {path: "user", component: UserComponent},
      {path: "area", component: AreaComponent},
      {path: "plucking", component: PluckingComponent},
      {path: "fertilizer", component: FertilizerComponent},
      {path: "fertilizerdistribution", component: FertilizerdistributionComponent},
      {path: "reportcountbydesignation", component: CountbydesignationComponent},
      {path: "reportcountareabyroot", component: CountareabyrootComponent},
      {path: "reportarrearsbyprogram", component: ArrearsByProgramComponent},
      {path: "areateaquantity", component: AreateaquantityComponent},
      {path: "reportteacrop", component: TeacropcomparisonComponent},
      {path: "vehicle", component: VehicleComponent},
      {path: "transport", component: TransportComponent},
      {path: "fuel", component: FuelComponent},
      {path: "mydashboard", component: MydashboardComponent},
      {path: "activity", component: ActivityComponent},
      {path: "attendence", component: AttendenceComponent},
      {path: "suppilier", component: SupplierComponent},
      {path: "porder", component: PurchaseorderComponent},
      {path: "productionorder", component: ProductionorderComponent},
      {path: "production", component: ProductionComponent},
      {path: "fertilizerdistributionsummary", component: FertilizerdistrisummaryComponent},
      {path: "pluckingpayment", component: PluckingpaymentComponent},
      {path: "distributor", component: DistributorComponent},
      {path: "orderr", component: OrderrComponent},
      {path: "invoice", component: InvoiceComponent},
      {path: "privilege", component: PrivilageComponent},
    ]
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
