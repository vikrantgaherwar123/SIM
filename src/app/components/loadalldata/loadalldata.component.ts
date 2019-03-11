import { Component, OnInit } from '@angular/core';
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of } from 'rxjs';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store'

import { InvoiceService } from '../../services/invoice.service'
import { EstimateService } from '../../services/estimate.service'

import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'
import * as invoiceActions from '../../actions/invoice.action'

import * as clientActions from '../../actions/client.action'
import * as productActions from '../../actions/product.action'
import * as termActions from '../../actions/terms.action'
import { AppState } from '../../app.state'

import { client } from 'src/app/interface';
import { response as apiRespo } from '../../interface'

import { setStorage } from 'src/app/globalFunctions';


@Component({
  selector: 'app-loadalldata',
  templateUrl: './loadalldata.component.html',
  styleUrls: ['./loadalldata.component.css']
})
export class LoadalldataComponent implements OnInit {
  private clientList: client[]
  clientsCount: number;
  productsCount: number;
  termsCount: number;
  invoiceCount: number;
  estimateCount: number;
  clientsCompleted: boolean = false;
  productsCompleted: boolean = false;
  termsCompleted: boolean = false;
  settingsCompleted: boolean = false;
  clientRecords: {};
  productRecords: any;
  termsRecords: any;
  settingsRecords: any;
  invoiceRecords: Object;
  estimateRecords: Object;
  constructor(private route: ActivatedRoute,
    private router: Router,
    public toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private settingService: SettingService,
    private productService: ProductService,
    private store: Store<AppState>) {

  }

  ngOnInit() {
    this.fetchBasicData();
  }

  fetchBasicData() {
    // Fetch clients, products, terms and settings, store them and redirect to invoice page
    this.clientService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        (result: any) => {
          this.clientRecords = result.records
          this.loadClients();
        },
        err => console.log(err)
      )


    this.productService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        (result: any) => {
          this.productRecords = result.records
          this.loadProducts();
        },
        err => console.log(err)
      )


    this.termConditionService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        (result: any) => {
          this.termsRecords = result.termsAndConditionList
          this.loadTerms();
        },
        err => console.log(err))


    this.settingService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        (result: any) => {
          this.settingsRecords = result.settings
          this.loadSettings();
        },
        err => console.log(err))


    this.invoiceService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        result => this.invoiceRecords = result,
        err => console.log(err))


    this.estimateService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    }))
      .subscribe(
        result => this.estimateRecords = result,
        err => console.log(err))

  }

  loadClients() {
    if (this.clientRecords) {
      this.clientsCompleted = true
      if (this.clientsCompleted === true) {
        this.navigateToAdd();
      }
    }
  }

  loadProducts() {
    if (this.productRecords) {
      this.productsCompleted = true
      if (this.productsCompleted === true) {
        this.navigateToAdd();
      }
    }
  }

  loadTerms() {
    if (this.termsRecords) {
      this.termsCompleted = true
      if (this.termsCompleted === true) {
        this.navigateToAdd();
      }
    }
  }

  loadSettings() {
    if (this.settingsRecords) {
      this.settingsCompleted = true
      if (this.settingsCompleted === true) {
        this.navigateToAdd();
      }
    }
  }

  navigateToAdd(){
    if(this.settingsCompleted && this.termsCompleted && this.clientsCompleted && this.productsCompleted === true ){
      setTimeout(() => {
        this.router.navigate(['/invoice/add']);
    }, 1000);  //5s
    }
  }



}
