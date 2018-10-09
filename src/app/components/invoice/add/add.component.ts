import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { DatePipe } from '@angular/common'

import { response, client, invoice, terms, setting, product } from '../../../interface'
import { generateUUID, changeInvoice, dateDifference } from '../../../globalFunctions'

import { CookieService } from 'ngx-cookie-service'
import { InvoiceService } from '../../../services/invoice.service'
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { TermConditionService } from '../../../services/term-condition.service'
import { SettingService } from '../../../services/setting.service'

import { Store } from '@ngrx/store'
import * as invoiceActions from '../../../actions/invoice.action'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'
import * as termActions from '../../../actions/terms.action'
import { AppState } from '../../../app.state'

@Component({
  selector: 'app-invoice',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [DatePipe]
})
export class AddComponent implements OnInit {

  private emptyInvoice = {
    adjustment: 0,
    amount: 0.00,
    balance: 0.00,
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
    gross_amount: 0.00,
    id: 0,
    invoiceNote: '',
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

  private invoiceList: Observable<invoice[]>
  private activeInvoice: invoice = {...this.emptyInvoice}
  private invoiceItems = []
  private invoiceTerms = []
  private selectedInvoice = null
  private tempQuaNoOnAdd: number
  private invoiceFilterTerm: string
  private invoiceDate
  private paymentDate
  private tempInvNo: number
  private initialPayment
  private discountLabel
  private show_discount
  private itemDisabled
  private paid_amount
  private show_tax_input
  private taxLabel
  private show_shipping_charge
  private selectDueDate = 'no_due_date'
  private balance

  private clientList: Observable<client[]>
  private activeClient: any = {}
  private clientListLoading: boolean
  billingTo = new FormControl()
  filteredClients: Observable<string[] | client[]>
  private clientsLocal = []
  private clientValidation: boolean
  private showClientError: boolean
  private receiptList
  private addClientModal: any = {}

  private productList: Observable<product[]>
  private addProductList = []
  productListFormControls = [new FormControl()]
  filteredProducts: Observable<string[] | product[]>
  private addProduct: {
    itemDescription: string
  } = {
    itemDescription: ''
  }

  private show_tax_input_list: any
  private tempflagTaxList: any

  private tax_on: string
  private taxtext: string
  private discount_on: string
  private discounttext: string
  private settings: any

  private termList: Observable<terms[]>
  private addTermModal: any = {}

  private tempQtyLabel: string
  private tempProLabel: string
  private tempAmtLabel: string
  private tempRateLabel: string
  private tempTermLabel: string
  private tempBillLabel: string
  private tempShipLabel: string
  private tempDueLabel: string
  private tempDisLabel: string
  private tempSubToLabel: string
  private tempShippingLabel: string
  private tempAdjLabel: string
  private tempPaidLabel: string
  private tempTotalLabel: string
  private tempBalLabel: string
  private tempInv12: any
  private tempPaymentList
  private tempItemList
  private tempTermList
  private routeParams: {
    invId: string
  }

  private newItemCounter: number = 0

  private customDate = true
  private isRate = true
  private dueDate = ""

  private isNone: boolean
  private isByClient: boolean
  private isByDate: boolean
  private isInvNo: boolean
  private sortInvoices: string
  private isAmount: boolean

  private showMultipleTax: boolean
  private authenticated: {
    setting: any
  }

  private config = {
    valueField: 'uniqueKeyClient',
    labelField: 'name',
    searchField: ['name'],
    sortField: 'name',
    placeholder: 'Type or Select Client',
    allowEmptyOption: false,
    create: true
  }
  private configProduct = {
    valueField: 'prodName',
    labelField: 'prodName',
    searchField: ['prodName'],
    sortField: 'prodName',
    persist: false,
    create: true,
    allowEmptyOption: false,
    addPrecedence: false,
    placeholder: 'Type or Select Product',
    createOnBlur: true,
    selectOnTab: true,
    onType: function (str) {
      //console.log('onType', str)
    }
  }
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }

  constructor(private router: Router,
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private cookie: CookieService,
    private settingService: SettingService,
    private productService: ProductService,
    private datePipe: DatePipe,
    private store: Store<AppState>
  ) {
    this.user = JSON.parse(this.cookie.get('user'))
    this.authenticated = { setting: this.user.setting }
    this.clientList = store.select('client')
    this.productList = store.select('product')
    this.invoiceList = store.select('invoice')
    this.termList = store.select('terms')
    // console.log(this.authenticated)
  }

  ngOnInit() {
    this.init()
  }

  displayWith(disp): string | undefined {
    if (disp && disp.name) {
      return disp.name
    } else if ( disp && disp.prodName) {
      return disp.prodName
    }
    return undefined
  }

