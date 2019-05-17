import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { InvoiceService } from 'src/app/services/invoice.service';
import * as invoiceActions from '../../../actions/invoice.action'
import { AppState } from 'src/app/app.state';
import { invoice, client, setting, recentInvoices } from 'src/app/interface';
import { ClientService } from 'src/app/services/client.service';
import * as clientActions from '../../../actions/client.action'
import { SettingService } from '../../../services/setting.service'

import { response } from '../../../interface'
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
  activeInv: recentInvoices

  invSortTerm: string = 'createdDate'

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
  getTodaysInvoice: boolean;
  isRecentInvoice: boolean;
  taxable: number;

  constructor(private invoiceService: InvoiceService,
    public clientService: ClientService,
    private route: ActivatedRoute,
    public router: Router,
    private settingService: SettingService,
    private store: Store<AppState>) {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
      store.select('client').subscribe(clients => this.clientList = clients)
      store.select('recentInvoices').subscribe(recentInvoices => this.recentInvoiceList = recentInvoices)
      store.select('invoice').subscribe(invoices => this.invoiceList = invoices)
     }

  ngOnInit() {
    //fetch settings when user comes to this component
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    if (this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records.filter(recs => recs.enabled == 0)
        
        this.removeEmptySpaces(this.clientList);
        this.store.dispatch(new clientActions.add(this.clientList))
      }, err => this.openErrorModal());
    }else{
      this.removeEmptySpaces(this.clientList);
      this.clientList = this.clientList.filter(recs => recs.enabled == 0)
    }
    
    if(this.recentInvoiceList.length < 1){
      this.fetchInvoices();
    }else{
      this.isRecentInvoice = true;
      this.route.params.subscribe(params => {
        if (params.invId) {
         this.setActiveInv(params.invId);
        }
      })
    }
    
  }

  fetchInvoices() {
    this.getTodaysInvoice = true;
    // Fetch invoices with given query
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var query = {
      startDate: start.getTime(),
      endDate: new Date().getTime(),
      serviceIdentifier: false
    }

    this.invListLoader = true
    this.invoiceService.fetchTodaysData(query).subscribe((response: any) => {
      if (response.status === 200) { 
        console.log(JSON.stringify(response.list));
         
        this.invListLoader = false
        var obj = []
        obj = response.list ? response.list.filter(rec => rec.deleted_flag == 0) : []
        this.store.dispatch(new invoiceActions.resetRecentInvoice(obj));
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

  removeEmptySpaces(data){
    //remove whitespaces from clientlist
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === undefined) {
        data.splice(i, 1);
      }
      if (data[i].name) {
        var tempClient = data[i].name.toLowerCase().replace(/\s/g, "");
        if (tempClient === "") {
          data.splice(i, 1);
        }
      }else if(!data[i].name){
        data.splice(i, 1);
      }
    }
    return data
  }

  setActiveInv(invId: string = '') {
    this.activeInv = this.recentInvoiceList.filter(inv => inv.unique_identifier == invId)[0]

    //display label and values if tax on Bill & discount on Bill selected and values are there
    if(this.activeInv.discount > 0){
      this.noDiscountOnItem = true;
    }

    if(this.activeInv.tax_rate > 0){
      this.noTaxOnItem = true;
    }

    //set variables according to data comes from API and store 
    if(this.activeInv !== undefined){
      for(let i = 0; i < this.activeInv.listItems.length; i++){
        if(this.activeInv.listItems[i].discount || this.activeInv.listItems[i].discount == 0){
          
          this.activeInv.listItems[i].discountRate = this.activeInv.listItems[i].discount;
        }
        if(this.activeInv.listItems[i].discount_amount || this.activeInv.listItems[i].discount_amount == 0){
          this.activeInv.listItems[i].discountAmount = this.activeInv.listItems[i].discount_amount;
        }
        if(this.activeInv.listItems[i].tax_amount || this.activeInv.listItems[i].tax_amount == 0){
          this.activeInv.listItems[i].taxAmount = this.activeInv.listItems[i].tax_amount;
        }
        if(this.activeInv.listItems[i].taxAmount && this.activeInv.listItems[i].taxAmount == 0){
          this.activeInv.listItems[i].tax_rate = 0;
        }
        
        if(this.activeInv.listItems[i].product_name){
          this.activeInv.listItems[i].productName = this.activeInv.listItems[i].product_name;
        }
        if(this.activeInv.listItems[i].quantity){
          this.activeInv.listItems[i].qty = this.activeInv.listItems[i].quantity;
        }
        if(this.activeInv.listItems[i].total){
          this.activeInv.listItems[i].price = this.activeInv.listItems[i].total;
        }
        if(this.activeInv.listItems[i].unique_identifier){
          this.activeInv.listItems[i].uniqueKeyListItem = this.activeInv.listItems[i].unique_identifier;
        }
      }

      
        if (this.activeInv.listItems) {
          var temp = []
          var taxPayable = 0;
          var totalDiscount = 0;
          for (let i = 0; i < this.activeInv.listItems.length; i++) {

            if(this.activeInv.taxableFlag == 1 ){
              taxPayable += this.activeInv.listItems[i].taxAmount;
              if(this.activeInv.listItems[i].discountAmount){
                totalDiscount += this.activeInv.listItems[i].discountAmount;
              }
            }
            
            temp.push({
              description: this.activeInv.listItems[i].description,
              discountRate: this.activeInv.listItems[i].discountRate,
              discount_amount: this.activeInv.listItems[i].discountAmount,
              tax_amount: this.activeInv.listItems[i].taxAmount,
              productName: this.activeInv.listItems[i].productName,
              qty: this.activeInv.listItems[i].qty,
              rate: this.activeInv.listItems[i].rate,
              tax_rate: this.activeInv.listItems[i].tax_rate,
              price: this.activeInv.listItems[i].price,
              uniqueKeyListItem: this.activeInv.listItems[i].uniqueKeyListItem,
              unit: this.activeInv.listItems[i].unit,
            })
          }
          this.activeInv.listItems = temp
          //taxable amount
          if(totalDiscount){
          //   this.taxable = (this.activeInv.amount - totalDiscount) - taxPayable;
          // }else if(taxPayable == 0){
          //   this.taxable = 0;
          // }else{
          //   this.taxable = this.activeInv.amount - taxPayable;
          // }
          var baseAmount = this.activeInv.gross_amount + totalDiscount
            var allDiscount = (baseAmount - totalDiscount)
            this.taxable = allDiscount - taxPayable;
          }else{
            this.taxable = this.activeInv.gross_amount - taxPayable;
          }
          
        }

        if(this.activeInv.taxableFlag == 1 && this.activeInv.tax_rate){
          taxPayable = this.activeInv.tax_amount;
          if(this.activeInv.discount_amount){
            this.taxable = (this.activeInv.amount - this.activeInv.discount_amount) - taxPayable;
          }
          this.taxable = this.activeInv.amount - taxPayable;
        }
        
      

      if(this.activeInv.discount_on_item == 2){
        this.noDiscountOnItem = true;
      }else{
        this.noDiscountOnItem = false;
      }
  
      if(this.activeInv.tax_on_item == 2){
        this.noTaxOnItem = true;
      }else{
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
      if(this.clientList[i].name == undefined){
        this.clientList.splice(i,1);
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
