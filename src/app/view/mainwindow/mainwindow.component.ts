import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {AuthorizationManager} from "../../service/authorizationmanager";


@Component({
  selector: 'app-mainwindow',
  templateUrl: './mainwindow.component.html',
  styleUrls: ['./mainwindow.component.css']
})
export class MainwindowComponent {

  opened: boolean = true;


  constructor(private router: Router,public authService: AuthorizationManager) {
  }

  logout(): void {
    this.router.navigateByUrl("login")
    this.authService.clearUsername();
    this.authService.clearButtonState();
    this.authService.clearMenuState();
    localStorage.removeItem("Authorization");
  }

  adminmenuItems = this.authService.AdminmenuItems;
  areamenuItems = this.authService.AreamenuItems;
  pluckingmenuItems = this.authService.PluckingmenuItems;
  fertilizermenuItems = this.authService.FertilizermenuItems;
  vehiclemenuItems = this.authService.VehiclemenuItems;
  suppliermenuItems = this.authService.SuppliermenuItems;
  productionmenuItems = this.authService.ProductionmenuItems;
  distributormenuItems = this.authService.DistributormenuItems;
  ordermenuItems = this.authService.OrdermenuItems;
  dailymenuItems = this.authService.DailymenuItems;
  reportmenuItems = this.authService.ReportmenuItems;

  isMenuVisible(category: string): boolean {
    switch (category) {

      case 'Admin':
        return this.adminmenuItems.some(menuItem => menuItem.accessFlag);

      case 'Area':
        return this.areamenuItems.some(menuItem => menuItem.accessFlag);

      case 'Plucking':
        return this.pluckingmenuItems.some(menuItem => menuItem.accessFlag);

        case 'Fertilizer':
        return this.fertilizermenuItems.some(menuItem => menuItem.accessFlag);

      case 'Vehicle':
        return this.vehiclemenuItems.some(menuItem => menuItem.accessFlag);

      case 'Supplier':
        return this.suppliermenuItems.some(menuItem => menuItem.accessFlag);

      case 'Production':
        return this.productionmenuItems.some(menuItem => menuItem.accessFlag);

      case 'Distributor':
        return this.distributormenuItems.some(menuItem => menuItem.accessFlag);

      case 'Order':
        return this.ordermenuItems.some(menuItem => menuItem.accessFlag);

      case 'Daily':
        return this.dailymenuItems.some(menuItem => menuItem.accessFlag);

      case 'Report':
        return this.reportmenuItems.some(menuItem => menuItem.accessFlag);

      default:
        return false;
    }
  }



}
