import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store'
import { EstimateService } from '../../../services/estimate.service'

import * as invoiceActions from '../../../actions/invoice.action'
import { AppState } from 'src/app/app.state';
import { invoice, client, setting, estimate } from 'src/app/interface';
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
  activeEst: estimate
  private clientList: client[]
  activeClient: client = <client>{}
  clientListLoading: boolean;
  estListLoader: boolean;
  settingsLoading: boolean;
  estimateId: string;
  showTaXLabel: boolean;
  showDiscountLabel: boolean;
  noDiscountOnItem: boolean;
  noTaxOnItem: boolean;

  constructor(private route: ActivatedRoute,
    public router: Router,
    private estimateService: EstimateService,
    private settingService: SettingService,
    private store: Store<AppState>,private clientService: ClientService,) {

    store.select('client').subscribe(clients => this.clientList = clients)
   }

  ngOnInit() {
    if (this.clientList.length < 1) {
      this.fetchClients();
    }else{
      this.clientList = this.clientList.filter(client => !client.name || client.name !== "" );
      this.fetchSettings();
    }
  }

  fetchClients(){
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        this.clientList = this.clientList.filter(client => !client.name || client.name !== "" );
        this.fetchSettings();
      }, err => this.openErrorModal());
  }
  fetchSettings(){
    // Fetch Settings every time
    this.settingsLoading = true;
    this.settingService.fetch().subscribe((response: any) => {
      this.settingsLoading = false;
      if (response.settings !== null) {
        setStorage(response.settings)
        this.user = JSON.parse(localStorage.getItem('user'))
        this.settings = this.user.setting
        this.fetchEstimates();
      }
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
        this.store.dispatch(new estimateActions.reset(response.list ? response.list.filter(rec => rec.enabled == 0) : []))
        // Set Active invoice whenever invoice list changes
        this.store.select('estimate').subscribe(estimates => {
          this.estimateList = estimates
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
    this.activeEst = this.estimateList.filter(est => est.unique_identifier == estId)[0]
    //display label and values if tax on item & discount on item selected and values are there
    if(this.activeEst !== undefined){

      for(let i =0;i<this.activeEst.alstQuotProduct.length;i++){
        if(this.activeEst.alstQuotProduct[i].taxRate !== 0){
          this.noTaxOnItem = true;
        }else{
          this.noTaxOnItem = false;
        }
        if(this.activeEst.alstQuotProduct[i].discountRate !== 0){
          this.noDiscountOnItem = true;
        }else{
          this.noDiscountOnItem = false;
        }
      }

      // if(this.activeEst.assignDiscountFlag == 1){
      //   this.noDiscountOnItem = true;
      // }else{
      //   this.noDiscountOnItem = false;
      // }
  
      // if(this.activeEst.assignTaxFlag == 1){
      //   // this.activeEst.assignTaxFlag = 0;
      //   this.noTaxOnItem = true;
      // }else{
      //   this.noTaxOnItem = false;
      // }

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
    if(this.clientList){
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
