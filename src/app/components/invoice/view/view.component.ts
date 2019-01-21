import { Component, OnInit } from '@angular/core'

import { InvoiceService } from '../../../services/invoice.service'
import { ClientService } from '../../../services/client.service'
import { SettingService } from '../../../services/setting.service'
import { SearchService } from '../../../services/search.service';
import { response, invoice, client } from '../../../interface'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'

import { Store } from '@ngrx/store'
import * as invoiceActions from '../../../actions/invoice.action'
import * as clientActions from '../../../actions/client.action'
import * as globalActions from '../../../actions/globals.action'
import { AppState } from '../../../app.state'
import { Router } from '@angular/router'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  invoiceList: invoice[]
  activeInv: invoice
  invListLoader: boolean = false
  invDispLimit: number = 20
  invSortTerm: string = 'createdDate'
  invSearchTerm: string
  dateDDMMYY: boolean
  dateMMDDYY: boolean
  customEnableDate : boolean = false

  private invoiceQueryForm = {
    client: new FormControl(),
    dateRange: {
      start: new FormControl(),
      end: new FormControl(new Date())
    }
  }
  
  // multiselect dropdown

  dropdownList : any;
  itemSelected
  selectedItems = [];
  dropdownSettings = {};
  
  // multiselect dropdown ends
  changingQuery: boolean = false

  private clientList: client[]
  private activeClient: client
  filteredClients: Observable<string[] | client[]>

  private settings: any

  constructor(private invoiceService: InvoiceService, private clientService: ClientService,
    private searchService : SearchService,
    private store: Store<AppState>,
    private settingService: SettingService,
    public router: Router
  ) {
    store.select('client').subscribe(clients => this.clientList = clients)
    
    // store.select('globals').subscribe(globals => {
    //   if (Object.keys(globals.invoiceQueryForm).length > 0) {
    //     this.invoiceQueryForm = globals.invoiceQueryForm
    //   }
    // })
    this.settings = JSON.parse(localStorage.getItem('user')).setting

    // date and time dropdown
    jQuery(document).ready(function (e) {
      function t(t) {
          e(t).bind("click", function (t) {
              t.preventDefault();
              e(this).parent().fadeOut()
          })
      }
      e(".dropdown-toggle").click(function () {
          var t = e(this).parents(".button-dropdown").children(".dropdown-menu").is(":hidden");
          e(".button-dropdown .dropdown-menu").hide();
          e(".button-dropdown .dropdown-toggle").removeClass("active");
          if (t) {
              e(this).parents(".button-dropdown").children(".dropdown-menu").toggle().parents(".button-dropdown").children(".dropdown-toggle").addClass("active")
          }
      });
      e(document).bind("click", function (t) {
          var n = e(t.target);
          if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-menu").hide();
      });
      e(document).bind("click", function (t) {
          var n = e(t.target);
          if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-toggle").removeClass("active");
      })
  });
  // date and time dropdown ends  
 
  }

  ngOnInit() {
    this.dropdownList = this.clientList;
    // Fetch clients if not in store
    if (this.clientList.length < 1) {
      this.clientService.fetch().subscribe((response: response) => {
      this.store.dispatch(new clientActions.add(response.records))
      }
      )
    }
    
    // Set Active invoice whenever invoice list changes
    this.store.select('invoice').subscribe(invoices => {
      this.invoiceList = invoices
      this.setActiveInv()
    })
    // show date as per format changed
    this.settingService.fetch().subscribe((response: any) => {
      this.dateDDMMYY = response.settings.appSettings.androidSettings.dateDDMMYY;
      this.dateMMDDYY = response.settings.appSettings.androidSettings.dateMMDDYY;
    })
    this.openSearchClientModal()
    
    // dropdown settings
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'uniqueKeyClient',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.itemSelected = 'All Time';
    // testing
  }

  
  duration = ['All Time','This Week','This Month','Last Week','Last Month','Custom']

  paidAmount() {
    var temp = 0
    if (this.activeInv.payments) {
      this.activeInv.payments.forEach((payment: any) => {
        temp += parseFloat(payment.paidAmount)
      })
    }

    return temp
  }

  loadMore() {
    this.invDispLimit += 10
  }
  showItem(item){
    this.itemSelected = item
    console.log(this.itemSelected);
    if(this.itemSelected === 'Custom')
    {
      this.customEnableDate = true
    }
    else{
      this.customEnableDate = false
    }
  }

  goEdit(invId) {
    this.router.navigate([`invoice/edit/${invId}`])
  }


  openSearchClientModal() {
    $('#search-client').modal('show')
  }

  closeSearchModel() {
    $('#search-client').modal('hide')
  }

  showSelectedInvoices(client){
    this.invoiceQueryForm.client = client;
    this.SearchInvoice()
    $('#search-client').modal('hide')
  }

  // Search Invoice Functions
  SearchInvoice() {
    var query = {
      clientIdList: [],
      startTime: 0,
      endTime: 0
    }
    // this.invoiceQueryForm.client = this.searchService.getUserData()
    if (this.invoiceQueryForm.client.value && this.invoiceQueryForm.client.value.length > 0) {
      query.clientIdList = this.invoiceQueryForm.client.value.map(cli => cli.uniqueKeyClient)
      if (query.clientIdList[0] == null) {
        query.clientIdList = null
        this.invoiceQueryForm.client.reset([{ name: 'All' }])
      }
    } else {
      query.clientIdList = null
      this.invoiceQueryForm.client.reset([{ name: 'All' }])
    }
    if (this.invoiceQueryForm.dateRange.start.value) {
      query.startTime = this.invoiceQueryForm.dateRange.start.value.getTime()
    }
    if (this.invoiceQueryForm.dateRange.end.value) {
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
    if (query == null) {
      query = {
        clientIdList: null,
        startTime: 0,
        endTime: new Date().getTime()
      }
    }

    this.invListLoader = true
    this.invoiceService.fetchByQuery(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.store.dispatch(new invoiceActions.reset(response.records ? response.records.filter(rec => rec.deleted_flag == 0) : []))
        // this.setActiveInv()
      }
      this.invListLoader = false
    })
  }

  setActiveInv(invId: string = '') {
    if (!invId || invId ==="null" ) {
      this.activeInv = this.invoiceList[0]
    } else {
      // invId = invoiceId;
      this.activeInv = this.invoiceList.filter(inv => inv.unique_identifier == invId)[0]
    }
    this.setActiveClient()
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
    })
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

  getClientName(id) {
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0] ? this.clientList.filter(client => client.uniqueKeyClient == id)[0].name : ''
  }
}
