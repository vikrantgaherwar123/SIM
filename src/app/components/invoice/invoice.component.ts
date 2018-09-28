import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { DatePipe } from '@angular/common';

import { InvoiceService } from '../../services/invoice.service'
import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'
import { generateUUID, changeInvoice, dateDifference } from '../../globalFunctions'
import { CookieService } from 'ngx-cookie-service'

interface response {
  status: number,
  records: Array<{}>,
  message: string,
  error: string,
  termsAndConditionList: [termsAndCondition],
  settings: {
    appSettings: {
      androidSettings: any
    }
  },
  productList: Array<{}>,
  quotationList: Array<{}>,
  invoiceList: Array<{}>
}
interface setting {
  alstTaxName: []
  adjustment: string
  balance: string
  currencyInText: string
  dateDDMMYY: boolean
  date_format: boolean
  discount: string
  discount_on_item: number
  mTvQty: string
  mTvProducts: string
  mTvRate: string
  mTvAmount: string
  mTvTermsAndConditions: string
  mTvBillTo: string
  mTvShipTo: string
  mTvDueDate: string
  paid: string
  quotFormat: string
  quotNo: string
  subtotal: string
  shipping: string
  tax_on_item: number
  total: string
}
interface termsAndCondition {
  _id: string,
  unique_identifier: string,
  organization_id: string,
  terms: string,
  set_default: boolean,
  deleted_flag: boolean
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  providers: [DatePipe]
})
export class InvoiceComponent implements OnInit {

  private data = {
    item: {},
    invoice: {
      payments: [],
      taxList: [],
      orgName: '',
      tempInvNo: '',
      disp: false,
      listItems: [],
      termsAndConditions: []
    },
    terms: {},
    add_invoice: {
      amount: 0.00,
      adjustment: 0,
      balance: 0.00,
      due_date: '',
      due_date_flag: 0,
      organization_id: '',
      termsAndConditions: [],
      created_date: '',
      device_modified_on: 0,
      discount: 0,
      discount_on_item: 0,
      invoice_number: '',
      gross_amount: 0,
      listItems: [],
      payments: [],
      percentage_flag: 0,
      percentage_value: '',
      shipping_address: '',
      shipping_charges: 0,
      tax_amount: 0,
      tax_on_item: 0,
      tax_rate: 0,
      taxList: [],
      unique_identifier: '',
      unique_key_fk_client: 0
    },
    idList: ''
  }
  private invoices = []
  private invoice
  private invoiceItems = []
  private invoiceTerms = []
  private invoiceViewLoader: boolean
  private invoiceListLoader: boolean
  private selectedInvoice = null
  private tempQuaNoOnAdd: number
  private invoiceFilterTerm: string
  private invoiceDate
  private paymentDate
  private tempEstNo: number
  private createInvoice: boolean = true
  private viewInvoice: boolean = false
  private editInvoice: boolean = false
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

  private client = {
    client: {
      email: '',
      number: '',
      name: '',
      addressLine1: '',
      shippingAddress: ''
    }
  }
  private clientList = []
  private clients = []
  private clientDisplayLimit = 10
  private clientListLoader: boolean
  private clientFocus: boolean
  private clientsLocal = []
  private clientValidation: boolean
  private showClientError: boolean
  private receiptList

  private productList = []
  private addProductList = []
  private addProduct: {
    itemDescription: string
  } = {
      itemDescription: ''
    }

  private repos = []
  filteredRepos: Observable<string[]>
  private show_tax_input_list: []
  private tempflagTaxList: []

  private tax_on: string
  private taxtext: string
  private discount_on: string
  private discounttext: string

  private customersSelect
  private settings: any
  private terms
  private termList
  private editdata

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
  private tempInv12: []
  private tempPaymentList
  private tempItemList
  private tempTermList
  private routeParams: {
    estId: string,
    invId: string
  }

  private newItemCounter: number = 0
  private total = 0

  private checked = false
  private customDate = true
  private isRate = true
  private dueDate = ""

  private searchText: string = ''
  private isNone: boolean
  private isByClient: boolean
  private isByDate: boolean
  private isInvNo: boolean
  private sortInvoices: string
  private isAmount: boolean

  private showMultipleTax: boolean
  private authenticated: {
    setting: setting
  }
  private fullPayment: boolean

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
  billingTo = new FormControl('')

  constructor(private router: Router,
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private cookie: CookieService,
    private settingService: SettingService,
    private productService: ProductService,
    private datePipe: DatePipe
  ) {
    this.user = JSON.parse(this.cookie.get('user'))
    this.authenticated = { setting: this.user.setting }
    // console.log(this.authenticated)
  }

  ngOnInit() {
    this.init()
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.repos.filter(option => option.value.toLowerCase().includes(filterValue));
  }

  toggle() {
    this.checked = !this.checked
  }

  init() {
    this.invoiceViewLoader = true
    this.invoiceListLoader = false
    this.clientsLocal = []

    this.clientListLoader = true
    this.clientFocus = false

    this.initializeSettings(this.tempQuaNoOnAdd)

    this.data.add_invoice.taxList = []
    this.show_tax_input_list = []
    this.tempflagTaxList = []
    this.fullPayment = false;
    this.data.add_invoice.gross_amount = 0.00
    this.data.add_invoice.balance = 0.00;
    this.clients = []

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
      this.data.add_invoice.created_date = this.invoiceDate.value.getTime()
    } else if (this.settings.date_format = 'mm-dd-yy') {
      this.invoiceDate = new FormControl(new Date())
      this.paymentDate = new FormControl(new Date())
      this.data.add_invoice.created_date = this.invoiceDate.value.getTime()
    }

    // DataStore.initializer([])
    // DataStore.productsList.length == 0
    var self = this
    if (1) {
      this.productService.fetch().subscribe((response: response) => {
        if (response.records != null) {
          self.productList = response.records.filter((pro) => pro.enabled == 0)
          // DataStore.addProductsList(this.productList)
          // console.log(self.productList);
        }
      })
    } else {
      // this.productList = DataStore.productsList
    }
    // DataStore.clientsList.length == 0
    if (1) {
      this.clientService.fetch().subscribe((response: response) => {
        if (response.records !== null) {
          this.clients = response.records
          // console.log('clients', this.clients);

          this.repos = response.records.map((repo: { value: string, name: string }) => {
            repo.value = repo.name.toLowerCase()
            return repo
          })
          this.repos.sort(this.compare)
          this.repos = this.repos.filter(client => client.enabled == 0)
          this.filteredRepos = this.billingTo.valueChanges.pipe(startWith(''),
            map(value => this._filter(value))
          )

          this.clientListLoader = false
          // DataStore.addClientsList(this.repos)
          // DataStore.addUnSortedClient(this.clients)
        } else {
          this.clients = []
          this.clientListLoader = false
        }
        this.customersSelect = this.clients
      })
    } else {
      this.clientListLoader = false
      // this.repos = DataStore.clientsList
      // this.clients = DataStore.unSortedClient
    }
    // DataStore.termsList.length == 0
    if (1) {
      this.termConditionService.fetch().subscribe((response: response) => {
        this.terms = response.termsAndConditionList.filter(tnc => tnc.enabled == 0)
        // DataStore.addTermsList(this.terms)
        if (this.terms !== null) {
          this.termList = []
          if (this.terms !== null && typeof this.terms !== 'undefined') {
            for (var i = 0; i < this.terms.length; i++) {
              if (this.terms[i].setDefault == 'DEFAULT' && this.terms[i].enabled == 0) {
                var temp = {
                  "_id": this.terms[i].serverTermCondId,
                  "unique_identifier": this.terms[i].uniqueKeyTerms,
                  "organization_id": this.terms[i].orgId,
                  "terms_condition": this.terms[i].terms
                }
                this.termList.push(temp)

                var index29 = this.terms.filter((pro) => pro.enabled == 0).findIndex(
                  t => t.uniqueKeyTerms == this.terms[i].uniqueKeyTerms
                )
                this.data.terms[index29] = true;
              }
            }
          }
        }
      })
    } else {
      this.termList = []
      if (this.terms !== null && typeof this.terms !== 'undefined') {
        for (var i = 0; i < this.terms.length; i++) {
          if (this.terms[i].setDefault == 'DEFAULT' && this.terms[i].enabled == 0) {
            var temp = {
              "_id": this.terms[i].serverTermCondId,
              "unique_identifier": this.terms[i].uniqueKeyTerms,
              "organization_id": this.terms[i].orgId,
              "terms_condition": this.terms[i].terms
            }
            this.termList.push(temp)
            var index29 = this.terms.filter((pro) => pro.enabled == 0).findIndex(
              t => t.uniqueKeyTerms == this.terms[i].uniqueKeyTerms
            )
            this.data.terms[index29] = true;
          }
        }
      }
    }

