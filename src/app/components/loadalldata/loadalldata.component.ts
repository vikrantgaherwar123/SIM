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
     }

  ngOnInit() {
    this.fetchBasicData();
    this.clients();
    this.products();
    this.terms();
    this.settings();
    
  }
  clients() {
    var elem = document.getElementById("clients");   
    var count_client = document.getElementById("counting_client");
    var width = 20;
    var id = setInterval(frame, 70);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
      } else {
        width++; 
        elem.style.width = width + '%'; 
        count_client.innerHTML = width * 1  + '%';
        count_client.style.fontSize = '25px';
        count_client.style.color = '#605e5e';
        count_client.style.marginTop = '20px';
        count_client.style.fontFamily = 'font-family: quicksand_bold;';
      }
    }
  }

  products(){
    var elem = document.getElementById("products");   
    var count_product = document.getElementById("counting_product");
    var width = 35;
    var id = setInterval(frame, 70);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
      } else {
        width++; 
        elem.style.width = width + '%';
        count_product.innerHTML = width * 1  + '%';
        count_product.style.color = '#605e5e';
        count_product.style.fontSize = '25px';
        count_product.style.fontFamily = 'font-family: quicksand_bold;';
      }
    }
  }
  terms(){
    var elem = document.getElementById("terms");   
    var count_terms = document.getElementById("counting_terms");
    var width = 30;
    var id = setInterval(frame, 70);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
      } else {
        width++; 
        elem.style.width = width + '%';
        count_terms.innerHTML = width * 1  + '%';
        count_terms.style.color = '#605e5e';
        count_terms.style.fontSize = '25px';
        count_terms.style.fontFamily = 'font-family: quicksand_bold;';
      }
    }
  }

  settings(){
    var elem = document.getElementById("settings");   
    var count_setting = document.getElementById("counting_setting");
    var width = 40;
    var id = setInterval(frame, 70);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
      } else {
        width++; 
        elem.style.width = width + '%';
        count_setting.innerHTML = width * 1  + '%';
        count_setting.style.color = '#605e5e';
        count_setting.style.fontSize = '25px';
        count_setting.style.fontFamily = 'font-family: quicksand_bold;';
      }
    }
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
