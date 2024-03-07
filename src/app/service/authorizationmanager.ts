import { Injectable } from '@angular/core';
import { AuthoritySevice } from './authoritysevice';

@Injectable()
export class AuthorizationManager {
  private readonly localStorageUsreName = 'username';
  private readonly localStorageButtonKey = 'buttonState';

  private readonly localStorageAdminmenu = 'AdminmenuState';
  private readonly localStorageAreamenu = 'AreamenuState';
  private readonly localStoragePluckingmenu = 'PluckingmenuState';
  private readonly localStorageFertilizermenu = 'FertilizermenuState';
  private readonly localStorageVehiclemenu = 'VehiclemenuState';
  private readonly localStorageSuppliermenu = 'SuppliermenuState';
  private readonly localStorageProductionmenu = 'ProductionmenuState';
  private readonly localStorageDistributormenu = 'DistributormenuState';
  private readonly localStorageOrdermenu = 'OrdermenuState';
  private readonly localStorageDailymenu = 'DailymenuState';
  private readonly localStorageReportmenu = 'ReportmenuState';

  public enaadd = false;
  public enaupd = false;
  public enadel = false;

  AdminmenuItems = [
    { name: 'Employee', accessFlag: true, routerLink: 'employee' },
    { name: 'User', accessFlag: true, routerLink: 'user' },
    { name: 'Privilege', accessFlag: true, routerLink: 'privilege' }
  ];

  AreamenuItems = [
    { name: 'Area', accessFlag: true, routerLink: 'area' }

  ];

  PluckingmenuItems = [
    { name: 'Plucking', accessFlag: true, routerLink: 'plucking' }

  ];

  FertilizermenuItems = [
    { name: 'Fertilizer', accessFlag: true, routerLink: 'fertilizer' },
    { name: 'Fertilizer Distribution', accessFlag: true, routerLink: 'fertilizerdistribution' },

  ];

  VehiclemenuItems = [
    { name: 'Vehicle', accessFlag: true, routerLink: 'vehicle' },
    { name: 'Transport', accessFlag: true, routerLink: 'transport' },
    { name: 'Fuel', accessFlag: true, routerLink: 'fuel' },

  ];

  SuppliermenuItems = [
    { name: 'Supplier', accessFlag: true, routerLink: 'suppilier' },
    { name: 'Purchase Order', accessFlag: true, routerLink: 'porder' }
  ];

  ProductionmenuItems = [
    { name: 'Production', accessFlag: true, routerLink: 'production' },
    { name: 'Production Order', accessFlag: true, routerLink: 'productionorder' }
  ];

  DistributormenuItems = [
    { name: 'Distributor', accessFlag: true, routerLink: 'distributor' },

  ];

  OrdermenuItems = [
    { name: 'Order', accessFlag: true, routerLink: 'orderr' },
    { name: 'Invoice', accessFlag: true, routerLink: 'invoice' },
  ];

  DailymenuItems = [
    { name: 'Attendence', accessFlag: true, routerLink: 'attendence' },
    { name: 'Activities', accessFlag: true, routerLink: 'activity' },
    { name: 'Payments', accessFlag: true, routerLink: 'pluckingpayment' },
  ];

  ReportmenuItems = [
    { name: 'Designation', accessFlag: true, routerLink: 'reportcountbydesignation' },
    { name: 'Areas Of Division', accessFlag: true, routerLink: 'reportcountareabyroot' },
    // { name: 'Arrears Program', accessFlag: true, routerLink: 'reportarrearsbyprogram' },
    { name: 'Tea Crop Sum', accessFlag: true, routerLink: 'reportteacrop' },
    // { name: 'Payment Reports', accessFlag: true, routerLink: 'employee' },
    // { name: 'Attendence Report', accessFlag: true, routerLink: 'employee' },
    { name: 'Area Tea Leaves', accessFlag: true, routerLink: 'areateaquantity' },
    { name: 'Fertilizer Distribution Summary', accessFlag: true, routerLink: 'fertilizerdistributionsummary' },

  ];

  constructor(private am: AuthoritySevice) {}

  enableButtons(authorities: { module: string; operation: string }[]): void {
    // Find the user's modules
    const userModules = authorities.map(authority => authority.module.toLowerCase());

    // Check if the user has access to each operation and set the button state accordingly
    this.enaadd = authorities.some(authority => authority.operation === 'insert' && userModules.includes(authority.module.toLowerCase()));
    this.enaupd = authorities.some(authority => authority.operation === 'update' && userModules.includes(authority.module.toLowerCase()));
    this.enadel = authorities.some(authority => authority.operation === 'delete' && userModules.includes(authority.module.toLowerCase()));

    // Save button state in localStorage
    localStorage.setItem(this.localStorageButtonKey, JSON.stringify({ enaadd: this.enaadd, enaupd: this.enaupd, enadel: this.enadel}));
  }

  // enableButtons(authorities: { module: string; operation: string }[]): void {
  //   this.enaadd = authorities.some(authority => authority.operation === 'insert');
  //   this.enaupd = authorities.some(authority => authority.operation === 'update');
  //   this.enadel = authorities.some(authority => authority.operation === 'delete');
  //
  //   // Save button state in localStorage
  //   localStorage.setItem(this.localStorageButtonKey, JSON.stringify({ enaadd: this.enaadd, enaupd: this.enaupd, enadel: this.enadel }));
  // }

