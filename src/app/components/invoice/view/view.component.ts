import { Component, OnInit } from '@angular/core'
import { InvoiceService } from '../../../services/invoice.service'
import { ClientService } from '../../../services/client.service'
import { response, invoice, client } from '../../../interface'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'

import { Store } from '@ngrx/store'
import * as invoiceActions from '../../../actions/invoice.action'
import * as clientActions from '../../../actions/client.action'
import * as globalActions from '../../../actions/globals.action'
import { AppState } from '../../../app.state'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  private invoiceList: invoice[]
  private activeInv: invoice
  private activeInvId: string
  private invListLoader: boolean = false
  private invDispLimit: number = 20

  private invoiceQueryForm = {
    client: new FormControl(),
    dateRange: {
      start: new FormControl(),
      end: new FormControl(new Date())
    }
  }
  private changingQuery: boolean = false

  private clientList: client[]
  private activeClient: client
  filteredClients: Observable<string[] | client[]>

  private setting: any

  constructor(private invoiceService: InvoiceService, private clientService: ClientService,
    private store: Store<AppState>, private cookie: CookieService,
    private router: Router
  ) {
    store.select('client').subscribe(clients => this.clientList = clients)
    store.select('globals').subscribe(globals => {
      if (Object.keys(globals.invoiceQueryForm).length > 0) {
        this.invoiceQueryForm = globals.invoiceQueryForm
      }
    })
    this.setting = JSON.parse(cookie.get('user')).setting
  }

  ngOnInit() {
    // Fetch clients if not in store
    if(this.clientList.length < 1) {
      this.clientService.fetch().subscribe((response: response) => {
        this.store.dispatch(new clientActions.add(response.records))
      })
    }

    // Set Active invoice whenever invoice list changes
    this.store.select('invoice').subscribe(invoices => {
      this.invoiceList = invoices
      this.setActiveInv()
    })
  }

  paidAmount() {
    var temp = 0
    if(this.activeInv.payments) {
      this.activeInv.payments.forEach((payment: any) => {
        temp += parseFloat(payment.paidAmount)
      })
    }

    return temp
  }

  loadMore() {
    this.invDispLimit += 10
  }

  goEdit(invId) {
    this.router.navigate([`invoice/edit/${invId}`])
  }

  // Search Invoice Functions
  SearchInvoice(){
    var query = {
      clientIdList: [],
      startTime: 0,
      endTime: 0
    }

    if(this.invoiceQueryForm.client.value && this.invoiceQueryForm.client.value.length > 0) {
      query.clientIdList = this.invoiceQueryForm.client.value.map(cli => cli.uniqueKeyClient)
      if (query.clientIdList[0] == null) {
        query.clientIdList = null
        this.invoiceQueryForm.client.reset([{name: 'All'}])
      }
    } else {
      query.clientIdList = null
      this.invoiceQueryForm.client.reset([{name: 'All'}])
    }
    if(this.invoiceQueryForm.dateRange.start.value) {
      query.startTime = this.invoiceQueryForm.dateRange.start.value.getTime()
    }
    if(this.invoiceQueryForm.dateRange.end.value) {
      query.endTime = this.invoiceQueryForm.dateRange.end.value.getTime()
    } else {
      query.endTime = new Date().getTime()
    }
    this.store.dispatch(new globalActions.add({ invoiceQueryForm: this.invoiceQueryForm }))
    this.fetchInvoices(query)
    this.changingQuery = false
  }

  getNames() {
    return this.invoiceQueryForm.client.value.reduce((a, b) => a + b.name + ', ', '')
  }

  fetchInvoices(query = null) {
    // Fetch invoices with given query
    if(query == null) {
      query = {
        clientIdList: null,
        startTime: 0,
        endTime: new Date().getTime()
      }
    }

    this.invListLoader = true
    this.invoiceService.fetchByQuery(query).subscribe((response: response) => {
      if(response.status === 200) {
        this.store.dispatch(new invoiceActions.reset(response.records ? response.records : []))
        // this.setActiveInv()
      }
      this.invListLoader = false
    })
  }

  setActiveInv(invId: string = '') {
    this.activeInvId = invId
    if(!this.activeInvId) {
      this.activeInv = this.invoiceList[0]
      if(this.activeInv) {
        this.activeInvId = this.activeInv.unique_identifier
      }
    } else {
      this.activeInv = this.invoiceList.filter(inv => inv.unique_identifier == this.activeInvId)[0]
    }
    this.setActiveClient()
  }

  setActiveClient() {
    if(this.activeInv) {
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
      if(client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
  }
}
