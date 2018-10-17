import { Component, OnInit } from '@angular/core'
import { InvoiceService } from '../../../services/invoice.service'
import { ClientService } from '../../../services/client.service'
import { response, invoice, client } from '../../../interface'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store'
import * as invoiceActions from '../../../actions/invoice.action'
import * as clientActions from '../../../actions/client.action'
import { AppState } from '../../../app.state'
import { Router, ActivatedRoute } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  private invoiceList: Observable<invoice[]>
  private activeInv: invoice
  private activeInvIndex: number = 0
  private invListLoader: boolean = true
  private invDispLimit: number = 20

  private clientList: Observable<client[]>
  private activeClient: client

  private setting: any

  constructor(private invoiceService: InvoiceService, private clientService: ClientService,
    private store: Store<AppState>, private cookie: CookieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.invoiceList = store.select('invoice')
    this.clientList = store.select('client')
    this.setting = JSON.parse(cookie.get('user')).setting
  }

  ngOnInit() {
    // Fetch clients if not in store
    this.clientList.subscribe(clients => {
      if(clients.length < 1) {
        this.clientService.fetch().subscribe((response: response) => {
          this.store.dispatch(new clientActions.add(response.records))
          this.init()
        })
      } else {
        this.init()
      }
    })
  }

  init() {
    // Fetch invoices if not in store
    this.route.params.subscribe(params => {
      var query = params.query ? JSON.parse(params.query) : null

      if(query) {
        this.invoiceService.fetchByQuery(query).subscribe((response: response) => {
          if(response.status === 200) {
            if(response.records !== null && response.records.length > 0) {
              this.store.dispatch(new invoiceActions.reset(response.records))
              this.setActiveInv()
            } else {
              alert('No records found for given search criteria!')
            }
          }
          this.invListLoader = false
        })
      } else {
        this.invoiceList.subscribe(invoices => {
          if(invoices.length < 1) {
            this.invoiceService.fetch().subscribe((response: response) => {
              if(response.status === 200) {
                this.store.dispatch(new invoiceActions.add(response.records))
              }
              this.invListLoader = false
              this.setActiveInv()
            })
          } else {
            this.invListLoader = false
            this.setActiveInv()
          }
        })
      }
    })
  }

  setActiveInv(invId: string = '') {
    if(!invId) {
      this.activeInvIndex = 0
    } else {
      this.invoiceList.subscribe(invs => {
        this.activeInvIndex = invs.findIndex(inv => inv.unique_identifier == invId)
      })
    }
    this.invoiceList.subscribe(invs => {
      this.activeInv = invs[this.activeInvIndex]
      this.setActiveClient()
    })
  }

  setActiveClient() {
    this.clientList.subscribe(clients => {
      var client = clients.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
      if(client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
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
}
