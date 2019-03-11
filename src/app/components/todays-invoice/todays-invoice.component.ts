import { Component, OnInit, Input } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { invoice, response, client } from 'src/app/interface';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ClientService } from 'src/app/services/client.service';
import { SettingService } from '../../services/setting.service'


@Component({
  selector: 'app-todays-invoice',
  templateUrl: './todays-invoice.component.html',
  styleUrls: ['./todays-invoice.component.css']
})
export class TodaysInvoiceComponent implements OnInit {
  @Input('invId') invoiceId: string;
  invoiceList: invoice[]
  public clientList: client[]
  private activeClient: client
  public settings: any

  activeInv: invoice
  invoiceListLoading: boolean;
  clientListLoading: boolean;
  constructor(private store: Store<AppState>,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private settingService: SettingService
    ) {
    this.settings = JSON.parse(localStorage.getItem('user')).setting
    store.select('client').subscribe(clients => this.clientList = clients)
   }

  ngOnInit() {
    if(this.clientList.length < 1){
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        this.removeEmptySpaces();
      })
    }
    console.log(this.invoiceId);
    this.invoiceListLoading = true;
    this.invoiceService.fetchById([this.invoiceId]).subscribe((invoice: any) => {
      this.invoiceListLoading = false;
      if(invoice.records !== null) {
        this.activeInv = invoice.records[0];
        this.setActiveClient();
      }
      })
      
  }

  setActiveClient() {
    if (this.activeInv) {
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

  removeEmptySpaces(){
    //remove whitespaces from clientlist
    for (let i = 0; i < this.clientList.length; i++) {
      if(!this.clientList[i].name){
        this.clientList.splice(i);
      }
      var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "");
      if (tempClient === "") {
        this.clientList.splice(i);
      }
    }
    
  }

}
