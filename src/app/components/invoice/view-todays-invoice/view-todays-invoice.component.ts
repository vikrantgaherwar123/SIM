import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { InvoiceService } from 'src/app/services/invoice.service';
import * as invoiceActions from '../../../actions/invoice.action'
import { AppState } from 'src/app/app.state';
import { invoice, client, setting, recentInvoices } from 'src/app/interface';
import { ClientService } from 'src/app/services/client.service';
import { SettingService } from '../../../services/setting.service'

import { response } from '../../../interface'
import { setStorage } from 'src/app/globalFunctions';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-view-todays-invoice',
  templateUrl: './view-todays-invoice.component.html',
  styleUrls: ['./view-todays-invoice.component.css']
})
export class ViewTodaysInvoiceComponent implements OnInit {
  settings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  invListLoader: boolean;
  invoiceList: invoice[]
  recentInvoiceList: recentInvoices[];
  private clientList: client[]
  // private allClientList: client[]
  activeInv: invoice
  activeClient: any = {}
  invoiceId: string;
  clientListLoading: boolean;
  settingsLoading: boolean;
  hideDiscountLabel: boolean;
  isDiscountPresent: boolean;
  hideTaxLabel: boolean;
  isTaxPresent: boolean;
  noDiscountOnItem: boolean;
  noTaxOnItem: boolean;

  constructor(private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    public router: Router,
    private settingService: SettingService,
    private store: Store<AppState>,private clientService: ClientService,) {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
      store.select('client').subscribe(clients => this.clientList = clients)
      store.select('recentInvoices').subscribe(recentInvoices => this.recentInvoiceList = recentInvoices)
     }

  ngOnInit() {
    if (this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        // this.clientList = this.clientList.filter(client => !client.name || client.name !== "" );
        this.clientList = response.records.filter(recs => recs.enabled == 0)
      }, err => this.openErrorModal());
    }else{
      this.clientList = this.clientList.filter(recs => recs.enabled == 0)
    }

    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    if(this.recentInvoiceList.length < 1){
      this.fetchInvoices();
    }else{
      this.route.params.subscribe(params => {
        if (params.invId) {
         this.setActiveInv(params.invId);
        }
      })
    }
    
  }

  fetchInvoices() {
    // Fetch invoices with given query
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var  query = {
        startDate: start.getTime(),
        endDate: new Date().getTime(),
        serviceIdentifier: false
      }

    this.invListLoader = true
    this.invoiceService.fetchTodaysData(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.invListLoader = false
        this.store.dispatch(new invoiceActions.recentInvoice(response.list ? response.list.filter(rec => rec.deleted_flag == 0) : []))
        this.store.select('recentInvoices').subscribe(invoices => {
          this.recentInvoiceList = invoices
        })
      }
      this.route.params.subscribe(params => {
        if (params.invId) {
         this.setActiveInv(params.invId);
        }
      })

    }, err => this.openErrorModal())
  }

  setActiveInv(invId: string = '') {
    this.invoiceId = invId;
    this.activeInv = this.recentInvoiceList.filter(inv => inv.unique_identifier == invId)[0]

    //display label and values if tax on item & discount on item selected and values are there
    if(this.activeInv !== undefined){

      if(this.activeInv.discount_on_item == 1){
        this.noDiscountOnItem = true;
      }else{
        this.noDiscountOnItem = false;
      }
  
      if(this.activeInv.tax_on_item == 0){
        this.noTaxOnItem = true;
      }else{
        this.noTaxOnItem = false;
      }

    //display label and values if tax on Bill & discount on Bill selected and values are there
    if(this.activeInv.discount > 0){
      this.noDiscountOnItem = false;
    }

    if(this.activeInv.tax_rate > 0){
      this.noTaxOnItem = false;
    }
    }
    

    this.setActiveClient()
  }

  setActiveClient() {
    

  if (this.activeInv && this.clientList) {
    var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
    if (client) {
      this.activeClient = client
    } else {
      this.activeClient = null
    }
  }
}

paidAmount() {
  var temp = 0
  if (this.activeInv.payments) {
    this.activeInv.payments.forEach((payment: any) => {
      temp += parseFloat(payment.paidAmount)
    })
  }

  return temp
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
  
}

getClientName(id) {
  
  if(this.clientList.length !== 0){
  return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
  }
}


goEdit(invId) {
  this.router.navigate([`invoice/edit/${invId}`])
}

downloadInvoice(type) {
  if (type == "download") {
    $('#downloadBtn').attr('disabled', 'disabled')
  } else if (type == "preview") {
    $('#previewBtn').attr('disabled', 'disabled')
  }

  this.invoiceService.fetchPdf(this.activeInv.unique_identifier).subscribe((response: any) => {
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
  },err => this.openErrorModal())
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

  var invoiceNumber = this.activeInv.invoice_number.replace('/', '')
  return 'INVPDF_' + invoiceNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
}


  // error modal
  openErrorModal() {
    $('#error-message').modal('show')
    $('#error-message').on('shown.bs.modal', (e) => {
    })
  }

}
