import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { Store } from '@ngrx/store'
import { AppState } from '../../../app.state'
import { response, invoice, client, product } from '../../../interface'
import * as invoiceActions from '../../../actions/invoice.action'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'

import { InvoiceService } from '../../../services/invoice.service'
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'

import { Router, ActivatedRoute } from '@angular/router'
import { CookieService } from 'ngx-cookie-service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  private invoiceList: Observable<invoice[]>
  private activeInv: invoice = {
    adjustment: 0,
    amount: 0,
    balance: 0,
    client_id: 0,
    created_date: '',
    deletedItems: [],
    deletedPayments: [],
    deletedTerms: [],
    deleted_flag: 0,
    device_modified_on: 0,
    discount: 0,
    discount_on_item: 0,
    due_date: '',
    due_date_flag: 0,
    epoch: 0,
    gross_amount: 0,
    id: 0,
    invoiceNote:'',
    invoice_number: '',
    listItems: [],
    organization_id: 0,
    payments: [],
    percentage_flag: 0,
    percentage_value: 0,
    push_flag: 0,
    reference: '',
    serverUpdateTime: 0,
    shipping_address: '',
    shipping_charges: 0,
    taxList: [],
    tax_amount: 0,
    tax_on_item: 0,
    tax_rate: 0,
    termsAndConditions: [],
    unique_identifier: '',
    unique_key_fk_client: '',
    version: 0,
    _id: 0
  }
  private activeInvIndex: number

  private clientList: Observable<client[]>
  private activeClient: client

  private productList: Observable<product[]>

  private setting: any

  billingTo = new FormControl('')
  private filteredClients: Observable<client[]>

  constructor(private invoiceService: InvoiceService, private clientService: ClientService,
    private productService: ProductService, private store: Store<AppState>,
    private route: ActivatedRoute, private router: Router, private cookie: CookieService
  ) {
    this.invoiceList = store.select('invoice')
    this.clientList = store.select('client')
    this.productList = store.select('product')
    // console.log(JSON.parse(cookie.get('user')))
    this.setting = JSON.parse(cookie.get('user')).setting
  }

  ngOnInit() {
    // Fetch invoices IF not in store
    this.invoiceList.subscribe(invoices => {
      if(invoices.length < 1) {
        this.invoiceService.fetch().subscribe((response: response) => {
          if(response.status === 200) {
            this.store.dispatch(new invoiceActions.add(response.records))
          }
          this.setActiveInv()
        })
      } else {
        this.setActiveInv()
      }
    })

    // Fetch clients if not in store
    this.clientList.subscribe(clients => {
      if(clients.length < 1) {
        this.clientService.fetch().subscribe((response: response) => {
          this.store.dispatch(new clientActions.add(response.records))
        })
      }
    })

    // Fetch products if not in store
    this.productList.subscribe(products => {
      if(products.length < 1) {
        this.productService.fetch().subscribe((response: response) => {
          this.store.dispatch(new productActions.add(response.records))
        })
      }
    })
  }

  setActiveInv() {
    this.route.params.subscribe(params => {
      if(params.invId) {
        this.invoiceList.subscribe(invs => {
          this.activeInvIndex = invs.findIndex(inv => inv.unique_identifier == params.invId)
          this.activeInv = invs[this.activeInvIndex]
          console.log(this.activeInv)
          this.setActiveClient()
        })
      } else {
        this.router.navigate(['invoice/view'])
      }
    })
  }

  setActiveClient() {
    this.clientList.subscribe(clients => {
      this.activeClient = clients.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
      this.filteredClients = this.billingTo.valueChanges.pipe(startWith(''),
        map(value => this._filterClients(value))
      )
      this.billingTo.setValue(this.activeClient.name)      
    })
  }

  _filterClients(value: string): client[] {
    let clients
    const filterValue = value.toLowerCase()
    this.clientList.subscribe(clies => clients = clies)
    return clients.filter(option => option.name.toLowerCase().includes(filterValue))
  }
}
