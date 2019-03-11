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
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client'

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
      }
      if(productResponse.records){
      }
      if(termResponse.termsAndConditionList){
      }
      setStorage(settingResponse.settings)
      if(invoiceResponse.records){
      }
      if(estimateResponse.records){
      }
      // this.router.navigate(['/invoice/add'])
    })
  }
   

}