  init() {
    this.clientsLocal = []
    this.clientListLoading = true
    this.initializeSettings(this.tempQuaNoOnAdd)

    this.activeInvoice.taxList = []
    this.show_tax_input_list = []
    this.tempflagTaxList = []
    this.activeInvoice.gross_amount = 0.00
    this.activeInvoice.balance = 0.00

    var settings = this.authenticated.setting

    this.tempQtyLabel = settings.mTvQty ? settings.mTvQty : ''
    this.tempProLabel = settings.mTvProducts ? settings.mTvProducts : ''
    this.tempAmtLabel = settings.mTvRate ? settings.mTvRate : ''
    this.tempRateLabel = settings.mTvAmount ? settings.mTvAmount : ''
    this.tempTermLabel = settings.mTvTermsAndConditions ? settings.mTvTermsAndConditions : ''
    this.tempBillLabel = settings.mTvBillTo ? settings.mTvBillTo : ''
    this.tempShipLabel = settings.mTvShipTo ? settings.mTvShipTo : ''
    this.tempDueLabel = settings.mTvDueDate ? settings.mTvDueDate : ''
    this.tempDisLabel = settings.discount ? settings.discount : ''
    this.tempSubToLabel = settings.subtotal ? settings.subtotal : ''
    this.tempShippingLabel = settings.shipping ? settings.shipping : ''
    this.tempAdjLabel = settings.adjustment ? settings.adjustment : ''
    this.tempPaidLabel = settings.paid ? settings.paid : ''
    this.tempTotalLabel = settings.total ? settings.total : ''
    this.tempBalLabel = settings.balance ? settings.balance : ''

    // this.tempQtyLabel = settings.mTvQty ? settings.mTvQty : $translate.instant('QTY_LABEL')
    // this.tempProLabel = settings.mTvProducts ? settings.mTvProducts : $translate.instant('PRO_LABEL')
    // this.tempAmtLabel = settings.mTvRate ? settings.mTvRate : $translate.instant('AMT_LABEL')
    // this.tempRateLabel = settings.mTvAmount ? settings.mTvAmount : $translate.instant('RATE_LABEL')
    // this.tempTermLabel = settings.mTvTermsAndConditions ? settings.mTvTermsAndConditions : $translate.instant('TERM_LABEL')
    // this.tempBillLabel = settings.mTvBillTo ? settings.mTvBillTo : $translate.instant('BILL_TO_LABEL')
    // this.tempShipLabel = settings.mTvShipTo ? settings.mTvShipTo : $translate.instant('SHIP_TO_LABEL')
    // this.tempDueLabel = settings.mTvDueDate ? settings.mTvDueDate : $translate.instant('DUE_DATE_LABEL')
    // this.tempDisLabel = settings.discount ? settings.discount : $translate.instant('DIS_LABEL')
    // this.tempSubToLabel = settings.subtotal ? settings.subtotal : $translate.instant('SUB_TOT_LABEL')
    // this.tempShippingLabel = settings.shipping ? settings.shipping : $translate.instant('SHIPPING_LABEL')
    // this.tempAdjLabel = settings.adjustment ? settings.adjustment : $translate.instant('ADJ_LABEL')
    // this.tempPaidLabel = settings.paid ? settings.paid : $translate.instant('PAID_LABEL')
    // this.tempTotalLabel = settings.total ? settings.total : $translate.instant('TOTAL_LABEL')
    // this.tempBalLabel = settings.balance ? settings.balance : $translate.instant('BAL_LABEL')

    if (settings.alstTaxName) {
      if (settings.alstTaxName.length > 0) {
        this.showMultipleTax = true
      } else {
        this.showMultipleTax = false
      }
    }
    var date = new Date()

    if (settings.dateDDMMYY === false) {
      this.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      this.settings.date_format = 'dd-mm-yy'
    }
    if (this.settings.date_format === 'dd-mm-yy') {
      this.invoiceDate = new FormControl(new Date())
      this.paymentDate = new FormControl(new Date())
      this.activeInvoice.created_date = this.invoiceDate.value.getTime()
    } else if (this.settings.date_format = 'mm-dd-yy') {
      this.invoiceDate = new FormControl(new Date())
      this.paymentDate = new FormControl(new Date())
      this.activeInvoice.created_date = this.invoiceDate.value.getTime()
    }

    var self = this

    // Fetch Products if not in store
    this.productList.subscribe(products => {
      if(products.length < 1) {
        this.productService.fetch().subscribe((response: response) => {
          // console.log(response)
          if (response.records != null) {
            self.store.dispatch(new productActions.add(response.records.filter(prod => prod.enabled == 0)))
            this.setProductFilter(0)
          } else {
            this.setProductFilter(0)
          }
        })
      } else {
        this.setProductFilter(0)
      }
    })

    // Fetch Clients if not in store
    this.clientList.subscribe(clients => {
      if(clients.length < 1) {
        this.clientService.fetch().subscribe((response: response) => {
          if (response.records !== null) {
            this.store.dispatch(new clientActions.add(response.records.filter(recs => recs.enabled == 0)))
            this.setClientFilter()
          } else {
            this.setClientFilter()
          }
        })
      } else {
        this.setClientFilter()
      }
    })

    // Fetch Terms if not in store
    this.termList.subscribe(terms => {
      if(terms.length < 1) {
        this.termConditionService.fetch().subscribe((response: response) => {
          if (response.termsAndConditionList !== null) {
            this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
          }
          this.termList.subscribe(trms => {
            self.activeInvoice.termsAndConditions = trms.filter(trm => trm.setDefault == 'DEFAULT')
          })
        })
      } else {
        this.termList.subscribe(trms => {
          self.activeInvoice.termsAndConditions = trms.filter(trm => trm.setDefault == 'DEFAULT')
        })
      }
    })

    // Fetch invoices if not in store
    this.invoiceList.subscribe(invoices => {
      if(invoices.length < 1) {
        this.invoiceService.fetch().subscribe((result: any) => {
          // console.log('invoice', result)
          if(result.status === 200) {
            this.store.dispatch(new invoiceActions.add(result.records.filter(inv => inv.deleted_flag == 0)))
          }
        })
      }
    })

    //console.log("settings",settings)
    if (settings) {
      this.activeInvoice.discount_on_item = settings.discount_on_item
      this.activeInvoice.tax_on_item = settings.tax_on_item
      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        this.activeInvoice.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        this.activeInvoice.tax_on_item = 2
      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        this.activeInvoice.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }
      if (settings.discount_on_item == 0) {
        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        this.activeInvoice.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        this.activeInvoice.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        this.activeInvoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.activeInvoice.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.activeInvoice.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }

    this.activeInvoice.listItems.push({
      'description': '',
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
  }

  initializeSettings(invNoParam) {
    var settings = this.authenticated.setting
    this.settingService.fetch().subscribe((response: any) => {
      // $rootScope.pro_bar_load = true
      if (response.status === 200) {
        var cookie = this.user
        if (response.settings === null) {
          this.authenticated.setting = <setting>{}
          this.authenticated.setting.date_format = true
          this.settings.date_format = 'dd-mm-yy'
          // $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
          // $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
          // $rootScope.settings.alstTaxName = []
        } else {
          cookie.setting = response.settings.appSettings.androidSettings
          this.settings = cookie.setting

          // if (cookie.setting.numberFormat === "###,###,###.00") {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator
          //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern1'
          // } else if (cookie.setting.numberFormat === "##,##,##,###.00") {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator
          //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern2'
          // } else if (cookie.setting.numberFormat === "###.###.###,00") {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator
          //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern1'
          // } else if (cookie.setting.numberFormat === "##.##.##.###,00") {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator
          //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern2'
          // } else if (cookie.setting.numberFormat === "### ### ###,00") {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator
          //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern1'
          // } else {
          //   $locale.NUMBER_FORMATS.DECIMAL_SEP = "."
          //   $locale.NUMBER_FORMATS.GROUP_SEP = ","
          //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
          //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
          //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
          //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
          //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
          //   $rootScope.settingscurrency_pattern = 'pattern1'
          // }

          if (cookie.setting.dateDDMMYY === false) {
            // $locale.DATETIME_FORMATS.mediumDate = "MM-dd-yyyy"
            this.settings.date_format = 'mm-dd-yy'
          } else if (cookie.setting.dateDDMMYY === true) {
            // $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
            this.settings.date_format = 'dd-mm-yy'
          }

          if (cookie.setting.currencyInText != "" && typeof cookie.setting.currencyInText !== 'undefined') {
            // $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.currencySymbol(cookie.setting.currencyInText)
          } else {
            //$rootScope.authenticated.setting = {}
            //$rootScope.authenticated.setting.currency_symbol = $locale.NUMBER_FORMATS.CURRENCY_SYM
          }
        }
        this.cookie.set('user', JSON.stringify(cookie), null, '/')
        if (invNoParam) {
          if (settings.quotFormat)
            this.activeInvoice.invoice_number = settings.quotFormat + invNoParam
          else if (typeof settings.quotFormat !== 'undefined')
            this.activeInvoice.invoice_number = "Est_" + invNoParam
          else
            this.activeInvoice.invoice_number = invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempInvNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempInvNo
          } else {
            this.tempInvNo = 1
            this.tempQuaNoOnAdd = this.tempInvNo
          }
          if (settings.quotFormat || settings.quotFormat === '') {
            this.activeInvoice.invoice_number = settings.quotFormat + this.tempInvNo
          } else if (typeof settings.quotFormat !== 'undefined') {
            this.activeInvoice.invoice_number = "Est_" + this.tempInvNo
          } else {
            this.activeInvoice.invoice_number = this.tempInvNo.toString()
          }
        }
      } else {
        if (invNoParam) {
          this.activeInvoice.invoice_number = settings.quotFormat + invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempInvNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempInvNo
          } else {
            this.tempInvNo = 1
            this.tempQuaNoOnAdd = this.tempInvNo
          }
          if (settings.quotFormat) {
            this.activeInvoice.invoice_number = settings.quotFormat + this.tempInvNo
          } else {
            this.activeInvoice.invoice_number = "Est_" + this.tempInvNo
          }
        }
      }
    })
  }

