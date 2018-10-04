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
    private router: Router
  ) {
    this.invoiceList = store.select('invoice')
    this.clientList = store.select('client')
    // console.log(JSON.parse(cookie.get('user')))
    this.setting = JSON.parse(cookie.get('user')).setting
  }

  ngOnInit() {
    // Fetch invoices if not in store
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

    // Fetch clients if not in store
    this.clientList.subscribe(clients => {
      if(clients.length < 1) {
        this.clientService.fetch().subscribe((response: response) => {
          this.store.dispatch(new clientActions.add(response.records))
        })
      }
    })
  }

  loadMore() {
    this.invDispLimit += 10
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
      // console.log(this.activeInv)
    })
  }

  setActiveClient() {
    this.clientList.subscribe(clients => {
      this.activeClient = clients.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
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

  goEdit(invId) {
    this.router.navigate([`invoice/edit/${invId}`])
  }
}
