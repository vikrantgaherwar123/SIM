import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../services/invoice.service'
import { EstimateService } from '../../services/estimate.service'

import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'
import { Store } from '@ngrx/store'
import * as invoiceActions from '../../actions/invoice.action'

import * as clientActions from '../../actions/client.action'
import * as productActions from '../../actions/product.action'
import * as termActions from '../../actions/terms.action'
import { AppState } from '../../app.state'
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
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


// loader script
      $(function() {
        // all clients
        var client = 0;
        var interval_client = setInterval(function() {
          client += 10;
            $("#client_records")
            .css("width", client + "%")
            .attr("aria-valuenow", client)
            .text("Client Loading " + client + " % Complete");
            if (client >= 100)
                clearInterval(interval_client);
        }, 900);


        var product = 0;
        var interval_product = setInterval(function() {
          product += 20;
            $("#product_records")
            .css("width", product + "%")
            .attr("aria-valuenow", product)
            // .text("Products Loading" + product + "% Complete");
            .text("Products Loading " + product + " % Complete");
            if (product >= 100)
                clearInterval(interval_product);
        }, 1000);

        var term = 0;
        var interval_terms = setInterval(function() {
          term += 20;
            $("#term_records")
            .css("width", term + "%")
            .attr("aria-valuenow", term)
            .text("Terms and Conditions Loading " + term + " % Complete");
            if (term >= 100)
                clearInterval(interval_terms);
        }, 500);

        var setting = 0;
        var interval_setting = setInterval(function() {
          setting += 20;
            $("#setting_records")
            .css("width", setting + "%")
            .attr("aria-valuenow", setting)
            .text("Settings Loading " + setting + " % Complete");
            if (setting >= 100)
                clearInterval(interval_setting);
        }, 800);
      });
     }

     

  ngOnInit() {
    this.fetchBasicData();
    
  }

  fetchBasicData() {
    // Fetch clients, products, terms and settings, store them and redirect to invoice page
    $.when(this.clientService.fetch().toPromise(),
      this.productService.fetch().toPromise(),
      this.termConditionService.fetch().toPromise(),
      this.settingService.fetch().toPromise(),
      this.invoiceService.fetch().toPromise(),
      this.estimateService.fetch().toPromise()
    ).done((clientResponse: apiRespo, productResponse: apiRespo, termResponse: apiRespo, settingResponse: any,
      invoiceResponse: apiRespo,estimateResponse: apiRespo) => {
      if(clientResponse.records){
      // this.store.dispatch(new clientActions.add(clientResponse.records))
      console.log("clients fetched");
      
      }
      if(productResponse.records){
      // this.store.dispatch(new productActions.add(productResponse.records.filter(prod => prod.enabled == 0)))
      console.log("products fetched");
      }
      if(termResponse.termsAndConditionList){
      // this.store.dispatch(new termActions.add(termResponse.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
      console.log("tnc fetched");
      }
      // else{
      // let addProductTemp = [];
      // this.store.dispatch(new termActions.add(addProductTemp));
      // }
      setStorage(settingResponse.settings)
      if(invoiceResponse.records){
      console.log("invoice fetched");
        
      }
      if(estimateResponse.records){
      console.log("estimate fetched");
        
      }
      this.router.navigate(['/invoice/add'])
    })
  }
   

}