  enableMenues(modules: { module: string; operation: string }[]): void {

    this.AdminmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.AreamenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.PluckingmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.FertilizermenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.VehiclemenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.SuppliermenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.ProductionmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.DistributormenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.OrdermenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.DailymenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    this.ReportmenuItems.forEach(menuItem => {
      menuItem.accessFlag = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
    });

    // Save menu state in localStorage
    localStorage.setItem(this.localStorageAdminmenu, JSON.stringify(this.AdminmenuItems));
    localStorage.setItem(this.localStorageAreamenu, JSON.stringify(this.AreamenuItems));
    localStorage.setItem(this.localStoragePluckingmenu, JSON.stringify(this.PluckingmenuItems));
    localStorage.setItem(this.localStorageFertilizermenu, JSON.stringify(this.FertilizermenuItems));
    localStorage.setItem(this.localStorageVehiclemenu, JSON.stringify(this.VehiclemenuItems));
    localStorage.setItem(this.localStorageSuppliermenu, JSON.stringify(this.SuppliermenuItems));
    localStorage.setItem(this.localStorageProductionmenu, JSON.stringify(this.ProductionmenuItems));
    localStorage.setItem(this.localStorageDistributormenu, JSON.stringify(this.DistributormenuItems));
    localStorage.setItem(this.localStorageOrdermenu, JSON.stringify(this.OrdermenuItems));
    localStorage.setItem(this.localStorageDailymenu, JSON.stringify(this.DailymenuItems));
    localStorage.setItem(this.localStorageReportmenu, JSON.stringify(this.ReportmenuItems));
  }

  async getAuth(username: string): Promise<void> {

    this.setUsername(username);

    try {
      const result = await this.am.getAutorities(username);
      if (result !== undefined) {
        const authorities = result.map(authority => {
          const [module, operation] = authority.split('-');
          return { module, operation };
        });
        console.log(authorities);

        this.enableButtons(authorities);
        this.enableMenues(authorities);

      } else {
        console.log('Authorities are undefined');
      }
    } catch (error) {
      console.error(error);
    }
  }

  getUsername(): string {
    return localStorage.getItem(this.localStorageUsreName) || '';
  }

  setUsername(value: string): void {
    localStorage.setItem(this.localStorageUsreName, value);
  }

  getEnaAdd(): boolean {
    return this.enaadd;
  }

  getEnaUpd(): boolean {
    return this.enaupd;
  }

  getEnaDel(): boolean {
    return this.enadel;
  }

  initializeButtonState(): void {
    const buttonState = localStorage.getItem(this.localStorageButtonKey);
    if (buttonState) {
      const { enaadd, enaupd, enadel } = JSON.parse(buttonState);
      this.enaadd = enaadd;
      this.enaupd = enaupd;
      this.enadel = enadel;
    }
  }

  initializeMenuState(): void {

    const adminmenuState = localStorage.getItem(this.localStorageAdminmenu);
    const areamenuState = localStorage.getItem(this.localStorageAreamenu);
    const pluckingmenuState = localStorage.getItem(this.localStoragePluckingmenu);
    const fertilizermenuState = localStorage.getItem(this.localStorageFertilizermenu);
    const vehiclemenuState = localStorage.getItem(this.localStorageVehiclemenu);
    const suppliermenuState = localStorage.getItem(this.localStorageSuppliermenu);
    const productionmenuState = localStorage.getItem(this.localStorageProductionmenu);
    const distributormenuState = localStorage.getItem(this.localStorageDistributormenu);
    const ordermenuState = localStorage.getItem(this.localStorageOrdermenu);
    const dailymenuState = localStorage.getItem(this.localStorageDailymenu);
    const reportmenuState = localStorage.getItem(this.localStorageReportmenu);

    if (adminmenuState) {
      this.AdminmenuItems = JSON.parse(adminmenuState);
    }

    if (areamenuState) {
      this.AreamenuItems = JSON.parse(areamenuState);
    }

    if (pluckingmenuState) {
      this.PluckingmenuItems = JSON.parse(pluckingmenuState);
    }

    if (fertilizermenuState) {
      this.FertilizermenuItems = JSON.parse(fertilizermenuState);
    }

    if (vehiclemenuState) {
      this.VehiclemenuItems = JSON.parse(vehiclemenuState);
    }

    if (suppliermenuState) {
      this.SuppliermenuItems = JSON.parse(suppliermenuState);
    }

    if (productionmenuState) {
      this.ProductionmenuItems = JSON.parse(productionmenuState);
    }

    if (distributormenuState) {
      this.DistributormenuItems = JSON.parse(distributormenuState);
    }

    if (ordermenuState) {
      this.OrdermenuItems = JSON.parse(ordermenuState);
    }

    if (dailymenuState) {
      this.DailymenuItems = JSON.parse(dailymenuState);
    }

    if (reportmenuState) {
      this.ReportmenuItems = JSON.parse(reportmenuState);
    }



  }

  clearUsername(): void {
    localStorage.removeItem(this.localStorageUsreName);
  }

  clearButtonState(): void {
    localStorage.removeItem(this.localStorageButtonKey);
  }

  clearMenuState(): void {
    localStorage.removeItem(this.localStorageAdminmenu);
    localStorage.removeItem(this.localStorageAreamenu);
    localStorage.removeItem(this.localStoragePluckingmenu);
    localStorage.removeItem(this.localStorageFertilizermenu);
    localStorage.removeItem(this.localStorageVehiclemenu);
    localStorage.removeItem(this.localStorageSuppliermenu);
    localStorage.removeItem(this.localStorageProductionmenu);
    localStorage.removeItem(this.localStorageDistributormenu);
    localStorage.removeItem(this.localStorageOrdermenu);
    localStorage.removeItem(this.localStorageDailymenu);
    localStorage.removeItem(this.localStorageReportmenu);

  }

  isMenuItemDisabled(menuItem: { accessFlag: boolean }): boolean {
    return !menuItem.accessFlag;
  }

}
