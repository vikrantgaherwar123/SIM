import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store'
import { EstimateService } from '../../../services/estimate.service'

import * as invoiceActions from '../../../actions/invoice.action'
import { AppState } from 'src/app/app.state';
import { invoice, client, setting, estimate, recentEstimates, addEditEstimate } from 'src/app/interface';
import { ClientService } from 'src/app/services/client.service';
import { SettingService } from '../../../services/setting.service'

import { response } from '../../../interface'
import { setStorage } from 'src/app/globalFunctions';

import * as estimateActions from '../../../actions/estimate.action'


@Component({
  selector: 'app-view-todays-estimate',
  templateUrl: './view-todays-estimate.component.html',
  styleUrls: ['./view-todays-estimate.component.css']
})
export class ViewTodaysEstimateComponent implements OnInit {

  settings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  estimateList: estimate[]
  recentEstimateList: recentEstimates[];
  activeEst: estimate
  private clientList: client[]
  activeClient: client = <client>{}
  clientListLoading: boolean;
  estListLoader: boolean;
  settingsLoading: boolean;
  estimateId: string;
  showDiscountLabel: boolean;
  noDiscountOnItem: boolean;
  noTaxOnItem: boolean;
  isRecentInvoice: boolean;

  constructor(private route: ActivatedRoute,
    public router: Router,
    private estimateService: EstimateService,
    private settingService: SettingService,
    private store: Store<AppState>,private clientService: ClientService,) {
    store.select('client').subscribe(clients => this.clientList = clients)
    store.select('recentEstimates').subscribe(recentInvoices => this.recentEstimateList = recentInvoices)

   }

  ngOnInit() {
    if (this.clientList.length < 1) {
      this.fetchClients();
    }else{
      this.clientList = this.clientList.filter(recs => recs.enabled == 0)
    }
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    if(this.recentEstimateList.length < 1){
      this.isRecentInvoice = true;
      this.fetchEstimates();
    }else{
      this.isRecentInvoice = false;
      this.route.params.subscribe(params => {
        if (params.estId) {
         this.setActiveEst(params.estId);
        }
      })
    }
  }

