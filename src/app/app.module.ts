import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HomeComponent} from './view/home/home.component';
import {LoginComponent} from './view/login/login.component';
import {MainwindowComponent} from './view/mainwindow/mainwindow.component';
import {EmployeeComponent} from './view/modules/employee/employee.component';
import {UserComponent} from './view/user/user.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MessageComponent} from "./util/dialog/message/message.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from "@angular/material/table";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MatPaginatorModule} from "@angular/material/paginator";
import {ConfirmComponent} from "./util/dialog/confirm/confirm.component";
import {DatePipe} from "@angular/common";
import { AreaComponent } from './view/modules/area/area.component';
import {CountbydesignationComponent} from "./reports/view/countbydesignation/countbydesignation.component";
import { CountareabyrootComponent } from './reports/view/countareabyroot/countareabyroot.component';
import {ArrearsByProgramComponent} from "./reports/view/arrearsbyprogram/arrearsbyprogram.component";
import { TeacropcomparisonComponent } from './reports/view/teacropcomparison/teacropcomparison.component';
import { PluckingComponent } from './view/modules/plucking/plucking.component';
import { AreateaquantityComponent } from './reports/view/areateaquantity/areateaquantity.component';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import {MatChipsModule} from '@angular/material/chips';
import { FertilizerComponent } from './view/modules/fertilizer/fertilizer.component';
import { FertilizerdistributionComponent } from './view/modules/fertilizerdistribution/fertilizerdistribution.component';
import { FertilizerdistrisummaryComponent } from './reports/view/fertilizerdistrisummary/fertilizerdistrisummary.component';
import { VehicleComponent } from './view/modules/vehicle/vehicle.component';
import { TransportComponent } from './view/modules/transport/transport.component';
import { FuelComponent } from './view/modules/fuel/fuel.component';
import { MydashboardComponent } from './view/mydashboard/mydashboard.component';
import { ActivityComponent } from './view/modules/activity/activity.component';
import { AttendenceComponent } from './view/modules/attendence/attendence.component';
import { SupplierComponent } from './view/modules/supplier/supplier.component';
import { PurchaseorderComponent } from './view/modules/purchaseorder/purchaseorder.component';
import { ProductionorderComponent } from './view/modules/productionorder/productionorder.component';
import { ProductionComponent } from './view/modules/production/production.component';
import {PrivilageComponent} from "./view/modules/privilage/privilage.component";
import {AuthorizationManager} from "./service/authorizationmanager";
import {JwtInterceptor} from "./service/JwtInterceptor";
import { PluckingpaymentComponent } from './view/modules/pluckingpayment/pluckingpayment.component';

import { CarouselModule } from 'ngx-bootstrap/carousel';
import { DistributorComponent } from './view/modules/distributor/distributor.component';
import { OrderrComponent } from './view/modules/orderr/orderr.component';
import { InvoiceComponent } from './view/modules/invoice/invoice.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    MainwindowComponent,
    EmployeeComponent,
    UserComponent,
    MessageComponent,
    ConfirmComponent,
    AreaComponent,
    CountbydesignationComponent,
    CountareabyrootComponent,
    ArrearsByProgramComponent,
    TeacropcomparisonComponent,
    PluckingComponent,
    AreateaquantityComponent,
    DashboardComponent,
    FertilizerComponent,
    FertilizerdistributionComponent,
    FertilizerdistrisummaryComponent,
    VehicleComponent,
    TransportComponent,
    FuelComponent,
    MydashboardComponent,
    ActivityComponent,
    AttendenceComponent,
    SupplierComponent,
    PurchaseorderComponent,
    ProductionorderComponent,
    ProductionComponent,
    PrivilageComponent,
    PluckingpaymentComponent,
    DistributorComponent,
    OrderrComponent,
    InvoiceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule,
    HttpClientModule,
    MatPaginatorModule,
    MatSelectModule,
    MatChipsModule,
    CarouselModule.forRoot(),
  ],
  providers: [
    DatePipe,
    AuthorizationManager,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