    //console.log("settings",settings)
    if (settings) {
      this.data.add_invoice.discount_on_item = settings.discount_on_item
      this.data.add_invoice.tax_on_item = settings.tax_on_item
      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        this.data.add_invoice.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        this.data.add_invoice.tax_on_item = 2
      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        this.data.add_invoice.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }
      if (settings.discount_on_item == 0) {
        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        this.data.add_invoice.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        this.data.add_invoice.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        this.data.add_invoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.data.add_invoice.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.data.add_invoice.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
    // DataStore.invoicesList.length == 0
    if (1) {
      this.invoiceService.fetch().subscribe((result: response) => {
        this.invoices = result.records.filter(est => est.deleted_flag == 0)

        this.clientService.fetch().subscribe((response: response) => {
          var dates = []
          this.clientList = response.records

          for (var i = 0; i < this.invoices.length; i++) {
            for (var j = 0; j < this.clientList.length; j++) {
              if (this.invoices[i].unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
                this.invoices[i].orgName = this.clientList[j].name
                this.invoices[i].disp = true
              }
            }
            var tempEstNo = this.invoices[i].invoice_number.replace(/[^\d.]/g, '!')
            this.invoices[i].tempEstNo = parseInt(tempEstNo.substr(tempEstNo.lastIndexOf('!') + 1))
            if (isNaN(this.invoices[i].tempEstNo)) {
              this.invoices[i].tempEstNo = 0
            }
            dates.push(this.invoices[i])
          }

          dates.reverse();
          var groupedDates = dates.reduce((l, r) => {
            var keyParts = r.created_date.split("-"),
              key = keyParts[0] + keyParts[1]

            if (typeof l[key] === "undefined") {
              l[key] = []
            }
            l[key].push(r)
            return l
          }, {})

          var result = Object.keys(groupedDates).sort((a, b) => Number(b) - Number(a)).map((key) => {
            return groupedDates[key]
          })

          this.tempInv12 = []
          this.tempkey = Object.keys(groupedDates).reverse()
          var tempy = this.tempkey[0].slice(0, 4)
          var tempm = this.tempkey[0].slice(4, 6)
          tempm = ('0' + (parseInt(tempm))).slice(-2)

          if ('02' == tempm) {
            var tempComD = tempy + '-' + tempm + '-' + '28'
          } else if ('01' == tempm || '03' == tempm || '05' == tempm || '07' == tempm || '08' == tempm || '10' == tempm || '12' == tempm) {
            var tempComD = tempy + '-' + tempm + '-' + '31'
          } else {
            var tempComD = tempy + '-' + tempm + '-' + '30'
          }
          //console.log("io",dte);
          var tempObj = {
            "created_date": tempComD,
            "seperator": true,
            "disp": false
          }
          this.tempInv12.push(tempObj)
          var count = 0
          this.tempkey = Object.keys(groupedDates).reverse()
          result.forEach((key) => {
            key.forEach((innerKey) => {
              this.tempInv12.push(innerKey)
            })
            count++
            var tempComD = '';
            if (this.tempkey[count]) {
              var tempy1 = this.tempkey[count].slice(0, 4)
              var tempm1 = self.tempkey[count].slice(4, 6)
              tempm1 = ('0' + (parseInt(tempm1))).slice(-2)
              if ('02' == tempm1) {
                var tempComD = tempy1 + '-' + tempm1 + '-' + '28'
              } else if ('01' == tempm1 || '03' == tempm1 || '05' == tempm1 || '07' == tempm1 || '08' == tempm1 || '10' == tempm1 || '12' == tempm1) {
                var tempComD = tempy1 + '-' + tempm1 + '-' + '31'
              } else {
                var tempComD = tempy1 + '-' + tempm1 + '-' + '30'
              }
            }
            var tempObj = {
              "created_date": tempComD,
              "seperator": true,
              "disp": false
            }
            self.tempInv12.push(tempObj)
          })

          self.invoices = this.tempInv12
          // DataStore.addInvoicesList(this.invoices)
          //console.log("34",JSON.stringify(this.tempInv12))
          self.invoiceListLoader = true
          // $rootScope.pro_bar_load = true
        })

        this.route.params.subscribe(params => {
          if (params.invId != "0") {
            this.getInvoice(params.invId, 0)
          }
        })
      })
    } else {
      // this.invoices = DataStore.invoicesList
      this.invoiceListLoader = true
      // $rootScope.pro_bar_load = true
    }
    this.data.add_invoice.listItems.push({
      'description': '',
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
  }

  initializeSettings(invNoParam) {
    var settings = this.authenticated.setting
    this.settingService.fetch().subscribe((response: response) => {
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
            this.data.add_invoice.invoice_number = settings.quotFormat + invNoParam
          else if (typeof settings.quotFormat !== 'undefined')
            this.data.add_invoice.invoice_number = "Est_" + invNoParam
          else
            this.data.add_invoice.invoice_number = invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempEstNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempEstNo
          } else {
            this.tempEstNo = 1
            this.tempQuaNoOnAdd = this.tempEstNo
          }
          if (settings.quotFormat || settings.quotFormat === '') {
            this.data.add_invoice.invoice_number = settings.quotFormat + this.tempEstNo
          } else if (typeof settings.quotFormat !== 'undefined') {
            this.data.add_invoice.invoice_number = "Est_" + this.tempEstNo
          } else {
            this.data.add_invoice.invoice_number = this.tempEstNo.toString()
          }
        }
      } else {
        if (invNoParam) {
          this.data.add_invoice.invoice_number = settings.quotFormat + invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempEstNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempEstNo
          } else {
            this.tempEstNo = 1
            this.tempQuaNoOnAdd = this.tempEstNo
          }
          if (settings.quotFormat) {
            this.data.add_invoice.invoice_number = settings.quotFormat + this.tempEstNo
          } else {
            this.data.add_invoice.invoice_number = "Est_" + this.tempEstNo
          }
        }
      }
    })
  }

  getInvoice(id, index) {
    if (id) {
      this.invoiceViewLoader = false
      $('#msgInv').removeClass("show")
      $('#msgInv').addClass("hide")
      $('#invMain').removeClass("hide")
      $('#invMain').addClass("show")
      $('#editInv').removeClass("show")
      $('#editInv').addClass('hide')
      // this.data.invoice = {}
      // this.invoice = {}
      this.data.invoice.payments = []
      this.tempPaymentList = []
      this.tempItemList = []
      this.tempTermList = []
      this.customDate = true

      // this.clientList = DataStore.unSortedClient
      // this.invoices = DataStore.invoicesList;
      if (this.invoices) {
        var inv_index = this.invoices.findIndex(inv => inv.unique_identifier == id)
        this.invoice = this.invoices[inv_index]
        this.data.invoice = Object.assign({}, this.invoice)
        delete this.data.invoice.orgName
        delete this.data.invoice.tempInvNo
        delete this.data.invoice.disp
        this.invoice.termsAndConditions = this.invoice.termsAndConditions
        this.invoice.payments = this.invoice.payments

        this.invoiceDate = this.datePipe.transform(this.invoice.created_date)
        this.dueDate = this.datePipe.transform(this.invoice.due_date)

        if (this.invoice.taxList) {
          if (this.invoice.taxList.length > 0) {
            this.showMultipleTax = true
          } else {
            this.showMultipleTax = false
          }
        } else {
          this.showMultipleTax = false
        }

        for (var j = 0; j < this.data.invoice.listItems.length; j++) {
          var temp = {
            'unique_identifier': this.data.invoice.listItems[j].uniqueKeyListItem,
            'product_name': this.data.invoice.listItems[j].productName,
            'description': this.data.invoice.listItems[j].description == null ? '' : this.data.invoice.listItems[j].description,
            'quantity': this.data.invoice.listItems[j].qty,
            /*'inventory_enabled':this.productList[index].inventoryEnabled,*/
            'unit': this.data.invoice.listItems[j].unit,
            'rate': this.data.invoice.listItems[j].rate,
            'discount': this.data.invoice.listItems[j].discountRate,
            'tax_rate': this.data.invoice.listItems[j].tax_rate,
            'total': this.data.invoice.listItems[j].price,
            'tax_amount': this.data.invoice.listItems[j].taxAmount,
            'discount_amount': this.data.invoice.listItems[j].discountAmount,
            'unique_key_fk_product': this.data.invoice.listItems[j].uniqueKeyFKProduct,
            '_id': this.data.invoice.listItems[j].listItemId,
            'local_prod_id': this.data.invoice.listItems[j].prodId,
            'organization_id': this.data.invoice.listItems[j].org_id,
            'invoiceProductCode': this.data.invoice.listItems[j].invoiceProductCode,
            'unique_key_fk_invoice': this.data.invoice.listItems[j].uniqueKeyFKInvoice
          }
          this.tempItemList.push(temp);
        }
        if (!isNaN(this.data.invoice.termsAndConditions && !this.data.invoice.termsAndConditions == null
          && this.data.invoice.termsAndConditions.isEmpty())
        ) {
          for (var i = 0; i < this.data.invoice.termsAndConditions.length; i++) {
            var temp1 = {
              "terms_condition": this.data.invoice.termsAndConditions[i].terms,
              "_id": this.data.invoice.termsAndConditions[i].localId,
              "local_invoiceId": this.data.invoice.termsAndConditions[i].invoiceId,
              "invoice_id": this.data.invoice.termsAndConditions[i].serverInvoiceId,
              "organization_id": this.data.invoice.termsAndConditions[i].serverOrgId,
              "unique_identifier": this.data.invoice.termsAndConditions[i].uniqueInvoiceTerms,
              "unique_key_fk_invoice": this.data.invoice.termsAndConditions[i].uniqueKeyFKInvoice
            }
            this.tempTermList.push(temp1);
          }
        }

        this.data.invoice.listItems = this.tempItemList;
        this.data.invoice.termsAndConditions = this.tempTermList

        if (typeof this.data.invoice.payments !== 'undefined') {
          var paidAmountTemp = 0;
          for (var i = 0; i < this.data.invoice.payments.length; i++) {
            var temp = {
              "date_of_payment": this.data.invoice.payments[i].dateOfPayment,
              "paid_amount": this.data.invoice.payments[i].paidAmount,
              "organization_id": this.data.invoice.payments[i].orgId,
              "unique_identifier": this.data.invoice.payments[i].uniqueKeyInvoicePayment,
              "unique_key_fk_client": this.data.invoice.payments[i].uniqueKeyFKClient,
              "unique_key_fk_invoice": this.data.invoice.payments[i].uniqueKeyFKInvoice,
              "deleted_flag": this.data.invoice.payments[i].enabled,
              "unique_key_voucher_no": this.data.invoice.payments[i].uniqueKeyVoucherNo,
              "voucher_no": this.data.invoice.payments[i].voucherNo,
              "_id": this.data.invoice.payments[i].invPayId,
              "local_invoice_id": this.data.invoice.payments[i].invoiceId,
              "local_client_id": this.data.invoice.payments[i].clientId,
              "paymentNote": this.data.invoice.payments[i].paymentNote
            }
            this.tempPaymentList.push(temp)
            paidAmountTemp = paidAmountTemp + this.data.invoice.payments[i].paidAmount
          }
          if (paidAmountTemp > 0) {
            this.itemDisabled = true
          }
        }

        this.data.invoice.payments = this.tempPaymentList
        this.setPaidAmountTotalView()
        this.initialPayment = { ...this.tempPaymentList }

        if (this.clientList) {
          var inv_index_client = this.clientList.findIndex(client => client.uniqueKeyClient == this.invoice.unique_key_fk_client)
          this.clientsLocal[0] = this.clientList[inv_index_client];
          this.invoiceViewLoader = true;
        }

        if (this.invoice.discount_on_item == 1) {
          this.discounttext = "Discount (On Item)"
          this.discountLabel = true;
          this.show_discount = false;
        } else if (this.invoice.discount_on_item == 0) {
          this.discounttext = "Discount (On Bill)"
          this.show_discount = true;
        } else {
          this.show_discount = false;
          this.discounttext = "Discount (Disabled)"
        }

        if (this.invoice.tax_on_item == 0) {
          this.taxtext = "Tax (On Item)"
          this.taxLabel = true;
          this.show_tax_input = false;
        } else if (this.invoice.tax_on_item == 1 && this.invoice.tax_rate > 0) {
          this.taxtext = "Tax (On Bill)"
          this.show_tax_input = true;
        } else {
          this.show_tax_input = false;
          this.taxtext = "Tax (Disabled)"
        }

        if (this.invoice.shipping_charges && this.invoice.shipping_charges >= 0)
          this.show_shipping_charge = true
        else
          this.show_shipping_charge = false
        if (this.invoice.percentage_flag && this.invoice.percentage_flag == 1)
          this.isRate = true
        else
          this.isRate = false
        if (this.invoice.due_date == null || this.invoice.due_date === '') {
          this.selectDueDate = "no_due_date";
        } else if (this.invoice.due_date == this.invoice.created_date) {
          this.selectDueDate = "immediate";
          this.customDate = false;
        } else if (this.invoice.due_date != this.invoice.created_date) {
          this.customDate = false;
          var difference = dateDifference(this.invoice.created_date, this.invoice.due_date);
          if (this.dueDateDays.indexOf(difference) > -1) {
            var index = this.dueDateDays.indexOf(difference);
            this.selectDueDate = ''
          } else {
            this.selectDueDate = "custom_date";
          }
        }
      }
      this.routeParams.invId = this.invoice.unique_identifier;
    }
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

  setSortInvoice(searchfield) {
    if (searchfield == 'id') {
      this.isNone = true
      this.isByClient = false
      this.isByDate = false
      this.isInvNo = false
      this.isAmount = false
    } else if (searchfield == 'name') {
      this.isNone = false
      this.isByClient = true
      this.isByDate = false
      this.isInvNo = false
      this.isAmount = false
    } else if (searchfield == 'created_date') {
      this.isNone = false
      this.isByClient = false
      this.isByDate = true
      this.isInvNo = false
      this.isAmount = false
    } else if (searchfield == 'invoice_number') {
      this.isNone = false
      this.isByClient = false
      this.isByDate = false
      this.isInvNo = true
      this.isAmount = false
    } else if (searchfield == 'amount') {
      this.isNone = false
      this.isByClient = false
      this.isByDate = false
      this.isInvNo = false
      this.isAmount = true
    }
    this.sortInvoices = searchfield
  }

  setPaidAmountTotalView() {
    var temp = 0
    if (typeof this.invoice.payments !== 'undefined') {
      for (var i = 0; i < this.invoice.payments.length; i++) {
        temp = temp + parseFloat(this.invoice.payments[i].paidAmount)
      }
    }
    this.paid_amount = temp
  }

  isEmpty1() {
    return this.clientsLocal[0] && (typeof this.clientsLocal[0].email === 'undefined' || this.clientsLocal[0].email === '')
  }

  isEmpty2() {
    return this.clientsLocal[0] && (typeof this.clientsLocal[0].number === 'undefined' || this.clientsLocal[0].number === '')
  }

  isEmpty11() {
    return (typeof this.client.client.email === 'undefined' || this.client.client.email === '')
  }

  isEmpty12() {
    return (typeof this.client.client.number === 'undefined' || this.client.client.number === '')
  }

  dynamicOrder(invoice) {
    //console.log("invoices",invoice)
    var order = 0
    switch (this.sortInvoices) {
      case 'name':
        order = invoice.orgName
        this.rev = false
        break

      case 'created_date':
        {
          var date = new Date(invoice.createDate)
          order = date.getTime()
          this.rev = true
          break
        }
      case 'invoice_number':
        order = invoice.tempEstNo
        this.rev = true
        break

      case 'amount':
        order = parseFloat(invoice.amount)
        this.rev = true
        break

      default:
        order = invoice.deviceCreatedDate
        this.rev = true
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

  saveTermEdit(data, status) {
    $('#addtermbtn').prop('disabled', true)
    var baseURL = Data.getBaseUrl()
    if (status) {
      data.organization_id = $rootScope.authenticated.user.orgId
      if (!data.unique_identifier)
        data.unique_identifier = utility.generateUUID()
      var d = new Date()
      data.device_modified_on = d.getTime()
      this.termConditionService.addTermAndCondition([data]).subscribe(function (response: response) {
        if (response.status === 200) {
          data = {}
          this.termCondition = {}
          //console.log("78", response.data.termsAndConditionList, this.terms)

          var tempTerm78 = {
            "serverTermCondId": response.termsAndConditionList[0]._id,
            "uniqueKeyTerms": response.termsAndConditionList[0].unique_identifier,
            "orgId": response.termsAndConditionList[0].organization_id,
            "terms": response.termsAndConditionList[0].terms,
            "setDefault": response.termsAndConditionList[0].set_default,
            "enabled": response.termsAndConditionList[0].deleted_flag
          }
          //this.terms.push(tempTerm78)
          // DataStore.pushTermsList(tempTerm78)
          this.terms_edit.push(tempTerm78)

          if (tempTerm78.setDefault === 'DEFAULT') {
            var temp45 = {
              "_id": tempTerm78.serverTermCondId,
              "unique_identifier": tempTerm78.uniqueKeyTerms,
              "organization_id": tempTerm78.orgId,
              "terms_condition": tempTerm78.terms
            }
            this.termListEdit.push(temp45)

            var index29 = findObjectIndex(this.terms.filter(function (pro) {
              return (pro.enabled == 0)
            }), 'uniqueKeyTerms', tempTerm78.uniqueKeyTerms)
            this.editdata.terms[index29] = true

          }

          this.term = {}
          this.termForm.$setUntouched()
          $('#addtermbtn').prop('disabled', false)
          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true })
          //$('#add-terms').modal('hide')
        } else {
          $('#addtermbtn').prop('disabled', false)
          // notifications.showError({ message: response.message, hideDelay: 1500, hide: true })
        }
      })
    }
  }

  saveTerm(data, status) {
    $('#addtermbtn').prop('disabled', true)
    if (status) {
      data.organization_id = this.user.user.orgId
      if (!data.unique_identifier) data.unique_identifier = generateUUID(this.user.user.orgId)
      var d = new Date()
      data.device_modified_on = d.getTime()
      this.termConditionService.addTermAndCondition([data]).subscribe(function (response: response) {
        if (response.status === 200) {
          data = {}
          this.termCondition = {}

          var tempTerm78 = {
            "serverTermCondId": response.termsAndConditionList[0]._id,
            "uniqueKeyTerms": response.termsAndConditionList[0].unique_identifier,
            "orgId": response.termsAndConditionList[0].organization_id,
            "terms": response.termsAndConditionList[0].terms,
            "setDefault": response.termsAndConditionList[0].set_default,
            "enabled": response.termsAndConditionList[0].deleted_flag
          }
          //this.terms.push(tempTerm78)
          // DataStore.pushTermsList(tempTerm78)


          if (tempTerm78.setDefault === 'DEFAULT') {
            var temp45 = {
              "_id": tempTerm78.serverTermCondId,
              "unique_identifier": tempTerm78.uniqueKeyTerms,
              "organization_id": tempTerm78.orgId,
              "terms_condition": tempTerm78.terms
            }
            this.termList.push(temp45)

            var index29 = findObjectIndex(this.terms.filter(function (pro) {
              return (pro.enabled == 0)
            }), 'uniqueKeyTerms', tempTerm78.uniqueKeyTerms)
            this.data.terms[index29] = true

          }

          this.term = {}
          this.termForm.$setUntouched()
          $('#addtermbtn').prop('disabled', false)
          // notifications.showSuccess({ message: response.data.message, hideDelay: 1500, hide: true })
          //$('#add-terms').modal('hide')

        } else {
          $('#addtermbtn').prop('disabled', false)
          // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })

          // alert(result.message)
        }

      })
    }
  }

  querySearch(query) {
    var results
    if (this.repos) {
      results = query ? this.repos.filter(this.createFilterFor(query)) : this.repos
      if (false) {
        deferred = $q.defer()
        $timeout(function () {
          deferred.resolve(results)
        }, Math.random() * 1000, false)
        return deferred.promise
      } else {
        return results
      }
    } else
      return []
  }

  searchTextChange(text) {
    //$log.info('Text changed to '+ text)
    //this.clientFocus = true
    this.focusOut(this.searchText)
    //this.searchText = ''
    //console.log('Text changed to ' + text)
  }

  focusOut(name) {
    this.clientValidation = false
    var lowercaseQuery = name.toLowerCase()
    if (this.repos)
      for (var i = 0; i < this.repos.length; i++) {
        var lowercaseQuery1 = angular.lowercase(this.repos[i].name)
        if (lowercaseQuery1 === lowercaseQuery) {
          this.clientValidation = true
          break
        }
        else {
          this.clientValidation = false
        }
      }
  }

  watch() {
    var invoiceDateArray = ''
    if (this.invoiceDate.indexOf('.') > -1)
      invoiceDateArray = this.invoiceDate.split('.')
    else
      invoiceDateArray = this.invoiceDate.split('-')

    if ($rootScope.settings.date_format === 'dd-mm-yy') {
      this.data.add_invoice.created_date = (new Date(invoiceDateArray[2], parseInt(invoiceDateArray[1]) - 1, invoiceDateArray[0])).getTime()

    } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
      this.data.add_invoice.created_date = (new Date(invoiceDateArray[2], parseInt(invoiceDateArray[0]) - 1, invoiceDateArray[1])).getTime()
    }
  }

  focusOutMessage(name) {
    this.showClientError = false
    var lowercaseQuery = name.toLowerCase()
    var tempFlag = true
    if (this.repos) {
      for (var i = 0; i < this.repos.length; i++) {
        var lowercaseQuery1 = this.repos[i].name.toLowerCase()
        if (lowercaseQuery1 === lowercaseQuery) {
          this.showClientError = false
          tempFlag = false
        } else if ((i === (this.repos.length) - 1) && tempFlag) {
          this.showClientError = true
          this.searchText = ''
        }
      }
    }
  }

  selectedClientChange(item) {
    item = this.repos.filter(client => client.value == item.option.value)[0]

    if (typeof item !== 'undefined') {
      var clientId = item.uniqueKeyClient
      if (typeof this.clients !== 'undefined') {
        var index = this.clients.findIndex(client => client.uniqueKeyClient == clientId)
        if (typeof clientId !== 'undefined' && index === -1) {
          this.client.client = { email: '', number: '', addressLine1: '', name: clientId, shippingAddress: '' }
          // this.addClient(true)
        } else {
          this.client.client.addressLine1 = ''
          this.client.client.email = ''
          this.client.client.number = ''
          this.client.client.name = clientId
        }
        for (var j = 0; j < this.clients.length; j++) {
          if (this.clients[j].uniqueKeyClient == clientId) {
            this.client.client = this.clients[j]
            //$rootScope.selectClient = this.client.client
            this.data.add_invoice.unique_key_fk_client = clientId
            this.data.add_invoice.shipping_address = this.client.client.shippingAddress
            this.client.client.addressLine1 = this.client.client.addressLine1
            break
          }
        }
        // this.focusOut(item.name)
        this.showClientError = false
      } else {
        this.client.client = { addressLine1: '', email: '', name: '', number: '', shippingAddress: '' }
      }
    } else {
      //console.log("clients",this.clients)
      this.client.client = { addressLine1: '', email: '', name: '', number: '', shippingAddress: '' }
      this.searchText = ''
    }
  }

  createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query)

    return function filterFn(item) {
      return (item.value.indexOf(lowercaseQuery) === 0) || (item.value.indexOf(lowercaseQuery) === 1)
        || (item.value.indexOf(lowercaseQuery) === 2) || (item.value.indexOf(lowercaseQuery) === 3)
        || (item.value.indexOf(lowercaseQuery) === 4) || (item.value.indexOf(lowercaseQuery) === 5)
        || (item.value.indexOf(lowercaseQuery) === 6) || (item.value.indexOf(lowercaseQuery) === 7)
        || (item.value.indexOf(lowercaseQuery) === 8) || (item.value.indexOf(lowercaseQuery) === 9)
        || (item.value.indexOf(lowercaseQuery) === 10) || (item.value.indexOf(lowercaseQuery) === 11)
    }

  }

  newState(state) {
    this.addClient(state)
  }

  addLineItem() {
    this.newItemCounter += 1
    this.data.add_invoice.listItems.push({
      'description': '',
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
    // console.log(this.data.add_invoice.listItems)

    if (this.newItemCounter > 0) {
      this.focusOutMessage(this.searchText)
    }
  }

  addItem(index, product) {
    // console.log(index, product);

    if (index !== -1) {
      this.data.add_invoice.listItems[index].unique_key_fk_product = product.uniqueKeyProduct
      this.data.add_invoice.listItems[index].unique_identifier = generateUUID(this.user.user.orgId)
      this.data.add_invoice.listItems[index].description = product.discription == null ? '' : product.discription
      this.data.add_invoice.listItems[index].product_name = product.prodName
      this.data.add_invoice.listItems[index].quantity = 1
      this.data.add_invoice.listItems[index].unit = product.unit
      this.data.add_invoice.listItems[index].rate = product.rate
      this.data.add_invoice.listItems[index].tax_rate = 0.00
    }
    // console.log(this.data.add_invoice.listItems);

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
    //this.setTermsList(this.data.terms);
    // $rootScope.pro_bar_load = false;
    var createdTime = new Date()
    var dueDateTime = new Date()
    if (this.data.add_invoice.due_date && this.data.add_invoice.due_date !== '') {
      dueDateTime.setTime(parseInt(this.data.add_invoice.due_date))
      this.data.add_invoice.due_date = dueDateTime.getFullYear() + '-' + ('0' + (dueDateTime.getMonth() + 1)).slice(-2) + '-' + ('0' + dueDateTime.getDate()).slice(-2);
    } else {
      this.data.add_invoice.due_date
    }

    createdTime.setTime(parseInt(this.data.add_invoice.created_date))
    if (isNaN(createdTime) && typeof createdTime == 'undefined' || createdTime == '') {
      createdTime = new Date()
    }
    this.data.add_invoice.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

    this.data.add_invoice.organization_id = this.user.user.orgId
    this.data.add_invoice.termsAndConditions = this.termList
    this.data.add_invoice.unique_identifier = generateUUID(this.user.user.orgId)
    this.data.add_invoice.balance = this.balance

    for (var i = this.data.add_invoice.listItems.length; i > 0; i--) {
      this.data.add_invoice.listItems[i - 1].unique_key_fk_invoice = this.data.add_invoice.unique_identifier;
      if (!this.data.add_invoice.listItems[i - 1].product_name || this.data.add_invoice.listItems[i - 1].product_name == '') {
        this.data.add_invoice.listItems.splice(i - 1, 1);
      }
    }

    var tempIndexName1 = this.repos.findIndex(client => client.name == this.billingTo.value)
    if (this.data.add_invoice.listItems.length !== 0 && tempIndexName1 !== -1) {
      if (status) {
        // $('#InvSbmtBtn').button('loading');
        //$('#invoiceSavebtn').button('loading');

        for (var j = 0; j < this.data.add_invoice.termsAndConditions.length; j++) {
          this.data.add_invoice.termsAndConditions[j].unique_key_fk_invoice = this.data.add_invoice.unique_identifier;
        }
        for (var t = 0; t < this.data.add_invoice.taxList.length; t++) {
          if (this.data.add_invoice.taxList[t] == null) {
            this.data.add_invoice.taxList.splice(t, 1)
          }
        }

        if (this.addProductList.length > 0)
          this.saveProduct(this.addProductList)
        for (var k = 0; k < this.data.add_invoice.payments.length; k++) {
          this.data.add_invoice.payments[k].unique_key_fk_invoice = this.data.add_invoice.unique_identifier
          this.data.add_invoice.payments[k].unique_key_fk_client = this.data.add_invoice.unique_key_fk_client
        }

        var update_status = 0;
        var invoice_id = null;
        var d = new Date();
        this.data.add_invoice.device_modified_on = d.getTime();

        var self = this
        this.invoiceService.add([this.data.add_invoice]).subscribe(function (result: response) {
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
            update_status++
            if (result.status == 200) {
              // var tmpInv = DataStore.invoicesList
              // this.clientList = DataStore.clientsList

              for (var j = 0; j < self.clientList.length; j++) {
                if (result.invoiceList[0].unique_key_fk_client == self.clientList[j].uniqueKeyClient) {
                  result.invoiceList[0].orgName = self.clientList[j].name
                }
              }
              var tempCh = changeInvoice(result.invoiceList[0])
              // tmpInv.splice(0, 0, tempCh)
              // DataStore.addInvoicesList(tmpInv)
              self.routeParams = { ...self.routeParams, invId: tempCh.unique_identifier }
              // self.getInvoice(tempCh.unique_identifier, 0)
              // if ($rootScope.tempInvNoOnAdd)
              //   $rootScope.tempInvNoOnAdd = parseInt(this.tempInvNoOnAdd) + 1
              // else
              //   $rootScope.tempInvNoOnAdd = parseInt(this.tempInvNo) + 1
              self.updateSettings()
              //this.updateInvNum()
              // notifications.showSuccess({
              //   message: result.data.message,
              //   hideDelay: 1500,
              //   hide: true
              // })
              alert('Invoice saved successfully')

              // $rootScope.add_inv_status = true
              // $rootScope.pro_bar_load = true
              // $('#InvSbmtBtn').button('reset')
            } else {
              // $('#InvSbmtBtn').button('reset')
              // $rootScope.pro_bar_load = true;
              console.log(result)
              // notifications.showError({
              //   message: result.data.message + " " + result.data.status,
              //   hideDelay: 1500,
              //   hide: true
              // });
            }
          }
          // $('#invoiceSavebtn').button('reset');
        })
      }
      else {
        // $rootScope.pro_bar_load = true;
        // $('#invoiceSavebtn').button('reset')
        alert('You haven\'t added item')
        // if (this.data.add_invoice.listItems.length == 0) {
        //   notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
        // }
      }
    } else {
      // $rootScope.pro_bar_load = true;
      if (tempIndexName1 == -1) {
        this.searchText = ''
        alert('client not selected')
        // notifications.showError({ message: 'Select your client!', hideDelay: 1500, hide: true });
      } else {
        // notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
        // $('#invoiceSavebtn').button('reset');
      }
    }
  }

  calculateTotal(index) {
    //console.log("in total " + index)
    if (this.data.add_invoice.listItems.length > 0 && typeof this.data.add_invoice.listItems[index].quantity !== "undefined") {
      var rateParse = parseFloat(this.data.add_invoice.listItems[index].rate)
      // console.log{""}
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      var productRate = (this.data.add_invoice.listItems[index].quantity * rateParse)
      this.data.add_invoice.listItems[index].total = productRate
      this.calculateInvoice(1)
    }
  }

  calculateInvoice(indexTaxMultiple) {
    var total = 0

    for (var i = 0; i < this.data.add_invoice.listItems.length; i++) {
      var item = this.data.add_invoice.listItems[i]
      total += parseFloat(item.total)
    }
    this.data.add_invoice.gross_amount = total

    var grossAmount = total
    var discountTotal = 0
    var finalAmount = 0
    var shippingCharges = 0
    var totalAmount = 0
    var discoutAmount = 0
    var tax_rate = 0

    if (this.data.add_invoice.percentage_flag == 1) {
      var discountPercent = parseFloat(this.data.add_invoice.percentage_value) / 100
      if (isNaN(discountPercent)) {
        discountPercent = 0
      }

      discoutAmount = discountPercent * grossAmount
      this.data.add_invoice.discount = discoutAmount
      discountTotal = grossAmount - discoutAmount
    } else if (this.data.add_invoice.percentage_flag == 0) {

      var invoiceDiscount = this.data.add_invoice.discount
      if (isNaN(invoiceDiscount)) {
        invoiceDiscount = 0
      }
      discountTotal = grossAmount - invoiceDiscount
      var discountAmount = (this.data.add_invoice.discount / grossAmount) * 100
      if (isNaN(discountAmount)) {
        discountAmount = 0
      }
      this.data.add_invoice.percentage_value = discountAmount.toString()
    }

    if (this.tax_on == 'taxOnBill') {
      tax_rate = (this.data.add_invoice.tax_rate * discountTotal) / 100
      if (isNaN(tax_rate)) {
        tax_rate = 0
      }
      this.data.add_invoice.tax_amount = tax_rate
      // console.log("tax_ rate bill", tax_rate)
    }

    if (indexTaxMultiple) {
      //console.log("indexmultiple in",indexTaxMultiple,this.data.invoice.taxList)
      var temp_tax_rate = 0
      for (var i = 0; i < this.data.add_invoice.taxList.length; i++) {
        if (this.data.add_invoice.taxList[i]) {
          if (isNaN(parseFloat(this.data.add_invoice.taxList[i].percentage)))
            this.data.add_invoice.taxList[i].percentage = 0
          //console.log("090"+parseFloat(this.data.invoice.taxList[i].percentage))
          this.data.add_invoice.taxList[i].calculateValue = (parseFloat(this.data.add_invoice.taxList[i].percentage) * discountTotal) / 100
          this.data.add_invoice.taxList[i].selected = true
          temp_tax_rate = temp_tax_rate + (parseFloat(this.data.add_invoice.taxList[i].percentage) * discountTotal) / 100
        }
      }
      tax_rate = tax_rate + temp_tax_rate
    }

    shippingCharges = this.data.add_invoice.shipping_charges
    if (isNaN(shippingCharges)) {
      shippingCharges = 0
    }
    totalAmount = discountTotal + shippingCharges + tax_rate

    var adjustmentAmount = this.data.add_invoice.adjustment
    if (isNaN(adjustmentAmount)) {
      adjustmentAmount = 0
    }
    finalAmount = totalAmount - adjustmentAmount

    if (isNaN(finalAmount)) {
      finalAmount = 0
    }
    this.data.add_invoice.amount = parseFloat(finalAmount.toFixed(2))
  }

  setTermsList(term) {
    var index23 = findObjectIndex(this.terms.filter(function (pro) {
      return (pro.enabled == 0)
    }), 'uniqueKeyTerms', term.uniqueKeyTerms)
    if (this.data.terms[index23]) {
      var temp = {
        "_id": term.serverTermCondId,
        "unique_identifier": term.uniqueKeyTerms,
        "organization_id": term.orgId,
        "terms_condition": term.terms
        //"unique_key_fk_invoice" :
      }
      this.termList.push(temp)
    } else {
      var index26 = findObjectIndex(this.termList, 'unique_identifier', term.uniqueKeyTerms)
      this.termList.splice(index26, 1)
    }
  }

  removeItem(index) {
    // var status = -1
    // for (var i = 0; i < this.data.add_invoice.listItems.length; i++) {
    //   var temProName = angular.lowercase(index.product_name)
    //   var temProName1 = angular.lowercase(this.data.add_invoice.listItems[i].product_name)
    //   if (temProName == temProName1) {
    //     status = i
    //     break
    //   }
    // }
    // console.log(index, this.data.add_invoice.listItems)
    this.data.add_invoice.listItems.splice(index, 1)
    this.calculateInvoice(1)
  }

  showMe() {
    this.show = true
    this.tempflag = true
  }

  hideMe() {
    this.data.add_invoice.discount = 0
    this.data.add_invoice.percentage_value = 0
    this.calculateInvoice(1)
    this.show = false
    this.tempflag = false
  }

  showMeAdjustment() {
    this.show_adjustment = true
  }

  hideMeAdjustment() {
    this.data.add_invoice.adjustment = 0
    this.calculateInvoice(1)

    this.show_adjustment = false
  }

  showMeTax() {
    this.show_tax_input = true
    this.tempflagTax = true
  }

  showMeMultipleTax(index) {
    //console.log("showmultiple",this.data.invoice.taxList[index],$rootScope.authenticated.setting.alstTaxName[index])
    var tempIndex = this.data.add_invoice.taxList.length
    this.data.add_invoice.taxList[tempIndex] = {}
    this.data.add_invoice.taxList[tempIndex].taxName = $rootScope.authenticated.setting.alstTaxName[index].taxName
    this.data.add_invoice.taxList[tempIndex].selected = true
    this.multi_tax_index.push(index)
    this.show_tax_input_list[index] = true
    this.tempflagTaxList[index] = true
  }

  hideMeTax() {
    this.data.add_invoice.tax_rate = 0
    this.calculateInvoice(1)
    this.show_tax_input = false
    this.tempflagTax = false
  }

  hideMeTaxMultiple(index) {
    this.data.add_invoice.tax_rate = 0
    this.multi_tax_index.splice(index, 1)
    this.data.add_invoice.taxList.splice(index, 1)
    this.calculateInvoice(index)
    //this.show_tax_input_list[index] = false
    this.tempflagTaxList[index] = false
  }

  showMeShipping() {
    this.show_shipping_charge = true
    this.tempflagShipping = true
  }

  hideMeShipping() {
    this.data.add_invoice.shipping_charges = 0
    this.calculateInvoice(1)

    this.show_shipping_charge = false
    this.tempflagShipping = false
  }

  multiTaxButtonForAddInvoice(taxname, index) {
    var status = true
    for (var k = 0; k < this.multi_tax_index.length; k++) {
      //console.log("in button",index,k,"..")
      if (this.multi_tax_index[k] !== index) {
        status = true
      } else {
        status = false
        break
      }
    }

    return status
  }

  saveProduct(add_product_list) {
    var d = new Date()
    var deleteIndexArray = []
    for (var i = 0; i < add_product_list.length; i++) {
      var uniqueIdProduct = this.data.add_invoice.listItems.findIndex(
        item => item.unique_key_fk_product == add_product_list[i].unique_identifier
      )

      if (uniqueIdProduct !== -1) {
        add_product_list[i].device_modified_on = d.getTime()
        add_product_list[i].rate = this.data.add_invoice.listItems[uniqueIdProduct].rate
        add_product_list[i].unit = ""
        add_product_list[i].discription = this.data.add_invoice.listItems[uniqueIdProduct].description
      } else {
        deleteIndexArray.push(i)
      }
    }
    for (var j = 0; j < deleteIndexArray.length; j++) {
      add_product_list.splice(deleteIndexArray[j], 1)
    }
    this.productService.add(add_product_list).subscribe((result: response) => {
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
    this.settingService.fetch().subscribe((response: response) => {

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

  addTerm() {
    $('#add-terms').modal('show')
  }

  close() {
    $('#add-terms').modal('hide')
  }

  addClient(name) {
    //console.log('add new client',name)
    this.client.client = {}
    this.addClientModal = {}
    this.client.client.address_line1 = ''
    this.client.client.email = ''
    this.client.client.number = ''
    this.client.client.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', function (e) {
      $('#add-client input[type="text"]')[1].select()
    })
  }

  closeClient() {
    //alert('closed!!')
    $("#loadb").css("display", "none")
    $('#add-client').modal('hide')

    this.client.client = {}

    //this.client_display.addressLine1 = ''
    this.addClientModal = {}
    this.data.add_invoice.unique_key_fk_client = 0

    $('#refreshClient').addClass('rotator')

    this.searchText = ''
    this.clientform.$setUntouched()
    // this.repos = DataStore.clientsList
    $("#loadb").css("display", "none")
  }

  saveClient(data, status) {
    // $('#saveClientButton').button('loading')
    var baseURL = Data.getBaseUrl()
    if (status) {
      this.client.client.contact_person_name = this.addClientModal.contact_person_name
      this.client.client.email = this.addClientModal.email
      this.client.client.number = this.addClientModal.number
      this.client.client.address_line1 = this.addClientModal.address_line1
      this.client.client.shipping_address = this.addClientModal.shipping_address
      this.client.client.business_detail = this.addClientModal.business_detail
      this.client.client.business_id = this.addClientModal.business_id

      this.client.client.unique_identifier = utility.generateUUID()
      var d = new Date()
      this.client.client.device_modified_on = d.getTime()
      this.client.client.organization_id = $rootScope.authenticated.user.orgId
      this.data.add_invoice.unique_key_fk_client = this.client.client.unique_identifier

      this.clientService.add([this.client.client]).subscribe((response: response) => {
        if (response.status === 200) {
          $('#refreshClient').addClass('rotator')
          this.clientService.fetch().subscribe((response: response) => {
            this.clients = response.records

            this.data.add_invoice.unique_key_fk_client = this.client.client.unique_identifier
            this.repos = response.records.map((repo: { name: string, value: string }) => {
              repo.value = repo.name.toLowerCase()
              return repo
            })
            this.repos = this.repos.filter(clien => clien.enabled == 0)

            for (var l = 0; l < this.clients.length; l++) {
              if (this.clients[l].uniqueKeyClient === this.client.client.unique_identifier) {
                this.selectedItem = this.clients[l]
              }
            }
            this.searchText = this.client.client.name
            this.clientValidation = true
            this.showClientError = false

            //$('#refreshClient').removeClass('rotator')
            // $('#saveClientButton').button('reset')

          })
          $('#add-client').modal('hide')
          //this.data.invoice.unique_key_fk_client = this.client.client.unique_identifier
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      })
    }
  }

  greaterThan(prop, val) {
    return function (item) {
      return item[prop] > val
    }
  }

  assignClientId(client_id) {
    this.invoice.client_id = client_id
  }

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

  calculateSum() {

    var total = 0

    for (var i = 0; i < this.invoiceItems.length; i++) {
      var item = this.invoiceItems[i]
      total += parseFloat(item.total, 10)
    }
    this.data.invoice.total = total
  }

  goEdit(uniqueIdentity) {
    $('#editBtn').button('loading')
    $('#updateButton').button('loading')

    //$location.path('/invoice/edit/' + this.invoice.unique_identifier)
    $('#msgInv').removeClass("show")
    $('#msgInv').addClass("hide")
    $('#estMain').removeClass("show")
    $('#estMain').addClass("hide")
    $('#editEst').removeClass("hide")
    $('#editEst').addClass('show')
    this.filterClient = ''
    this.editTempInitializer(uniqueIdentity)
  }

  goNew() {
    this.filterClient = ''
    $('#msgInv').removeClass("hide")
    $('#msgInv').addClass("show")
    $('#estMain').removeClass("show")
    $('#estMain').addClass("hide")
    $('#editEst').removeClass("show")
    $('#editEst').addClass('hide')
    this.checked = false

    this.reloadCreateInvoice()
  }

  loadMore() {
    this.clientDisplayLimit += 10
  }

  printODownloadInvoice(invoiceId, type) {

    Data.get('invoice/get-pdf?invoiceId=' + invoiceId + '&type=' + type + '&timeZone=' + $rootScope.timeZone + '&accessToken=' + $rootScope.settings.dropbox_token, { responseType: 'arraybuffer' }).then(function (result) {
      //console.log(result)

      var a = window.document.createElement('a')

      a.href = window.URL.createObjectURL(new Blob([result], {
        type: 'application/pdf'
      }))

      // Append anchor to body.
      document.body.appendChild(a)
      a.download = this.getFileName(invoiceId)
      a.click()
    })

  }

  downloadInvoice(invoiceId, type, mode) {
    if (mode == "download") {
      $('#downloadBtn').button('loading')
    }
    else if (mode == "preview") {
      $('#previewBtn').button('loading')
    }

    var id = this.data.invoice.unique_identifier
    this.invoiceService.fetchPdf(id).subscribe((result: response) => {

      var file = new Blob([result], { type: 'application/pdf' })
      var fileURL = URL.createObjectURL(file)
      this.content = fileURL
      //console.log(this.content)
      var a = window.document.createElement('a')

      a.href = window.URL.createObjectURL(new Blob([result.data], {
        type: 'application/pdf'
      }))

      // Append anchor to body.
      document.body.appendChild(a)
      if (mode == "download") {
        a.download = this.getFileName(invoiceId)
        a.click()
        // $('#downloadBtn').button('reset')
      }
      else if (mode == "preview") {
        window.open(a)
        // $('#previewBtn').button('reset')
      }
    })

  }

  getFileName(invoiceId) {
    var day = (new Date()).getDate() <= 9 ? '0' + (new Date()).getDate() : (new Date()).getDate()
    var month = this.findMonth((new Date()).getMonth())
    var year = (new Date()).getFullYear()
    var time = getTime()

    function getTime() {
      var hour = (new Date()).getHours() < 13 ? (new Date()).getHours() : ((new Date()).getHours() - 12)
      hour = hour < 10 ? '0' + hour.toString() : hour.toString()
      var min = (new Date()).getMinutes() < 10 ? '0' + (new Date()).getMinutes() : (new Date()).getMinutes()
      return hour + min
    }

    //console.log(time)

    var ampm = (new Date()).getHours() < 12 ? 'AM' : 'PM'

    // eg: INVPDF_INV_21_02Dec2015_1151AM
    return 'ESTPDF_EST_' + this.data.invoice.invoice_number + '_' + day + month + year + '_' + time + ampm + '.pdf'
  }

  findMonth(expression) {
    switch (expression) {
      case 0:
        return "Jan"
        break
      case 1:
        return "Feb"
        break

      case 2:
        return "Mar"
        break
      case 3:
        return "Apr"
        break
      case 4:
        return "May"
        break
      case 5:
        return "Jun"
        break
      case 6:
        return "Jul"
        break
      case 7:
        return "Aug"
        break
      case 8:
        return "Sep"
        break
      case 9:
        return "Oct"
        break
      case 10:
        return "Nov"
        break
      case 11:
        return "Dec"
        break
    }
  }

  changeDueDate(selectDueDate) {
    var date = new Date()
    this.selectDueDate = selectDueDate
    switch (this.selectDueDate) {
      case 'no_due_date':
        this.customDate = true
        this.dueDate = ''
        this.data.add_invoice.due_date = ''
        this.data.add_invoice.due_date_flag = 0
      break

      case 'immediately':
        this.customDate = false
        date.setTime(parseInt(this.data.add_invoice.created_date))
        if (this.settings.date_format === 'dd-mm-yy') {
          this.dueDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()
          this.data.add_invoice.due_date = (new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0]))).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.dueDate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear()
          this.data.add_invoice.due_date = new Date(this.dueDate).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 1
      break

      case 'custom_date':
        this.customDate = false
        this.data.add_invoice.due_date_flag = 2
      break

      case '7_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 7)
        this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[1]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[2])).getTime().toString()
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 3
      break

      case '10_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 10);
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 4
      break

      case '15_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 15)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 5
      break

      case '30_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 30)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 6
      break

      case '45_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 45)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 7
      break

      case '60_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 60)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 8
      break

      case '90_days':
        this.customDate = false
        this.dueDate = this.addDays(this.data.add_invoice.created_date, 90)
        if (this.settings.date_format === 'dd-mm-yy') {
          this.data.add_invoice.due_date = new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[1]) - 1, parseInt(this.dueDate.split('-')[0])).getTime().toString()
        } else if (this.settings.date_format = 'mm-dd-yy') {
          this.data.add_invoice.due_date = new Date(new Date(parseInt(this.dueDate.split('-')[2]), parseInt(this.dueDate.split('-')[0]) - 1, parseInt(this.dueDate.split('-')[1]))).getTime().toString()
        }
        this.data.add_invoice.due_date_flag = 9
      break

      default:
        this.customDate = true
        this.dueDate = ''
        this.data.add_invoice.due_date = ''
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

  editTempInitializer(uniqueIdentity) {
    this.uniqueIdentityTemp = uniqueIdentity
    this.show_tax_input_list_edit = []
    this.tempflagTaxListEdit = []
    this.terms_edit = []

    this.tempItemList = []
    this.tempTermList = []

    this.selected_product_id_edit = []
    this.temp_payment_edit = {}

    this.loaded = false
    $rootScope.pro_bar_load = false
    var settings = $rootScope.authenticated.setting
    if (settings.dateDDMMYY === false) {
      $rootScope.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      $rootScope.settings.date_format = 'dd-mm-yy'
    }
    this.editdata.invoice.taxList = []
    this.show_tax_input_list = []
    this.tempflagTaxList = []
    this.editdata.invoice.termsAndConditions = []
    //this.clientsLocal = []
    this.selectedInvoice = findObjectIndex($rootScope.invoices, 'unique_identifier', this.routeParams.invoiceId)
    // DataStore.initializer([])
    // DataStore.productsList.length == 0
    if (1) {
      this.productService.fetch().subscribe((response: response) => {
        if (response.records != null) {
          this.productList = response.records.filter(pro => pro.enabled == 0)
        }
      })
    } else {
      // this.productList = DataStore.productsList
    }
    this.invoiceService.fetchById([uniqueIdentity]).subscribe((result: response) => {
      if (result.status == 200) {
        this.editdata.invoice = result.records[0]
        this.clientService.fetchById({
          "idList": [this.editdata.invoice.unique_key_fk_client]
        }).subscribe((response: response) => {
          this.clientsLocal = response.records

          $('#editBtn').button('reset')
          $('#updateButton').button('reset')
          this.loaded = true
          $rootScope.pro_bar_load = true
        })

        if (this.editdata.invoice.taxList) {
          if (this.editdata.invoice.taxList.length > 0) {
            this.showMultipleTaxEdit = true
            for (var i = this.editdata.invoice.taxList.length; i > 0; i--) {
              this.show_tax_input_list[i - 1] = true
              if (!(this.editdata.invoice.taxList[i - 1].percentage > 0))
                this.editdata.invoice.taxList.splice(i - 1, 1)
            }
          } else {
            this.showMultipleTaxEdit = false
          }
        } else if ($rootScope.settings.alstTaxName) {
          this.temp_tax_flag_edit = true
          if ($rootScope.settings.alstTaxName.length > 0) {
            this.showMultipleTaxEdit = true
          } else {
            this.showMultipleTaxEdit = false
          }
        } else {
          this.temp_tax_flag_edit = true
          this.showMultipleTaxEdit = false
        }
        /**
         * interchanging keys
         * */
        this.temInvoice = {
          'unique_key_fk_client': this.editdata.invoice.unique_key_fk_client,
          'unique_identifier': this.editdata.invoice.unique_identifier,
          'serverUpdateTime': this.editdata.invoice.serverUpdateTime,
          '_id': this.editdata.invoice.localId,
          'local_client_id': this.editdata.invoice.localClientId,
          'invoice_number': this.editdata.invoice.quetationNo,
          'amount': this.editdata.invoice.amount,
          'discount': this.editdata.invoice.discount,
          'organization_id': this.editdata.invoice.organizationId,
          'created_date': this.editdata.invoice.createDate,
          'deleted_flag': this.editdata.invoice.enabled,
          'epoch': this.editdata.invoice.epochTime,
          'shipping_address': this.editdata.invoice.shippingAddress,
          'percentage_flag': this.editdata.invoice.discountFlag,
          'percentage_value': this.editdata.invoice.percentageValue,
          'adjustment': this.editdata.invoice.adjustment,
          'shipping_charges': this.editdata.invoice.shippingCharges,
          'gross_amount': this.editdata.invoice.grossAmount,
          'discount_on_item': this.editdata.invoice.assignDiscountFlag,
          'tax_on_item': this.editdata.invoice.assignTaxFlag,
          'tax_rate': this.editdata.invoice.taxrate,
          'tax_amount': this.editdata.invoice.taxAmt,
          'device_modified_on': this.editdata.invoice.deviceCreatedDate,
          'client_id': this.editdata.invoice.serverClientId,
          'push_flag': this.editdata.invoice.pushFlag,
          'deletedItems': this.editdata.invoice.deleteQuoProductIds,
          'deletedTerms': this.editdata.invoice.deleteQuoTermsIds,
          'listItems': this.editdata.invoice.alstQuotProduct,
          'termsAndConditions': this.editdata.invoice.alstQuotTermsCondition
        }

        for (var j = 0; j < this.editdata.invoice.alstQuotProduct.length; j++) {
          var temp = {
            'unique_identifier': this.editdata.invoice.alstQuotProduct[j].uniqueKeyQuotationProduct,
            'product_name': this.editdata.invoice.alstQuotProduct[j].productName,
            'description': this.editdata.invoice.alstQuotProduct[j].description == null ? '' : this.editdata.invoice.alstQuotProduct[j].description,
            'quantity': this.editdata.invoice.alstQuotProduct[j].qty,
            /*'inventory_enabled':this.productList[index].inventoryEnabled,*/
            'unit': this.editdata.invoice.alstQuotProduct[j].unit,
            'rate': this.editdata.invoice.alstQuotProduct[j].rate,
            'discount': this.editdata.invoice.alstQuotProduct[j].discountRate,
            'tax_rate': this.editdata.invoice.alstQuotProduct[j].taxRate,
            'total': this.editdata.invoice.alstQuotProduct[j].price,
            'discount_amount': this.editdata.invoice.alstQuotProduct[j].discountAmt,
            'tax_amount': this.editdata.invoice.alstQuotProduct[j].taxAmount,
            'unique_key_fk_product': this.editdata.invoice.alstQuotProduct[j].uniqueKeyFKProduct,
            'unique_key_fk_quotation': this.editdata.invoice.unique_identifier

          }
          this.tempItemList.push(temp)

        }
        if (!isNaN(this.editdata.invoice.alstQuotTermsCondition && !this.editdata.invoice.alstQuotTermsCondition == null
          && this.editdata.invoice.alstQuotTermsCondition.isEmpty())) {
          for (var i = 0; i < this.editdata.invoice.alstQuotTermsCondition.length; i++) {
            var temp = {
              "terms_condition": this.editdata.invoice.alstQuotTermsCondition[i].termsConditionText,
              "_id": this.editdata.invoice.alstQuotTermsCondition[i].localId,
              "local_quotation_id": this.editdata.invoice.alstQuotTermsCondition[i].localQuotationId,
              "invoice_id": this.editdata.invoice.alstQuotTermsCondition[i].serverQuotationId,
              "organization_id": this.editdata.invoice.alstQuotTermsCondition[i].orgId,
              "unique_identifier": this.editdata.invoice.alstQuotTermsCondition[i].uniqueKeyQuotTerms,
              "unique_key_fk_quotation": this.editdata.invoice.alstQuotTermsCondition[i].uniqueKeyFKQuotation

            }
            this.tempTermList.push(temp)

            // this.deleteTerm = result[i]
            // this.index = i
            // console.log(result[i], i)
          }
        }
        if (this.editdata.invoice.taxList)
          this.temInvoice.taxList = this.editdata.invoice.taxList

        this.deleteInvoiceData = Object.assign({}, this.temInvoice)
        this.deleteInvoiceData.listItems = this.tempItemList
        this.deleteInvoiceData.termsAndConditions = this.tempTermList
        delete this.deleteInvoiceData.orgName

        this.editdata.invoice = this.temInvoice
        this.existingItem = this.tempItemList
        this.editdata.invoice.listItems = []

        this.editdata.invoice.termsAndConditions = this.tempTermList
        // DataStore.termsList.length == 0
        if (1) {
          this.termConditionService.fetch().subscribe((response: response) => {
            this.terms_edit = response.termsAndConditionList
            this.termListEdit = []
            for (var i = 0; i < this.terms_edit.length; i++) {
              for (var j = 0; j < this.editdata.invoice.termsAndConditions.length; j++) {
                if (this.terms_edit[i].terms == this.editdata.invoice.termsAndConditions[j].terms_condition && this.terms_edit[i].enabled == 0) {
                  this.terms_edit[i].setDefault = 'DEFAULT'
                  break
                } else {
                  this.terms_edit[i].setDefault = ''
                }
              }
              if (this.editdata.invoice.termsAndConditions.length == 0) {
                this.terms_edit[i].setDefault = ''
              }
              if (this.terms_edit[i].setDefault == 'DEFAULT') {
                var temp = {
                  "_id": this.terms_edit[i].serverTermCondId,
                  "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
                  "organization_id": this.terms_edit[i].orgId,
                  "terms_condition": this.terms_edit[i].terms
                }
                this.termListEdit.push(temp)
              }
            }
          })
        } else {
          // this.terms_edit = JSON.parse(JSON.stringify(DataStore.termsList))
          this.termListEdit = []
          for (var i = 0; i < this.terms_edit.length; i++) {
            for (var j = 0; j < this.editdata.invoice.termsAndConditions.length; j++) {
              if (this.terms_edit[i].terms == this.editdata.invoice.termsAndConditions[j].terms_condition && this.terms_edit[i].enabled == 0) {
                this.terms_edit[i].setDefault = 'DEFAULT'
                break
              } else {
                this.terms_edit[i].setDefault = ''
              }
            }
            if (this.editdata.invoice.termsAndConditions.length == 0) {
              this.terms_edit[i].setDefault = ''
            }
            if (this.terms_edit[i].setDefault == 'DEFAULT') {
              var temp = {
                "_id": this.terms_edit[i].serverTermCondId,
                "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
                "organization_id": this.terms_edit[i].orgId,
                "terms_condition": this.terms_edit[i].terms
              }
              this.termListEdit.push(temp)
            }
          }
        }

        this.invoiceDateEdit = $filter('date')(this.editdata.invoice.created_date)

        if ($rootScope.settings.date_format === 'dd-mm-yy') {
          this.editdata.invoice.created_date = (new Date(this.invoiceDateEdit.split('-')[2], parseInt(this.invoiceDateEdit.split('-')[1]) - 1, this.invoiceDateEdit.split('-')[0])).getTime()
        } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
          this.editdata.invoice.created_date = (new Date(this.invoiceDateEdit.split('-')[2], parseInt(this.invoiceDateEdit.split('-')[0]) - 1, this.invoiceDateEdit.split('-')[1])).getTime()
        }

        if (result) {
          this.invoicenumber = this.editdata.invoice.invoice_number
          //this.invoicedate = $filter('date')(result.created_date, 'yyyy-mm-dd')
          //this.duedate = $filter('date')(result.due_date, 'yyyy-mm-dd')
        }

        if (this.editdata.invoice.discount_on_item == 1) {
          this.discount_on_edit = 'onItem'
          this.discounttext = "discount (on item)"
        } else if (this.editdata.invoice.discount_on_item == 0 && (this.editdata.invoice.percentage_value > 0 || this.editdata.invoice.discount > 0)) {
          this.discount_on_edit = 'onBill'
          this.discounttext = "discount (on bill)"
          this.show_discount_edit = true
        } else {
          this.discount_on_edit = 'disabled'
          this.discounttext = "discount (on disabled)"
          this.show_discount_edit = false
        }


        if (this.editdata.invoice.tax_on_item == 0) {
          this.tax_on_edit = 'taxOnItem'
          this.taxtext = "tax (on item)"

        } else if (this.editdata.invoice.tax_on_item == 1 && this.editdata.invoice.tax_rate > 0) {
          this.tax_on_edit = 'taxOnBill'
          this.taxtext = "tax (on bill)"
          this.show_tax_input_edit = true
        } else {
          this.tax_on_edit = 'taxDisabled'
          this.taxtext = "tax (on disabled)"
          this.show_tax_input_edit = false
        }
        //console.log("in services client :" + JSON.stringify(this.clientsLocal))
      }

      if (this.editdata.invoice.shipping_charges && this.editdata.invoice.shipping_charges > 0)
        this.show_shipping_charge_edit = true

      if (this.editdata.invoice.percentage_flag && this.editdata.invoice.percentage_flag == 1)
        this.isRateEdit = true
      else
        this.isRateEdit = false
    })
    // DataStore.invoicesList.length == 0
    if (1) {
      this.invoiceService.fetch().subscribe((result: response) => {
        this.invoices = result.records.filter(est => est.enabled == 0)

        this.clientService.fetch().subscribe((response: response) => {
          this.clientList = response.records
          for (var i = 0; i < this.invoices.length; i++) {
            for (var j = 0; j < this.clientList.length; j++) {
              if (this.invoices[i].unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
                this.invoices[i].orgName = this.clientList[j].name
              }
            }
          }
        })
      })
    } else {
      // this.invoices = DataStore.invoicesList
    }
  }

  removeItemEdit(index) {
    var itemId = this.editdata.invoice.listItems[index].unique_key_fk_product
    this.selected_product_id_edit.splice(index, 1)
    this.editdata.invoice.listItems.splice(index, 1)
    // $('#prod' + highlightedIndex).removeClass('selected')
    this.calculateInvoiceEdit(1)

    //}
  }

  calculateInvoiceEdit(indexTaxMultiple) {

    var total = 0

    for (var i = 0; i < this.editdata.invoice.listItems.length; i++) {
      if (this.editdata.invoice.listItems[i].deleted_flag != 1) {
        var item = this.editdata.invoice.listItems[i]
        total += parseFloat(item.total)
      }
    }
    for (var i = 0; i < this.existingItem.length; i++) {

      if (this.existingItem.deleted_flag != 1) {
        var item = this.existingItem[i]
        total += parseFloat(item.total)
      }
    }
    this.editdata.invoice.gross_amount = total

    var grossAmount = total
    var discountTotal = 0
    var finalAmount = 0
    var shippingCharges = 0
    var totalAmount = 0
    var discoutAmount = 0
    var tax_rate = 0

    if (this.editdata.invoice.percentage_flag == 1) {
      var discountPercent = parseFloat(this.editdata.invoice.percentage_value) / 100
      if (isNaN(discountPercent)) {
        discountPercent = 0
      }
      discoutAmount = discountPercent * grossAmount

      this.editdata.invoice.discount = discoutAmount
      discountTotal = grossAmount - discoutAmount


    } else if (this.editdata.invoice.percentage_flag == 0) {
      var invoiceDiscount = parseFloat(this.editdata.invoice.discount)

      if (isNaN(invoiceDiscount)) {
        invoiceDiscount = 0
      }
      discountTotal = grossAmount - invoiceDiscount

      var discountAmount = (parseFloat(this.editdata.invoice.discount) / grossAmount) * 100
      if (isNaN(discountAmount)) {
        discountAmount = 0
      }
      this.editdata.invoice.percentage_value = discountAmount

    }

    if (this.tax_on == 'taxOnBill') {
      tax_rate = (parseFloat(this.editdata.invoice.tax_rate) * discountTotal) / 100
      if (isNaN(tax_rate)) {
        tax_rate = 0
      }
      // console.log("tax_ rate bill", tax_rate)
    }
    if (indexTaxMultiple) {
      //console.log("indexmultiple in",indexTaxMultiple,this.data.invoice.taxList)
      var temp_tax_rate = 0
      if (this.editdata.invoice.taxList) {
        for (var i = 0; i < this.editdata.invoice.taxList.length; i++) {
          if (this.editdata.invoice.taxList[i]) {
            if (isNaN(parseFloat(this.editdata.invoice.taxList[i].percentage)))
              this.editdata.invoice.taxList[i].percentage = 0
            //console.log("090" + parseFloat(this.data.invoice.taxList[i].percentage))
            this.editdata.invoice.taxList[i].calculateValue = (parseFloat(this.editdata.invoice.taxList[i].percentage) * discountTotal) / 100
            this.editdata.invoice.taxList[i].selected = true
            temp_tax_rate = temp_tax_rate + (parseFloat(this.editdata.invoice.taxList[i].percentage) * discountTotal) / 100
          }
        }
        tax_rate = tax_rate + temp_tax_rate
      }
    }

    shippingCharges = parseFloat(this.editdata.invoice.shipping_charges)
    if (isNaN(shippingCharges)) {
      shippingCharges = 0
    }
    totalAmount = discountTotal + shippingCharges + tax_rate

    var adjustmentAmount = parseFloat(this.editdata.invoice.adjustment)
    if (isNaN(adjustmentAmount)) {
      adjustmentAmount = 0
    }
    finalAmount = totalAmount - adjustmentAmount

    if (isNaN(finalAmount)) {
      finalAmount = 0
    }
    this.editdata.invoice.amount = finalAmount

  }

  deleteExistingItemEdit(index) {
    this.existingItem.splice(index, 1)
    this.calculateInvoiceEdit(1)
  }

  addLineItemEdit() {
    this.editdata.invoice.listItems.push({
      'quantity': parseInt(1),
      'rate': parseFloat(0.00),
      'total': parseFloat(0.00),
      'tax_rate': 0,
      'discount': 0
    })
  }

  showMeEdit() {
    this.show_discount_edit = true
    this.tempflagEdit = true
  }

  hideMeEdit() {
    this.editdata.invoice.discount = 0
    this.editdata.invoice.percentage_value = 0
    this.calculateInvoiceEdit(1)
    this.show_discount_edit = false
    this.tempflagEdit = false
  }

  showMeTaxEdit() {
    this.show_tax_input_edit = true
    this.tempflagTaxEdit = true
  }

  showMeMultipleTaxEdit(index) {
    //console.log("showmultiple",this.data.invoice.taxList,$rootScope.authenticated.setting.alstTaxName,index)
    if (!this.editdata.invoice.taxList) {
      this.editdata.invoice.taxList = []
    }
    var indexTax = this.editdata.invoice.taxList.length
    this.editdata.invoice.taxList[indexTax] = {}
    this.editdata.invoice.taxList[indexTax].taxName = $rootScope.authenticated.setting.alstTaxName[index].taxName
    this.show_tax_input_list_edit[indexTax] = true
    this.tempflagTaxListEdit[indexTax] = true
    this.editdata.invoice.taxList[indexTax].selected = true
    //console.log("showmultiple",this.data.invoice.taxList[indexTax],indexTax)
  }

  hideMeTaxEdit() {
    this.editdata.invoice.tax_rate = 0
    this.calculateInvoiceEdit()
    this.show_tax_input_edit = false
    this.tempflagTaxEdit = false
  }

  hideMeTaxMultipleEdit(index) {
    this.editdata.invoice.tax_rate = 0
    this.editdata.invoice.taxList.splice(index, 1)
    this.calculateInvoiceEdit(1)
    this.show_tax_input_list_edit[index] = false
    this.tempflagTaxListEdit[index] = false
    //console.log("taxList4",this.data.invoice.taxList)
  }

  showMeShippingEdit() {
    this.show_shipping_charge_edit = true
    this.tempflagShippingEdit = true
  }

  hideMeShippingEdit() {
    this.editdata.invoice.shipping_charges = 0
    this.calculateInvoiceEdit(1)
    this.show_shipping_charge_edit = false
    this.tempflagShippingEdit = false
  }

  showMeAdjustmentEdit() {
    this.show_adjustment_edit = true
    this.tempAdjustmentEdit = false
  }

  hideMeAdjustmentEdit() {
    this.editdata.invoice.adjustment = 0
    this.tempAdjustmentEdit = true
    this.calculateInvoiceEdit(1)

    this.show_adjustment_edit = false
  }

  addItemEdit(indexTemp, item, selected_product_id) {
    console.log("Add item edit", indexTemp, item, selected_product_id)
    var index = findObjectIndex(this.productList, 'prodName', selected_product_id)

    if (index !== -1) {

      item.unique_key_fk_product = this.productList[index].uniqueKeyProduct
      item.unique_identifier = utility.generateUUID()
      item.product_name = this.productList[index].prodName
      item.description = this.productList[index].discription == null ? '' : this.productList[index].discription
      item.quantity = 1
      item.unit = this.productList[index].unit
      item.rate = this.productList[index].rate
      //item.discount = this.productList[index].discount
      //item.tax_rate = this.productList[index].taxRate
      item.tax_rate = 0.00

    } else if (selected_product_id !== '' && typeof selected_product_id !== 'undefined') {
      var tempProAddFlag = false
      var tempSelectedProduct = angular.lowercase(selected_product_id)
      var tempProName = ''
      var tempMatchPro = {}
      for (var k = 0; k < this.productList.length; k++) {
        tempProName = angular.lowercase(this.productList[k].prodName)
        if (tempSelectedProduct == tempProName) {
          tempProAddFlag = true
          tempMatchPro = this.productList[k]
        }
      }
      if (!tempProAddFlag) {
        item.unique_key_fk_product = utility.generateUUID()
        item.unique_identifier = utility.generateUUID()
        item.product_name = selected_product_id
        item.description = ""
        item.quantity = 1
        item.unit = ""
        item.rate = 0.00
        item.discount = 0.00
        item.tax_rate = 0.00
        /**
         * Adding Product to Product List
         * */

        var d = new Date()
        var temp1 = {
          'prod_name': item.product_name,
          'rate': parseFloat(item.rate),
          'tax_rate': item.tax_rate,
          //'description' : item.description,
          'device_modified_on': d.getTime(),
          'organization_id': $rootScope.authenticated.user.orgId,
          'unique_identifier': item.unique_key_fk_product

        }
        this.addProductList.push(temp1)
        //console.log("count1",item,temp1,this.addProductList,selected_product_id)
      } else {
        item.unique_key_fk_product = tempMatchPro.uniqueKeyProduct
        item.unique_identifier = utility.generateUUID()
        item.product_name = tempMatchPro.prodName
        item.description = tempMatchPro.discription
        item.quantity = 1
        item.unit = tempMatchPro.unit
        item.rate = tempMatchPro.rate
        //item.discount = this.productList[index].discount
        //item.tax_rate = this.productList[index].taxRate
        item.tax_rate = 0.00
        //console.log("count12",this.productList)
      }
    } else {
      item.description = ""
      item.quantity = 1
      item.unit = ""
      item.rate = 0.00
      item.discount = 0.00
      item.tax_rate = 0.00
    }
    this.calculateTotalEdit(this.editdata.invoice.listItems.indexOf(item))

    this.calculateInvoiceEdit()
  }

  calculateTotalEdit(index) {

    if (this.editdata.invoice.listItems.length > 0 && typeof this.editdata.invoice.listItems[index].quantity !== "undefined") {

      var rateParse = parseFloat(this.editdata.invoice.listItems[index].rate)
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      var productRate = (this.editdata.invoice.listItems[index].quantity * rateParse)

      if (this.tax_on_edit == 'taxOnItem') {
        var taxedAmt = ((this.editdata.invoice.listItems[index].rate * this.editdata.invoice.listItems[index].quantity) * this.editdata.invoice.listItems[index].tax_rate) / 100
        if (isNaN(taxedAmt)) {
          taxedAmt = 0
        }
        this.editdata.invoice.listItems[index].tax_amount = taxedAmt
        productRate = productRate + taxedAmt
      }

      if (this.discount_on_edit == 'onItem') {

        var discountItem = (productRate * parseFloat(this.editdata.invoice.listItems[index].discount)) / 100
        if (isNaN(discountItem)) {
          discountItem = 0
        }
        this.editdata.invoice.listItems[index].discount_amount = discountItem
        productRate = productRate - discountItem
      }

      this.editdata.invoice.listItems[index].total = productRate

      this.calculateInvoiceEdit()
    }
  }

  setTermsListEdit(term) {
    this.termListEdit = []

    var index23 = findObjectIndex(this.terms.filter(function (pro) {
      return (pro.enabled == 0)
    }), 'uniqueKeyTerms', term.uniqueKeyTerms)

    if (term.setDefault == 'DEFAULT') {
      term.setDefault = ''
      this.editdata.terms[index23] = false
    } else {
      term.setDefault = 'DEFAULT'
      this.editdata.terms[index23] = true
    }
    if (this.terms_edit !== null && typeof this.terms_edit !== 'undefined') {

      for (var i = 0; i < this.terms_edit.length; i++) {

        if (this.terms_edit[i].setDefault == 'DEFAULT') {
          var temp = {
            "_id": this.terms_edit[i].serverTermCondId,
            "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
            "organization_id": this.terms_edit[i].orgId,
            "terms_condition": this.terms_edit[i].terms
            //"unique_key_fk_invoice" :
          }
          this.termListEdit.push(temp)
        }
      }
    }
  }

  addTermEdit() {
    $('#add-terms-edit').modal('show')
    // this.terms = DataStore.termsList
  }

  closeEdit() {
    $('#add-product, #add-terms-edit,#addPaymentEdit,#addPaymentAddInvoice').modal('hide')
  }

  saveEdit(data, status) {
    $('#updateButton').button('loading')
    this.editdata.invoice.termsAndConditions = this.termListEdit
    var createdTime = new Date()
    createdTime.setTime(this.editdata.invoice.created_date)
    this.editdata.invoice.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

    var baseURL = Data.getBaseUrl()
    var update_status = 0

    var date = new Date()
    var currentTime = date.getTime()
    data.invoice.device_modified_on = currentTime

    for (var i = this.editdata.invoice.listItems.length; i > 0; i--) {
      this.editdata.invoice.listItems[i - 1].unique_key_fk_quotation = this.editdata.invoice.unique_identifier
      if (!this.editdata.invoice.listItems[i - 1].product_name || this.editdata.invoice.listItems[i - 1].product_name == '') {
        this.editdata.invoice.listItems.splice(i - 1, 1)
      }
    }
    var tempNewItem = angular.copy(this.editdata.invoice.listItems)
    if (this.existingItem) {
      this.editdata.invoice.listItems = []
      for (var u = 0; u < this.existingItem.length; u++) {
        this.editdata.invoice.listItems.push(this.existingItem[u])
      }
      for (var m = 0; m < tempNewItem.length; m++) {
        this.editdata.invoice.listItems.push(tempNewItem[m])
      }
    }

    if (this.addProductList.length > 0)
      this.saveProduct(this.addProductList)


    if (status) {

      this.invoiceService.add([data.invoice]).subscribe((result: response) => {
        if (result.status !== 200) {

        } else if (result.status === 200) {

          update_status++
          // notifications.showSuccess({ message: result.data.message, hideDelay: 1500, hide: true })

          // var tempInv = DataStore.invoicesList
          var indexInv = findObjectIndex(tempInv, "unique_identifier", result.data.quotationList[0].unique_identifier)
          var tempCh = changeInvoice(result.data.quotationList[0])

          // this.clientList = DataStore.clientsList
          for (var j = 0; j < this.clientList.length; j++) {
            if (tempCh.unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
              tempCh.orgName = this.clientList[j].name
            }
          }
          tempInv.splice(indexInv, 1, tempCh)
          // DataStore.addInvoicesList(tempInv)

          this.getInvoice(result.data.quotationList[0].unique_identifier, 1)
          $rootScope.pro_bar_load = true
        }
        $('#updateButton').button('reset')
      })
    }
    else {
      $('#updateButton').button('reset')
      //alert("Form not valid")
    }
  }

  deleteInvoice(invoiceId) {
    SweetAlert.swal({
      title: "Are you sure want to delete" + this.invoiceNumber + "?", //Bold text
      type: "warning", //type -- adds appropiriate icon
      showCancelButton: true, // displays cancel btton
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: true, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
      closeOnCancel: true
    },
      function (isConfirm) { //Function that triggers on user action.
        if (isConfirm) {
          $('#deleteBtn').button('loading')
          this.deleteInvoiceData.deleted_flag = 1
          var createdTime = new Date()
          createdTime.setTime(this.deleteInvoiceData.created_date)
          this.deleteInvoiceData.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

          var baseURL = Data.getBaseUrl()


          var date = new Date()
          var currentTime = date.getTime()
          this.deleteInvoiceData.device_modified_on = currentTime

          this.invoiceService.add([this.deleteInvoiceData]).subscribe((result: response) => {
            if (result.status !== 200) {

            } else if (result.status === 200) {
              // var tempEst = DataStore.invoicesList
              var indexEst = findObjectIndex(tempEst, "unique_identifier", result.data.quotationList[0].unique_identifier)
              tempEst.splice(indexEst, 1)
              // DataStore.addInvoicesList(tempEst)
              this.goNew()

              //notifications.showSuccess({message: result.data.message, hideDelay: 1500,hide: true})
              //this.data.terms = []
              //$location.path('/invoice/view/0')

            }
            $('#deleteBtn').button('reset')
          })

        } else {
          SweetAlert.swal("Your file is safe!")
        }
      })
  }

  reloadCreateInvoice() {
    this.data.add_invoice = {}
    this.routeParams.invId = ''
    this.data.add_invoice.listItems = []
    this.data.add_invoice.listItems.push({
      'quantity': parseInt(1),
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': parseFloat(0.00),
      'total': parseFloat(0.00)
    })
    this.client = {}
    this.client.client = {}
    this.addProductList = []
    this.customDate = true
    this.isRate = true
    this.dueDate = ""

    var d = new Date()
    this.searchText = ''
    var settings = $rootScope.authenticated.setting
    this.data.add_invoice.taxList = []
    this.data.add_invoice.percentage_flag = 1
    this.tempflag = false
    this.tempflagShipping = false
    this.tempflagTax = false
    this.show_adjustment = false
    this.tempflag = false

    this.show = false
    this.tempflag = false

    this.show_tax_input = false
    this.tempflagTax = false

    this.show_shipping_charge = false
    this.tempflagShipping = false
    this.show_adjustment = false
    this.data.terms = []

    if (settings.alstTaxName) {
      if (settings.alstTaxName.length > 0) {
        this.showMultipleTax = true
      } else {
        this.showMultipleTax = false
      }
    }
    this.multi_tax_index = []
    if ($rootScope.tempQuaNoOnAdd) {
      if (typeof settings.quotFormat !== 'undefined')
        this.data.add_invoice.invoice_number = settings.quotFormat + $rootScope.tempQuaNoOnAdd
      else
        this.data.add_invoice.invoice_number = $rootScope.tempQuaNoOnAdd
    } else {
      if (!isNaN(settings.invNo)) {
        this.tempEstNo = parseInt(settings.quotNo) + 1
        $rootScope.tempQuaNoOnAdd = this.tempEstNo
      } else {
        this.tempEstNo = 1
        $rootScope.tempInvNoOnAdd = this.tempEstNo
      }
      if (settings.quotFormat) {
        this.data.add_invoice.invoice_number = settings.quotFormat + this.tempEstNo
      } else {
        this.data.add_invoice.invoice_number = "Est_" + this.tempEstNo
      }
    }
    // this.productList = DataStore.productsList
    // this.terms = DataStore.termsList


    this.termList = []
    if (this.terms !== null && typeof this.terms !== 'undefined') {
      for (var i = 0; i < this.terms.length; i++) {
        if (this.terms[i].setDefault == 'DEFAULT' && this.terms[i].enabled == 0) {
          var temp = {
            "_id": this.terms[i].serverTermCondId,
            "unique_identifier": this.terms[i].uniqueKeyTerms,
            "organization_id": this.terms[i].orgId,
            "terms_condition": this.terms[i].terms
          }
          this.termList.push(temp)

          var index29 = findObjectIndex(this.terms.filter(function (pro) {
            return (pro.enabled == 0)
          }), 'uniqueKeyTerms', this.terms[i].uniqueKeyTerms)
          this.data.terms[index29] = true
        }
      }
    }
    var date = new Date()
    if (settings.dateDDMMYY === false) {
      $rootScope.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      $rootScope.settings.date_format = 'dd-mm-yy'
    } else {
      $rootScope.settings.date_format = 'dd-mm-yy'
    }

    if ($rootScope.settings.date_format === 'dd-mm-yy') {
      this.invoiceDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()
      this.data.add_invoice.created_date = (new Date(this.invoiceDate.split('-')[2], parseInt(this.invoiceDate.split('-')[1]) - 1, this.invoiceDate.split('-')[0])).getTime()
    } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
      this.invoiceDate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear()
      this.data.add_invoice.created_date = (new Date(this.invoiceDate.split('-')[2], parseInt(this.invoiceDate.split('-')[0]) - 1, this.invoiceDate.split('-')[1])).getTime()
    }
    if (settings) {

      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        this.data.add_invoice.tax_on_item = 1
        //console.log("setting 1")

      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        this.data.add_invoice.tax_on_item = 2
        //console.log("setting 2")

      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        this.data.add_invoice.tax_on_item = 2
        //console.log("setting 3")
        $('a.taxbtn').addClass('disabledBtn')

      }
      if (settings.discount_on_item == 0) {

        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        this.data.add_invoice.discount_on_item = 0
        //console.log("setting 1,1")
      } else if (settings.discount_on_item == 1) {
        //console.log("setting 1,2")
        this.data.add_invoice.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        //console.log("setting 1,3")
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        this.data.add_invoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.data.add_invoice.tax_on_item = parseInt(2)
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.data.add_invoice.discount_on_item = parseInt(2)
      $('a.discountbtn').addClass('disabledBtn')
    }
  }

  cancel() {
    this.getInvoice(this.uniqueIdentityTemp, 1)
  }

  watchEdit() {
    var invoiceDateArray = ''
    if (this.invoiceDateEdit.indexOf('.') > -1)
      invoiceDateArray = this.invoiceDateEdit.split('.')
    else
      invoiceDateArray = this.invoiceDateEdit.split('-')

    if ($rootScope.settings.date_format === 'dd-mm-yy') {
      this.editdata.invoice.created_date = (new Date(invoiceDateArray[2], parseInt(invoiceDateArray[1]) - 1, invoiceDateArray[0])).getTime()

    } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
      this.editdata.invoice.created_date = (new Date(invoiceDateArray[2], parseInt(invoiceDateArray[0]) - 1, invoiceDateArray[1])).getTime()
    }
  }

  multiTaxButtonEdit(taxname, index) {
    var status = true
    if (this.editdata.invoice.taxList)
      for (var k = 0; k < this.editdata.invoice.taxList.length; k++) {
        //console.log("multiTaxButton",this.data.invoice.taxList,$rootScope.authenticated.setting.alstTaxName)
        if (this.editdata.invoice.taxList[k].taxName !== taxname) {
          status = true
        } else {
          status = false
          break
        }
      }
    else
      status = true

    return status
  }

  setTermsListDelete(index) {
    this.termList.splice(index, 1)
    this.data.terms[index] = false
  }
}