  fetchClients(){
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        this.clientList = this.clientList.filter(recs => recs.enabled == 0)
      }, err => this.openErrorModal());
      
  }

  fetchEstimates() {
    // Fetch estimates with given query

    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var  query = {
        startDate: start.getTime(),
        endDate: new Date().getTime(),
        serviceIdentifier: true
      }

    this.estListLoader = true
    this.estimateService.fetchTodaysData(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.estListLoader = false
        this.store.dispatch(new estimateActions.resetRecentEstimate(response.list ? response.list.filter(rec => rec.enabled == 0) : []))
        // Set Active invoice whenever invoice list changes
        this.store.select('recentEstimates').subscribe(estimates => {
          this.recentEstimateList = estimates
        })
      }
      this.route.params.subscribe(params => {
        if (params.estId) {
         this.setActiveEst(params.estId);
        }
      })
    }, err => this.openErrorModal());
  }

  setActiveEst(estId: string = '') {
    this.estimateId = estId;
    this.activeEst = this.recentEstimateList.filter(est => est.unique_identifier == estId)[0]
    //display label and values if tax on item & discount on item selected and values are there
    if(this.activeEst !== undefined){
      if(this.isRecentInvoice){
        this.activeEst = <addEditEstimate>this.estimateService.changeKeysForApi(this.activeEst)
      }
      

      // if (this.activeEst.alstQuotProduct) {
      //   var temp = []
      //   for (let i = 0; i < this.activeEst.alstQuotProduct.length; i++) {
      //     temp.push({
      //       description: this.activeEst.alstQuotProduct[i].description,
      //       discountRate: this.activeEst.alstQuotProduct[i].discountRate ? this.activeEst.alstQuotProduct[i].discountRate :this.activeEst.alstQuotProduct[i].discount,
      //       productName: this.activeEst.alstQuotProduct[i].productName ? this.activeEst.alstQuotProduct[i].productName :this.activeEst.alstQuotProduct[i].product_name,
      //       qty: this.activeEst.alstQuotProduct[i].qty ? this.activeEst.alstQuotProduct[i].qty : this.activeEst.alstQuotProduct[i].quantity ,
      //       rate: this.activeEst.alstQuotProduct[i].rate,
      //       taxRate: this.activeEst.alstQuotProduct[i].tax_rate ? this.activeEst.alstQuotProduct[i].tax_rate : this.activeEst.alstQuotProduct[i].taxRate,
      //       price: this.activeEst.alstQuotProduct[i].price ? this.activeEst.alstQuotProduct[i].price : this.activeEst.alstQuotProduct[i].total,
      //       uniqueKeyFKProduct: this.activeEst.alstQuotProduct[i].uniqueKeyFKProduct,
      //       unit: this.activeEst.alstQuotProduct[i].unit,
      //     })
      //   }
      //   this.activeEst.alstQuotProduct = temp
      // }

      for(let i = 0; i < this.activeEst.listItems.length; i++){
        if(this.activeEst.listItems[i].discount || this.activeEst.listItems[i].discount == 0){
          
          this.activeEst.listItems[i].discountRate = this.activeEst.listItems[i].discount;
        }
        if(this.activeEst.listItems[i].discount_amount || this.activeEst.listItems[i].discount_amount ==0){
          this.activeEst.listItems[i].discountAmt = this.activeEst.listItems[i].discount_amount;
        }
        if(this.activeEst.listItems[i].tax_amount || this.activeEst.listItems[i].tax_amount == 0){
          this.activeEst.listItems[i].taxAmount = this.activeEst.listItems[i].tax_amount;
        }
        
        if(this.activeEst.listItems[i].product_name){
          this.activeEst.listItems[i].productName = this.activeEst.listItems[i].product_name;
        }
        if(this.activeEst.listItems[i].quantity){
          this.activeEst.listItems[i].qty = this.activeEst.listItems[i].quantity;
        }
        if(this.activeEst.listItems[i].total){
          this.activeEst.listItems[i].price = this.activeEst.listItems[i].total;
        }
        if(this.activeEst.listItems[i].unique_identifier){
          this.activeEst.listItems[i].uniqueKeyFKQuotation = this.activeEst.listItems[i].unique_identifier;
        }
      }

      
        if (this.activeEst.listItems) {
          var temp = []
          for (let i = 0; i < this.activeEst.listItems.length; i++) {
            
            temp.push({
              description: this.activeEst.listItems[i].description,
              discountRate: this.activeEst.listItems[i].discountRate,
              discount_amount: this.activeEst.listItems[i].discountAmt,
              tax_amount: this.activeEst.listItems[i].taxAmount,
              productName: this.activeEst.listItems[i].productName,
              qty: this.activeEst.listItems[i].qty,
              rate: this.activeEst.listItems[i].rate,
              taxRate: this.activeEst.listItems[i].taxRate,
              price: this.activeEst.listItems[i].price,
              uniqueKeyFKProduct: this.activeEst.listItems[i].uniqueKeyFKQuotation,
              unit: this.activeEst.listItems[i].unit,
            })
          }
          this.activeEst.listItems = temp
        }
      

      
    //display label and values if tax on Bill & discount on Bill selected and values are there
    if(this.activeEst.discount > 0){
      this.noDiscountOnItem = false;
    }

    if(this.activeEst.taxrate > 0){
      this.noTaxOnItem = false;
    }
    }
    this.setActiveClient()
  }
 
  setActiveClient() {
    if (this.activeEst && this.clientList) {
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEst.unique_key_fk_client)[0]
      if (client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
  }

  removeEmptyNameClients(){
    //remove whitespaces from clientlist
    for (let i = 0; i < this.clientList.length; i++) {
      if(!this.clientList[i].name){
        this.clientList.splice(i,1);
      }else{
      var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "");
      if (tempClient === "") {
        this.clientList.splice(i,1);
      }
    }
    
    }
    this.clientList = this.clientList.filter(client => !client.name || client.name !== "" );
  }

  getClientName(id) {
    if(this.clientList.length !== 0){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  goEdit(estId) {
    this.router.navigate([`estimate/edit/${estId}`])
  }

  makeInvoice() {
    this.router.navigate([`invoice/edit/${this.activeEst.unique_identifier}`])
  }

  downloadEstimate(type) {
    if (type == "download") {
      $('#downloadBtn').attr('disabled', 'disabled')
    } else if (type == "preview") {
      $('#previewBtn').attr('disabled', 'disabled')
    }

    this.estimateService.fetchPdf(this.activeEst.unique_identifier).subscribe((response: any) => {
      var file = new Blob([response], { type: 'application/pdf' })

      var a = window.document.createElement('a')
      a.href = window.URL.createObjectURL(file)

      document.body.appendChild(a)
      if (type == "download") {
        a.download = this.getFileName()
        a.click()
        $('#downloadBtn').removeAttr('disabled')
      } else if (type == "preview") {
        window.open(a.toString())
        $('#previewBtn').removeAttr('disabled')
      }
    },err => this.openErrorModal()
    )
  }

  getFileName() {
    var d = new Date()

    var day = d.getDate() <= 9 ? '0' + d.getDate() : d.getDate()
    var month = d.toString().split(' ')[1]
    var year = d.getFullYear()
    var time = getTime()

    function getTime() {
      var hour = d.getHours() < 13 ? d.getHours().toString() : (d.getHours() - 12).toString()
      hour = parseInt(hour) < 10 ? '0' + hour : hour
      var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      return hour + min
    }

    var ampm = d.getHours() < 12 ? 'AM' : 'PM';

    var estimateNumber = this.activeEst.quetationNo.replace('/', '')
    return 'ESTPDF_' + estimateNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
  }


  // error modal
  openErrorModal() {
    $('#error-message').modal('show')
    $('#error-message').on('shown.bs.modal', (e) => {
    })
  }

}