  setProductFilter(index) {
    // Filter for product autocomplete
    this.productList.subscribe(products => {
      this.filteredProducts = this.productListFormControls[index].valueChanges.pipe(
        startWith<string | product>(''),
        map(value => typeof value === 'string' ? value : value.prodName),
        map(name => name ? this._filterProd(name) : products.slice())
      )
    })
  }

  private _filterProd(value: string): string[] {
    const filterValue = value.toLowerCase();
    var product

    this.productList.subscribe(products => {
      product = products
    })
    return product.filter(prod => prod.prodName.toLowerCase().includes(filterValue));
  }

  setClientFilter() {
    // Filter for client autocomplete
    this.clientList.subscribe(clients => {
      this.filteredClients = this.billingTo.valueChanges.pipe(
        startWith<string | client>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterCli(name) : clients.slice())
      )
    })
    this.clientListLoading = false
  }

  private _filterCli(value: string): string[] {
    const filterValue = value.toLowerCase();
    var client

    this.clientList.subscribe(clients => {
      client = clients
    })
    return client.filter(cli => cli.name.toLowerCase().includes(filterValue));
  }

  // setPaidAmountTotalView() {
  //   var temp = 0
  //   if (typeof this.invoice.payments !== 'undefined') {
  //     for (var i = 0; i < this.invoice.payments.length; i++) {
  //       temp = temp + parseFloat(this.invoice.payments[i].paidAmount)
  //     }
  //   }
  //   this.paid_amount = temp
  // }

  selectedClientChange(client) {
    var item
    this.clientList.subscribe(clients => {
      item = clients.filter(cli => cli.name == client.option.value.name)[0]
    })

    if (item !== undefined) {
      this.activeClient = item
      this.activeInvoice.unique_key_fk_client = item.uniqueKeyClient
    } else {
      //console.log("clients",this.clients)
      if(this.activeClient) {
        this.activeClient = {}
      }

      this.addClient(client.option.value)
    }
  }

  // Client Functions
  addClient(name) {
    this.addClientModal = {}
    this.addClientModal.addressLine1 = ''
    this.addClientModal.email = ''
    this.addClientModal.number = ''
    this.addClientModal.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', function (e) {
      $('#add-client input[type="text"]')[1].focus()
    })
  }

  closeAddClientModal() {
    //alert('closed!!')
    $("#loadb").css("display", "none")
    $('#add-client').modal('hide')

    this.addClientModal = {}
    $('#refreshClient').addClass('rotator')
    $("#loadb").css("display", "none")
  }

  saveClient(status) {
    $('#saveClientButton').attr("disabled", 'true');
    // console.log(data)

    if (status) {
      this.addClientModal.uniqueKeyClient = generateUUID(this.user.user.orgId)
      var d = new Date()
      this.addClientModal.device_modified_on = d.getTime()
      this.addClientModal.organizationId = this.user.user.orgId

      this.clientService.add([this.clientService.changeKeysForApi(this.addClientModal)]).subscribe((response: any) => {
        if (response.status === 200) {
          this.store.dispatch(new clientActions.add([this.clientService.changeKeysForStore(response.clientList[0])]))
          this.clientList.subscribe(clients => {
            // console.log(clients);            
            this.activeClient = clients.filter((client) => client.uniqueKeyClient == response.clientList[0].unique_identifier)[0]
            this.billingTo.setValue(this.activeClient)
            // console.log(this.activeClient)
            //$('#refreshClient').removeClass('rotator')
            // $('#saveClientButton').button('reset')
          })
          $('#add-client').modal('hide')
          //this.data.invoice.unique_key_fk_client = this.activeClient.unique_identifier
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      })
    }
  }

  // Term Functions
  addTerm() {
    $('#add-terms').modal('show')
  }

  closeAddTermModal() {
    $('#add-terms').modal('hide')
  }

  setTermsList(term) {
    console.log(term)
    var index = this.activeInvoice.termsAndConditions.findIndex(trms => trms.uniqueKeyTerms == term.uniqueKeyTerms)
    if(index == -1) {
      this.activeInvoice.termsAndConditions.push(term)
    } else {
      this.activeInvoice.termsAndConditions.splice(index, 1)
    }
  }

  removeTermFromInvoice(index) {
    this.activeInvoice.termsAndConditions.splice(index, 1)
  }

  saveTerm(status) {
    $('#addtermbtn').attr('disabled', 'disabled')
    if (status) {
      this.addTermModal.orgId = this.user.user.orgId
      this.addTermModal.uniqueKeyTerms = generateUUID(this.user.user.orgId)
      this.addTermModal.deviceModifiedOn = new Date().getTime()

      this.termConditionService.add([
        this.termConditionService.changeKeysForApi(this.addTermModal)
      ]).subscribe((response: any) => {
        if (response.status === 200) {
          var temp = this.termConditionService.changeKeysForStore(response.termsAndConditionList[0])
          this.store.dispatch(new termActions.add([temp]))

          this.addTermModal = {}

          if (temp.setDefault === 'DEFAULT') {
            this.activeInvoice.termsAndConditions.push(temp)
          }

          $('#addtermbtn').removeAttr('disabled')
          // notifications.showSuccess({ message: response.data.message, hideDelay: 1500, hide: true })
          $('#add-terms').modal('hide')
        } else {
          $('#addtermbtn').removeAttr('disabled')
          // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
          alert(response.message)
        }
      })
    }
  }

  addLineItem() {
    this.newItemCounter += 1
    this.activeInvoice.listItems.push({
      'description': '',
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
    this.productListFormControls.push(new FormControl())
    this.setProductFilter(this.productListFormControls.length - 1)
    // console.log(this.activeInvoice.listItems)

    if (this.newItemCounter > 0) {
      // this.focusOutMessage(this.searchText)
    }
  }

  addItem(index, product) {
    this.activeInvoice.listItems[index].unique_key_fk_product = product.uniqueKeyProduct
    this.activeInvoice.listItems[index].unique_identifier = generateUUID(this.user.user.orgId)
    this.activeInvoice.listItems[index].description = product.discription == null ? '' : product.discription
    this.activeInvoice.listItems[index].product_name = product.prodName
    this.activeInvoice.listItems[index].quantity = 1
    this.activeInvoice.listItems[index].unit = product.unit
    this.activeInvoice.listItems[index].rate = product.rate
    this.activeInvoice.listItems[index].tax_rate = 0.00

    // this.productName.setValue('')
    // console.log(this.activeInvoice.listItems);

    //New product add logic
    // else if (selected_product_id !== '' && typeof selected_product_id !== 'undefined') {
    //   var tempProAddFlag = false
    //   var tempSelectedProduct = angular.lowercase(selected_product_id)
    //   var tempProName = ''
    //   var tempMatchPro = {}
    //   for (var k = 0; k < this.productList.length; k++) {
    //     tempProName = angular.lowercase(this.productList[k].prodName)
    //     if (tempSelectedProduct == tempProName) {
    //       tempProAddFlag = true
    //       tempMatchPro = this.productList[k]
    //     }
    //   }
    //   if (!tempProAddFlag) {
    //     item.unique_key_fk_product = utility.generateUUID()
    //     item.unique_identifier = utility.generateUUID()
    //     item.product_name = selected_product_id
    //     item.description = ""
    //     item.quantity = 1
    //     item.unit = ""
    //     item.rate = 0.00
    //     item.discount = 0.00
    //     item.tax_rate = 0.00
    //     /**
    //      * Adding Product to Product List
    //      * */

    //     var d = new Date()
    //     var temp1 = {
    //       'prod_name': item.product_name,
    //       'rate': parseFloat(item.rate),
    //       'tax_rate': item.tax_rate,
    //       //'description' : item.description,
    //       'device_modified_on': d.getTime(),
    //       'organization_id': $rootScope.authenticated.user.orgId,
    //       'unique_identifier': item.unique_key_fk_product

    //     }
    //     this.addProductList.push(temp1)
    //     //console.log("count1",item,temp1,this.addProductList,selected_product_id)
    //   } else {
    //     item.unique_key_fk_product = tempMatchPro.uniqueKeyProduct
    //     item.unique_identifier = utility.generateUUID()
    //     item.product_name = tempMatchPro.prodName
    //     item.description = tempMatchPro.discription
    //     item.quantity = 1
    //     item.unit = tempMatchPro.unit
    //     item.rate = tempMatchPro.rate
    //     //item.discount = this.productList[index].discount
    //     //item.tax_rate = this.productList[index].taxRate
    //     item.tax_rate = 0.00
    //     //console.log("count12",this.productList)
    //   }
    // } else {
    //   item.description = ""
    //   item.quantity = 1
    //   item.unit = ""
    //   item.rate = 0.00
    //   item.discount = 0.00
    //   item.tax_rate = 0.00
    // }
    this.calculateTotal(index)
    // this.calculateInvoice(1)
  }

  save(status) {
    $('#invSubmitBtn').attr('disabled', 'disabled')
    var createdTime = new Date()
    var dueDateTime = new Date()
    if (this.activeInvoice.due_date && this.activeInvoice.due_date !== '') {
      dueDateTime.setTime(parseInt(this.activeInvoice.due_date))
      this.activeInvoice.due_date = dueDateTime.getFullYear() + '-' + ('0' + (dueDateTime.getMonth() + 1)).slice(-2) + '-' + ('0' + dueDateTime.getDate()).slice(-2);
    } else {
      this.activeInvoice.due_date
    }

    if (parseInt(this.activeInvoice.created_date)) {
      createdTime.setTime(parseInt(this.activeInvoice.created_date))
    }
    this.activeInvoice.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)
    this.activeInvoice.organization_id = this.user.user.orgId

    // Add terms in invoice from terms array api compatible
    this.terms.forEach(tnc => {
      this.activeInvoice.termsAndConditions.push(this.termConditionService.changeKeysForApi(tnc))
    })
    this.activeInvoice.unique_identifier = generateUUID(this.user.user.orgId)
    this.activeInvoice.balance = this.balance

    for (var i = this.activeInvoice.listItems.length; i > 0; i--) {
      this.activeInvoice.listItems[i - 1].unique_key_fk_invoice = this.activeInvoice.unique_identifier;
      if (!this.activeInvoice.listItems[i - 1].product_name || this.activeInvoice.listItems[i - 1].product_name == '') {
        this.activeInvoice.listItems.splice(i - 1, 1);
      }
    }

    if (this.activeInvoice.listItems.length !== 0 && this.activeClient.name) {
      if (status) {
        for (var j = 0; j < this.activeInvoice.termsAndConditions.length; j++) {
          this.activeInvoice.termsAndConditions[j].unique_key_fk_invoice = this.activeInvoice.unique_identifier;
        }
        for (var t = 0; t < this.activeInvoice.taxList.length; t++) {
          if (this.activeInvoice.taxList[t] == null) {
            this.activeInvoice.taxList.splice(t, 1)
          }
        }

        if (this.addProductList.length > 0)
          this.saveProduct(this.addProductList)
        for (var k = 0; k < this.activeInvoice.payments.length; k++) {
          this.activeInvoice.payments[k].unique_key_fk_invoice = this.activeInvoice.unique_identifier
          this.activeInvoice.payments[k].unique_key_fk_client = this.activeInvoice.unique_key_fk_client
        }

        var update_status = 0;
        var invoice_id = null;
        var d = new Date();
        this.activeInvoice.device_modified_on = d.getTime();

        var self = this
        this.invoiceService.add([this.activeInvoice]).subscribe(function (result: any) {
          if (result.status !== 200) {
            alert('Couldnt save invoice')
            console.log(result)
            // $rootScope.pro_bar_load = true
            // notifications.showError({
            //   message: result.message + '\n' + '.. Reason: ' + result.error.invoice_number[0],
            //   hideDelay: 1500,
            //   hide: true
            // })
          } else if (result.status === 200) {
            // var tmpInv = DataStore.invoicesList
            // this.clientList = DataStore.clientsList

            // Add Invoice to store
            self.store.dispatch(new invoiceActions.add(result.invoiceList))

            // Reset Create Invoice page for new invoice creation
            self.resetCreateInvoice()
            alert('Invoice saved successfully')
          }
          $('#invSubmitBtn').removeAttr('disabled')
        })
      }
      else {
        // $rootScope.pro_bar_load = true;
        $('#invSubmitBtn').removeAttr('disabled')
        alert('You haven\'t added item')
        // if (this.activeInvoice.listItems.length == 0) {
        //   notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
        // }
      }
    } else {
      $('#invSubmitBtn').removeAttr('disabled')
      // $rootScope.pro_bar_load = true;
      if (!this.activeClient.name) {
        alert('client not selected')
        // notifications.showError({ message: 'Select your client!', hideDelay: 1500, hide: true });
      } else {
        alert('item not selected')
        // notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
        // $('#invoiceSavebtn').button('reset');
      }
    }
  }

  calculateTotal(index) {
    //console.log("in total " + index)
    if (this.activeInvoice.listItems.length > 0 && typeof this.activeInvoice.listItems[index].quantity !== "undefined") {
      var rateParse = parseFloat(this.activeInvoice.listItems[index].rate)
      // console.log{""}
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      var productRate = (this.activeInvoice.listItems[index].quantity * rateParse)
      this.activeInvoice.listItems[index].total = productRate
      this.calculateInvoice(1)
    }
  }

  calculateInvoice(indexTaxMultiple) {
    var total = 0

    for (var i = 0; i < this.activeInvoice.listItems.length; i++) {
      var item = this.activeInvoice.listItems[i]
      total += parseFloat(item.total)
    }
    this.activeInvoice.gross_amount = total

    var grossAmount = total
    var discountTotal = 0
    var finalAmount = 0
    var shippingCharges = 0
    var totalAmount = 0
    var discoutAmount = 0
    var tax_rate = 0

    if (this.activeInvoice.percentage_flag == 1) {
      var discountPercent = parseFloat(this.activeInvoice.percentage_value) / 100
      if (isNaN(discountPercent)) {
        discountPercent = 0
      }

      discoutAmount = discountPercent * grossAmount
      this.activeInvoice.discount = discoutAmount
      discountTotal = grossAmount - discoutAmount
    } else if (this.activeInvoice.percentage_flag == 0) {

      var invoiceDiscount = this.activeInvoice.discount
      if (isNaN(invoiceDiscount)) {
        invoiceDiscount = 0
      }
      discountTotal = grossAmount - invoiceDiscount
      var discountAmount = (this.activeInvoice.discount / grossAmount) * 100
      if (isNaN(discountAmount)) {
        discountAmount = 0
      }
      this.activeInvoice.percentage_value = discountAmount.toString()
    }

    if (this.tax_on == 'taxOnBill') {
      tax_rate = (this.activeInvoice.tax_rate * discountTotal) / 100
      if (isNaN(tax_rate)) {
        tax_rate = 0
      }
      this.activeInvoice.tax_amount = tax_rate
      // console.log("tax_ rate bill", tax_rate)
    }

    if (indexTaxMultiple) {
      var temp_tax_rate = 0
      for (var i = 0; i < this.activeInvoice.taxList.length; i++) {
        if (this.activeInvoice.taxList[i]) {
          if (isNaN(parseFloat(this.activeInvoice.taxList[i].percentage)))
            this.activeInvoice.taxList[i].percentage = 0
          this.activeInvoice.taxList[i].calculateValue = (parseFloat(this.activeInvoice.taxList[i].percentage) * discountTotal) / 100
          this.activeInvoice.taxList[i].selected = true
          temp_tax_rate = temp_tax_rate + (parseFloat(this.activeInvoice.taxList[i].percentage) * discountTotal) / 100
        }
      }
      tax_rate = tax_rate + temp_tax_rate
    }

    shippingCharges = this.activeInvoice.shipping_charges
    if (isNaN(shippingCharges)) {
      shippingCharges = 0
    }
    totalAmount = discountTotal + shippingCharges + tax_rate

    var adjustmentAmount = this.activeInvoice.adjustment
    if (isNaN(adjustmentAmount)) {
      adjustmentAmount = 0
    }
    finalAmount = totalAmount - adjustmentAmount

    if (isNaN(finalAmount)) {
      finalAmount = 0
    }
    this.activeInvoice.amount = parseFloat(finalAmount.toFixed(2))
  }

  multiTaxButton(taxname) {
    var status = true
    if (this.data.invoice.taxList)
      for (var k = 0; k < this.data.invoice.taxList.length; k++) {
        if (this.data.invoice.taxList[k].taxName !== taxname) {
          status = true
        } else {
          status = false
          break
        }
      }

    return status
  }

  dynamicOrder(invoice) {
    //console.log("invoices",invoice)
    var order = 0
    switch (this.sortInvoices) {
      case 'name':
        order = invoice.orgName
        // this.rev = false
        break

      case 'created_date':
        {
          var date = new Date(invoice.createDate)
          order = date.getTime()
          // this.rev = true
          break
        }
      case 'invoice_number':
        order = invoice.tempInvNo
        // this.rev = true
        break

      case 'amount':
        order = parseFloat(invoice.amount)
        // this.rev = true
        break

      default:
        order = invoice.deviceCreatedDate
        // this.rev = true
    }

    return order
  }

  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    var genreA = a.value.toUpperCase()
    var genreB = b.value.toUpperCase()

    var comparison = 0
    if (genreA > genreB) {
      comparison = 1
    } else if (genreA < genreB) {
      comparison = -1
    }
    return comparison
  }

  removeItem(index) {
    this.activeInvoice.listItems.splice(index, 1)
    this.productListFormControls.splice(index, 1)
    this.calculateInvoice(1)
  }

  // showMe() {
  //   this.show = true
  //   this.tempflag = true
  // }

  // hideMe() {
  //   this.activeInvoice.discount = 0
  //   this.activeInvoice.percentage_value = 0
  //   this.calculateInvoice(1)
  //   this.show = false
  //   this.tempflag = false
  // }

  // showMeAdjustment() {
  //   this.show_adjustment = true
  // }

  // hideMeAdjustment() {
  //   this.activeInvoice.adjustment = 0
  //   this.calculateInvoice(1)

  //   this.show_adjustment = false
  // }

  // showMeTax() {
  //   this.show_tax_input = true
  //   this.tempflagTax = true
  // }

  createFilterFor(query) {
    var lowercaseQuery = query.toLowerCase()

    return function filterFn(item) {
      return (item.value.indexOf(lowercaseQuery) === 0) || (item.value.indexOf(lowercaseQuery) === 1)
        || (item.value.indexOf(lowercaseQuery) === 2) || (item.value.indexOf(lowercaseQuery) === 3)
        || (item.value.indexOf(lowercaseQuery) === 4) || (item.value.indexOf(lowercaseQuery) === 5)
        || (item.value.indexOf(lowercaseQuery) === 6) || (item.value.indexOf(lowercaseQuery) === 7)
        || (item.value.indexOf(lowercaseQuery) === 8) || (item.value.indexOf(lowercaseQuery) === 9)
        || (item.value.indexOf(lowercaseQuery) === 10) || (item.value.indexOf(lowercaseQuery) === 11)
    }

  }

  // showMeMultipleTax(index) {
  //   //console.log("showmultiple",this.data.invoice.taxList[index],$rootScope.authenticated.setting.alstTaxName[index])
  //   var tempIndex = this.activeInvoice.taxList.length
  //   this.activeInvoice.taxList[tempIndex] = {}
  //   this.activeInvoice.taxList[tempIndex].taxName = $rootScope.authenticated.setting.alstTaxName[index].taxName
  //   this.activeInvoice.taxList[tempIndex].selected = true
  //   this.multi_tax_index.push(index)
  //   this.show_tax_input_list[index] = true
  //   this.tempflagTaxList[index] = true
  // }

  // hideMeTax() {
  //   this.activeInvoice.tax_rate = 0
  //   this.calculateInvoice(1)
  //   this.show_tax_input = false
  //   this.tempflagTax = false
  // }

  // hideMeTaxMultiple(index) {
  //   this.activeInvoice.tax_rate = 0
  //   this.multi_tax_index.splice(index, 1)
  //   this.activeInvoice.taxList.splice(index, 1)
  //   this.calculateInvoice(index)
  //   //this.show_tax_input_list[index] = false
  //   this.tempflagTaxList[index] = false
  // }

  // showMeShipping() {
  //   this.show_shipping_charge = true
  //   this.tempflagShipping = true
  // }

  // hideMeShipping() {
  //   this.activeInvoice.shipping_charges = 0
  //   this.calculateInvoice(1)

  //   this.show_shipping_charge = false
  //   this.tempflagShipping = false
  // }

  // multiTaxButtonForAddInvoice(taxname, index) {
  //   var status = true
  //   for (var k = 0; k < this.multi_tax_index.length; k++) {
  //     //console.log("in button",index,k,"..")
  //     if (this.multi_tax_index[k] !== index) {
  //       status = true
  //     } else {
  //       status = false
  //       break
  //     }
  //   }

  //   return status
  // }

  saveProduct(add_product_list) {
    var d = new Date()
    var deleteIndexArray = []
    for (var i = 0; i < add_product_list.length; i++) {
      var uniqueIdProduct = this.activeInvoice.listItems.findIndex(
        item => item.unique_key_fk_product == add_product_list[i].unique_identifier
      )

      if (uniqueIdProduct !== -1) {
        add_product_list[i].device_modified_on = d.getTime()
        add_product_list[i].rate = this.activeInvoice.listItems[uniqueIdProduct].rate
        add_product_list[i].unit = ""
        add_product_list[i].discription = this.activeInvoice.listItems[uniqueIdProduct].description
      } else {
        deleteIndexArray.push(i)
      }
    }
    for (var j = 0; j < deleteIndexArray.length; j++) {
      add_product_list.splice(deleteIndexArray[j], 1)
    }
    this.productService.add(add_product_list).subscribe((result: any) => {
      if (result.status === 200) {
        var tempProAdded = {
          "buyPrice": result.productList[0].buy_price,
          "deviceCreatedDate": result.productList[0].device_modified_on,
          "discription": result.productList[0].discription,
          "enabled": result.productList[0].deleted_flag,
          "inventoryEnabled": result.productList[0].inventory_enabled,
          "modifiedDate": result.productList[0].epoch,
          "openingStock": result.productList[0].opening_stock,
          "prodLocalId": result.productList[0]._id,
          "prodName": result.productList[0].prod_name,
          "productCode": result.productList.productCode,
          "rate": result.productList[0].rate,
          "remainingStock": result.productList[0].remaining_stock,
          "serverOrgId": result.productList[0].organization_id,
          "serverUpdateTime": result.productList[0].serverUpdateTime,
          "taxRate": result.productList[0].tax_rate,
          "uniqueKeyProduct": result.productList[0].unique_identifier,
          "unit": result.productList[0].unit
        }
        // DataStore.pushProductList(tempProAdded)
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    })
  }

  updateSettings() {
    this.settingService.fetch().subscribe((response: any) => {
      if (response.status == 200) {
        var settings1 = response.settings.appSettings
        settings1.androidSettings.quotNo = this.tempQuaNoOnAdd - 1
        this.settingService.add(settings1).subscribe((response: response) => {

          if (response.status == 200) {
            var settings = settings1

            /****** locale code will go here ******/
            // if (settings != null) {
            //   $rootScope.settings = this.settings1.androidSettings

            //   if (settings.numberFormat === "###,###,###.00") {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
            //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern1'

            //   } else if (settings.numberFormat === "##,##,##,###.00") {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
            //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
            //     //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
            //     //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern2'

            //   } else if (settings.numberFormat === "###.###.###,00") {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
            //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern1'

            //   } else if (settings.numberFormat === "##.##.##.###,00") {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
            //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
            //     //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
            //     //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern2'

            //   } else if (settings.numberFormat === "### ### ###,00") {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
            //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern1'

            //   } else {
            //     $locale.NUMBER_FORMATS.DECIMAL_SEP = "."
            //     $locale.NUMBER_FORMATS.GROUP_SEP = ","
            //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
            //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
            //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
            //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
            //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
            //     $rootScope.settings.currency_pattern = 'pattern1'
            //   }
            //   if (settings.dateDDMMYY === false) {
            //     $locale.DATETIME_FORMATS.mediumDate = "MM-dd-yyyy"
            //     $rootScope.settings.date_format = 'mm-dd-yy'
            //   } else if (settings.dateDDMMYY === true) {
            //     $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
            //     $rootScope.settings.date_format = 'dd-mm-yy'
            //   }

            //   if (settings.currencyInText != "" && typeof settings.currencyInText !== 'undefined') {
            //     $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.currencySymbol(settings.currencyInText)
            //     $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
            //   } else {
            //     $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
            //     //$rootScope.authenticated.setting = {}
            //     //$rootScope.authenticated.setting.currency_symbol = $locale.NUMBER_FORMATS.CURRENCY_SYM
            //   }
            // } else {
            //   $rootScope.authenticated.setting = {}
            //   if ($rootScope.authenticated)
            //     $rootScope.authenticated.setting.date_format = true
            //   $rootScope.settings.date_format = 'dd-mm-yy'
            //   $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
            //   $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
            //   $rootScope.settings.alstTaxName = []
            // }
          }
          else {

          }
          // $('#updateButton').button('reset')
        })
      }
    })
  }

  greaterThan(prop, val) {
    return function (item) {
      return item[prop] > val
    }
  }

  // assignClientId(client_id) {
  //   this.invoice.client_id = client_id
  // }

  addRow() {
    this.invoiceItems.push({
      "id": null,
      "product_id": null,
      "invoice_id": "",
      "organization_id": 1,
      "product_name": "",
      "description": "",
      "quantity": 0,
      "rate": "",
      "unit": 1,
      "tax_rate": 0,
      "total": 0,
      "epoch": 0
    })
  }

  // calculateSum() {

  //   var total = 0

  //   for (var i = 0; i < this.invoiceItems.length; i++) {
  //     var item = this.invoiceItems[i]
  //     total += parseFloat(item.total, 10)
  //   }
  //   this.data.invoice.total = total
  // }

  goEdit(uniqueIdentity) {
    // $('#editBtn').button('loading')
    // $('#updateButton').button('loading')

    //$location.path('/invoice/edit/' + this.invoice.unique_identifier)
    $('#msgInv').removeClass("show")
    $('#msgInv').addClass("hide")
    $('#estMain').removeClass("show")
    $('#estMain').addClass("hide")
    $('#editEst').removeClass("hide")
    $('#editEst').addClass('show')
    // this.editTempInitializer(uniqueIdentity)
  }

  goNew() {
    $('#msgInv').removeClass("hide")
    $('#msgInv').addClass("show")
    $('#estMain').removeClass("show")
    $('#estMain').addClass("hide")
    $('#editEst').removeClass("show")
    $('#editEst').addClass('hide')
    this.resetCreateInvoice()
  }

  // printODownloadInvoice(invoiceId, type) {

  //   Data.get('invoice/get-pdf?invoiceId=' + invoiceId + '&type=' + type + '&timeZone=' + $rootScope.timeZone + '&accessToken=' + $rootScope.settings.dropbox_token, { responseType: 'arraybuffer' }).then(function (result) {
  //     //console.log(result)

  //     var a = window.document.createElement('a')

  //     a.href = window.URL.createObjectURL(new Blob([result], {
  //       type: 'application/pdf'
  //     }))

  //     // Append anchor to body.
  //     document.body.appendChild(a)
  //     a.download = this.getFileName(invoiceId)
  //     a.click()
  //   })

  // }

  // downloadInvoice(invoiceId, type, mode) {
  //   if (mode == "download") {
  //     $('#downloadBtn').button('loading')
  //   }
  //   else if (mode == "preview") {
  //     $('#previewBtn').button('loading')
  //   }

  //   var id = this.data.invoice.unique_identifier
  //   this.invoiceService.fetchPdf(id).subscribe((result: response) => {

  //     var file = new Blob([result], { type: 'application/pdf' })
  //     var fileURL = URL.createObjectURL(file)
  //     this.content = fileURL
  //     //console.log(this.content)
  //     var a = window.document.createElement('a')

  //     a.href = window.URL.createObjectURL(new Blob([result.data], {
  //       type: 'application/pdf'
  //     }))

  //     // Append anchor to body.
  //     document.body.appendChild(a)
  //     if (mode == "download") {
  //       a.download = this.getFileName(invoiceId)
  //       a.click()
  //       // $('#downloadBtn').button('reset')
  //     }
  //     else if (mode == "preview") {
  //       window.open(a)
  //       // $('#previewBtn').button('reset')
  //     }
  //   })

  // }

  // getFileName(invoiceId) {
  //   var day = (new Date()).getDate() <= 9 ? '0' + (new Date()).getDate() : (new Date()).getDate()
  //   var month = this.findMonth((new Date()).getMonth())
  //   var year = (new Date()).getFullYear()
  //   var time = getTime()

  //   function getTime() {
  //     var hour = (new Date()).getHours() < 13 ? (new Date()).getHours().toString() : ((new Date()).getHours() - 12).toString()
  //     hour = parseInt(hour) < 10 ? '0' + hour.toString() : hour.toString()
  //     var min = (new Date()).getMinutes() < 10 ? '0' + (new Date()).getMinutes() : (new Date()).getMinutes()
  //     return hour + min
  //   }

  //   //console.log(time)

  //   var ampm = (new Date()).getHours() < 12 ? 'AM' : 'PM'

  //   // eg: INVPDF_INV_21_02Dec2015_1151AM
  //   return 'ESTPDF_EST_' + this.data.invoice.invoice_number + '_' + day + month + year + '_' + time + ampm + '.pdf'
  // }

  findMonth(expression) {
    switch (expression) {
      case 0:
        return "Jan"

      case 1:
        return "Feb"

      case 2:
        return "Mar"

      case 3:
        return "Apr"

      case 4:
        return "May"

      case 5:
        return "Jun"

      case 6:
        return "Jul"

      case 7:
        return "Aug"

      case 8:
        return "Sep"

      case 9:
        return "Oct"

      case 10:
        return "Nov"

      case 11:
        return "Dec"
    }
  }

  changeDueDate(selectDueDate) {
    var date = new Date()
    this.selectDueDate = selectDueDate
    switch (this.selectDueDate) {
      case 'no_due_date':
        this.customDate = true
        this.dueDate = ''
        this.activeInvoice.due_date = ''
        this.activeInvoice.due_date_flag = 0
      break

      case 'immediately':
        this.customDate = false
        date.setTime(parseInt(this.activeInvoice.created_date))
        if (this.settings.date_format === 'dd-mm-yy') {
          this.dueDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()
          this.activeInvoice.due_date = (new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0]))).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.dueDate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear()
          this.activeInvoice.due_date = new Date(this.dueDate).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 1
      break

      case 'custom_date':
        this.customDate = false
        this.activeInvoice.due_date_flag = 2
      break

      case '7_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 7)
        this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[1]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[2])).getTime().toString()
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 3
      break

      case '10_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 10);
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 4
      break

      case '15_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 15)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 5
      break

      case '30_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 30)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 6
      break

      case '45_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 45)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 7
      break

      case '60_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 60)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 8
      break

      case '90_days':
        this.customDate = false
        this.dueDate = this.addDays(this.activeInvoice.created_date, 90)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.activeInvoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.activeInvoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.activeInvoice.due_date_flag = 9
      break

      default:
        this.customDate = true
        this.dueDate = ''
        this.activeInvoice.due_date = ''
      break
    }
  }

  addDays (date, days) {
    var temp_settings = this.authenticated.setting
    var wholeDate = ''
    var last = new Date(parseFloat(date)+(days*24*60*60*1000));
    var day = last.getDate()
    var month = last.getMonth()+1
    var year = last.getFullYear()
    if(temp_settings.dateDDMMYY === true){
      wholeDate =   ('0' + day).slice(-2)+ '-' +('0' + month ).slice(-2)+ '-' + year
    }else if(temp_settings.dateDDMMYY === false){
      wholeDate =   ('0' + month ).slice(-2)+ '-' + ('0' + day).slice(-2)+ '-' + year
    }

    return wholeDate;
  }

  resetCreateInvoice() {
    this.billingTo.setValue('')
    this.productListFormControls = [new FormControl()]
    this.setProductFilter(0)

    this.activeInvoice = {...this.emptyInvoice}
    this.activeInvoice.listItems = []
    this.newItemCounter = 0
    this.activeInvoice.listItems.push({
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
    this.activeClient = {}
    this.addProductList = []
    this.customDate = true
    this.isRate = true
    this.dueDate = ""

    var d = new Date()
    var settings = this.authenticated.setting
    this.activeInvoice.taxList = []
    this.activeInvoice.percentage_flag = 1
    this.show_tax_input = false
    this.show_shipping_charge = false

    if (settings.alstTaxName) {
      if (settings.alstTaxName.length > 0) {
        this.showMultipleTax = true
      } else {
        this.showMultipleTax = false
      }
    }

    if (this.tempQuaNoOnAdd) {
      if (typeof settings.quotFormat !== 'undefined')
        this.activeInvoice.invoice_number = settings.quotFormat + this.tempQuaNoOnAdd
      else
        this.activeInvoice.invoice_number = this.tempQuaNoOnAdd.toString()
    } else {
      if (!isNaN(settings.invNo)) {
        this.tempInvNo = parseInt(settings.quotNo) + 1
        this.tempQuaNoOnAdd = this.tempInvNo
      } else {
        this.tempInvNo = 1
      }
      if (settings.quotFormat) {
        this.activeInvoice.invoice_number = settings.quotFormat + this.tempInvNo
      } else {
        this.activeInvoice.invoice_number = "Inv_" + this.tempInvNo
      }
    }
    // this.productList = DataStore.productsList
    // this.terms = DataStore.termsList

    this.termList.subscribe(trms => {
      this.terms = trms
    })

    if (settings.dateDDMMYY === false) {
      this.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      this.settings.date_format = 'dd-mm-yy'
    } else {
      this.settings.date_format = 'dd-mm-yy'
    }

    if (this.settings.date_format === 'dd-mm-yy') {
      this.activeInvoice.created_date = this.invoiceDate.value.getTime()
    } else if (this.settings.date_format = 'mm-dd-yy') {
      this.activeInvoice.created_date = this.invoiceDate.value.getTime()
    }
    if (settings) {
      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        this.activeInvoice.tax_on_item = 1
        //console.log("setting 1")
      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        this.activeInvoice.tax_on_item = 2
        //console.log("setting 2")
      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        this.activeInvoice.tax_on_item = 2
        //console.log("setting 3")
        $('a.taxbtn').addClass('disabledBtn')
      }
      if (settings.discount_on_item == 0) {
        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        this.activeInvoice.discount_on_item = 0
        //console.log("setting 1,1")
      } else if (settings.discount_on_item == 1) {
        //console.log("setting 1,2")
        this.activeInvoice.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        //console.log("setting 1,3")
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        this.activeInvoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.activeInvoice.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.activeInvoice.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
  }

  // isEmpty1() {
  //   return this.clientsLocal[0] && (typeof this.clientsLocal[0].email === 'undefined' || this.clientsLocal[0].email === '')
  // }

  // isEmpty2() {
  //   return this.clientsLocal[0] && (typeof this.clientsLocal[0].number === 'undefined' || this.clientsLocal[0].number === '')
  // }

  // isEmpty11() {
  //   return (typeof this.activeClient.email === 'undefined' || this.activeClient.email === '')
  // }

  // isEmpty12() {
  //   return (typeof this.activeClient.number === 'undefined' || this.activeClient.number === '')
  // }

  // getInvoice(id, index) {
  //   if (id) {
  //     $('#msgInv').removeClass("show")
  //     $('#msgInv').addClass("hide")
  //     $('#invMain').removeClass("hide")
  //     $('#invMain').addClass("show")
  //     $('#editInv').removeClass("show")
  //     $('#editInv').addClass('hide')
  //     // this.data.invoice = {}
  //     // this.invoice = {}
  //     this.data.invoice.payments = []
  //     this.tempPaymentList = []
  //     this.tempItemList = []
  //     this.tempTermList = []
  //     this.customDate = true

  //     // this.clientList = DataStore.unSortedClient
  //     // this.invoices = DataStore.invoicesList;
  //     if (this.invoices) {
  //       var inv_index = this.invoices.findIndex(inv => inv.unique_identifier == id)
  //       this.invoice = this.invoices[inv_index]
  //       this.data.invoice = Object.assign({}, this.invoice)
  //       delete this.data.invoice.orgName
  //       delete this.data.invoice.tempInvNo
  //       delete this.data.invoice.disp
  //       this.invoice.termsAndConditions = this.invoice.termsAndConditions
  //       this.invoice.payments = this.invoice.payments

  //       this.invoiceDate = this.datePipe.transform(this.invoice.created_date)
  //       this.dueDate = this.datePipe.transform(this.invoice.due_date)

  //       if (this.invoice.taxList) {
  //         if (this.invoice.taxList.length > 0) {
  //           this.showMultipleTax = true
  //         } else {
  //           this.showMultipleTax = false
  //         }
  //       } else {
  //         this.showMultipleTax = false
  //       }

  //       for (var j = 0; j < this.data.invoice.listItems.length; j++) {
  //         var temp = {
  //           'unique_identifier': this.data.invoice.listItems[j].uniqueKeyListItem,
  //           'product_name': this.data.invoice.listItems[j].productName,
  //           'description': this.data.invoice.listItems[j].description == null ? '' : this.data.invoice.listItems[j].description,
  //           'quantity': this.data.invoice.listItems[j].qty,
  //           /*'inventory_enabled':this.productList[index].inventoryEnabled,*/
  //           'unit': this.data.invoice.listItems[j].unit,
  //           'rate': this.data.invoice.listItems[j].rate,
  //           'discount': this.data.invoice.listItems[j].discountRate,
  //           'tax_rate': this.data.invoice.listItems[j].tax_rate,
  //           'total': this.data.invoice.listItems[j].price,
  //           'tax_amount': this.data.invoice.listItems[j].taxAmount,
  //           'discount_amount': this.data.invoice.listItems[j].discountAmount,
  //           'unique_key_fk_product': this.data.invoice.listItems[j].uniqueKeyFKProduct,
  //           '_id': this.data.invoice.listItems[j].listItemId,
  //           'local_prod_id': this.data.invoice.listItems[j].prodId,
  //           'organization_id': this.data.invoice.listItems[j].org_id,
  //           'invoiceProductCode': this.data.invoice.listItems[j].invoiceProductCode,
  //           'unique_key_fk_invoice': this.data.invoice.listItems[j].uniqueKeyFKInvoice
  //         }
  //         this.tempItemList.push(temp);
  //       }
  //       if (!isNaN(this.data.invoice.termsAndConditions && !this.data.invoice.termsAndConditions == null
  //         && this.data.invoice.termsAndConditions.isEmpty())
  //       ) {
  //         for (var i = 0; i < this.data.invoice.termsAndConditions.length; i++) {
  //           var temp1 = {
  //             "terms_condition": this.data.invoice.termsAndConditions[i].terms,
  //             "_id": this.data.invoice.termsAndConditions[i].localId,
  //             "local_invoiceId": this.data.invoice.termsAndConditions[i].invoiceId,
  //             "invoice_id": this.data.invoice.termsAndConditions[i].serverInvoiceId,
  //             "organization_id": this.data.invoice.termsAndConditions[i].serverOrgId,
  //             "unique_identifier": this.data.invoice.termsAndConditions[i].uniqueInvoiceTerms,
  //             "unique_key_fk_invoice": this.data.invoice.termsAndConditions[i].uniqueKeyFKInvoice
  //           }
  //           this.tempTermList.push(temp1);
  //         }
  //       }

  //       this.data.invoice.listItems = this.tempItemList;
  //       this.data.invoice.termsAndConditions = this.tempTermList

  //       if (typeof this.data.invoice.payments !== 'undefined') {
  //         var paidAmountTemp = 0;
  //         for (var i = 0; i < this.data.invoice.payments.length; i++) {
  //           var temp = {
  //             "date_of_payment": this.data.invoice.payments[i].dateOfPayment,
  //             "paid_amount": this.data.invoice.payments[i].paidAmount,
  //             "organization_id": this.data.invoice.payments[i].orgId,
  //             "unique_identifier": this.data.invoice.payments[i].uniqueKeyInvoicePayment,
  //             "unique_key_fk_client": this.data.invoice.payments[i].uniqueKeyFKClient,
  //             "unique_key_fk_invoice": this.data.invoice.payments[i].uniqueKeyFKInvoice,
  //             "deleted_flag": this.data.invoice.payments[i].enabled,
  //             "unique_key_voucher_no": this.data.invoice.payments[i].uniqueKeyVoucherNo,
  //             "voucher_no": this.data.invoice.payments[i].voucherNo,
  //             "_id": this.data.invoice.payments[i].invPayId,
  //             "local_invoice_id": this.data.invoice.payments[i].invoiceId,
  //             "local_client_id": this.data.invoice.payments[i].clientId,
  //             "paymentNote": this.data.invoice.payments[i].paymentNote
  //           }
  //           this.tempPaymentList.push(temp)
  //           paidAmountTemp = paidAmountTemp + this.data.invoice.payments[i].paidAmount
  //         }
  //         if (paidAmountTemp > 0) {
  //           this.itemDisabled = true
  //         }
  //       }

  //       this.data.invoice.payments = this.tempPaymentList
  //       this.setPaidAmountTotalView()
  //       this.initialPayment = { ...this.tempPaymentList }

  //       if (this.clientList) {
  //         var inv_index_client = this.clientList.findIndex(client => client.uniqueKeyClient == this.invoice.unique_key_fk_client)
  //         this.clientsLocal[0] = this.clientList[inv_index_client];
  //       }

  //       if (this.invoice.discount_on_item == 1) {
  //         this.discounttext = "Discount (On Item)"
  //         this.discountLabel = true;
  //         this.show_discount = false;
  //       } else if (this.invoice.discount_on_item == 0) {
  //         this.discounttext = "Discount (On Bill)"
  //         this.show_discount = true;
  //       } else {
  //         this.show_discount = false;
  //         this.discounttext = "Discount (Disabled)"
  //       }

  //       if (this.invoice.tax_on_item == 0) {
  //         this.taxtext = "Tax (On Item)"
  //         this.taxLabel = true;
  //         this.show_tax_input = false;
  //       } else if (this.invoice.tax_on_item == 1 && this.invoice.tax_rate > 0) {
  //         this.taxtext = "Tax (On Bill)"
  //         this.show_tax_input = true;
  //       } else {
  //         this.show_tax_input = false;
  //         this.taxtext = "Tax (Disabled)"
  //       }

  //       if (this.invoice.shipping_charges && this.invoice.shipping_charges >= 0)
  //         this.show_shipping_charge = true
  //       else
  //         this.show_shipping_charge = false
  //       if (this.invoice.percentage_flag && this.invoice.percentage_flag == 1)
  //         this.isRate = true
  //       else
  //         this.isRate = false
  //       if (this.invoice.due_date == null || this.invoice.due_date === '') {
  //         this.selectDueDate = "no_due_date";
  //       } else if (this.invoice.due_date == this.invoice.created_date) {
  //         this.selectDueDate = "immediate";
  //         this.customDate = false;
  //       } else if (this.invoice.due_date != this.invoice.created_date) {
  //         this.customDate = false;
  //         var difference = dateDifference(this.invoice.created_date, this.invoice.due_date);
  //         if (this.dueDateDays.indexOf(difference) > -1) {
  //           var index = this.dueDateDays.indexOf(difference);
  //           this.selectDueDate = ''
  //         } else {
  //           this.selectDueDate = "custom_date";
  //         }
  //       }
  //     }
  //     this.routeParams.invId = this.invoice.unique_identifier;
  //   }
  // }
}
