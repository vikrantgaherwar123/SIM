import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { response, client, invoice, terms, setting, product } from '../../../interface'
import { generateUUID } from '../../../globalFunctions'

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
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  private emptyInvoice = {
    adjustment: null,
    amount: 0.00,
    balance: 0.00,
    client_id: 0,
    created_date: '',
    deletedItems: [],
    deletedPayments: [],
    deletedTerms: [],
    deleted_flag: 0,
    device_modified_on: 0,
    discount: null,
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
    shipping_charges: null,
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

  // private invoiceList: Observable<invoice[]>
  private activeInvoice: invoice = {...this.emptyInvoice}
  private tempQuaNoOnAdd: number
  private invoiceDate
  private dueDate = new FormControl()
  private tempInvNo: number
  private showMultipleTax: boolean
  private show_tax_input_list: any
  private tempflagTaxList: any
  private taxtext: string

  private clientList: client[]
  private activeClient: any = {}
  private clientListLoading: boolean
  billingTo = new FormControl()
  filteredClients: Observable<string[] | client[]>
  private addClientModal: any = {}

  private productList: product[]
  activeItem: any = {
    quantity: 1,
    rate: 0.00,
    total: 0.00
  }
  addItem = new FormControl()
  filteredProducts: Observable<string[] | product[]>

  private termList: Observable<terms[]>
  private addTermModal: any = {}

  private addPaymentModal: any = {}

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

  private settings: any
  private authenticated: {
    setting: any
  }

  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }

  constructor(private router: Router,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private cookie: CookieService,
    private settingService: SettingService,
    private productService: ProductService,
    private store: Store<AppState>
  ) {
    this.user = JSON.parse(this.cookie.get('user'))
    this.authenticated = { setting: this.user.setting }
    store.select('client').subscribe(clients => this.clientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    // this.invoiceList = store.select('invoice')
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

    if (settings.dateDDMMYY === false) {
      this.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      this.settings.date_format = 'dd-mm-yy'
    }
    var date = new Date()
    this.invoiceDate = new FormControl(date)
    this.activeInvoice.created_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
    this.invoiceDate.valueChanges.subscribe(value => {
      this.activeInvoice.created_date = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2)
    })
    this.dueDate.valueChanges.subscribe(value => {
      if(value !== null) {
        this.activeInvoice.due_date = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2)
      } else {
        this.activeInvoice.due_date = ''
      }
    })
    var self = this

    // Fetch Products if not in store
    if(this.productList.length < 1) {
      this.productService.fetch().subscribe((response: response) => {
        // console.log(response)
        if (response.records != null) {
          self.store.dispatch(new productActions.add(response.records.filter((prod: any) => (prod.enabled == 0 && prod.prodName !== undefined))))
          this.setProductFilter()
        } else {
          this.setProductFilter()
        }
      })
    } else {
      this.setProductFilter()
    }

    // Fetch Clients if not in store
    if(this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        if (response.records !== null) {
          this.store.dispatch(new clientActions.add(response.records.filter(recs => recs.enabled == 0)))
          this.setClientFilter()
        } else {
          this.setClientFilter()
        }
        this.clientListLoading = false
      })
    } else {
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    this.termList.subscribe(terms => {
      if(terms.length < 1) {
        this.termConditionService.fetch().subscribe((response: response) => {
          // console.log(response)
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
    // this.invoiceList.subscribe(invoices => {
    //   if(invoices.length < 1) {
    //     this.invoiceService.fetch().subscribe((result: any) => {
    //       // console.log('invoice', result)
    //       if(result.status === 200) {
    //         this.store.dispatch(new invoiceActions.add(result.records.filter(inv => inv.deleted_flag == 0)))
    //       }
    //     })
    //   }
    // })

    //console.log("settings",settings)
    if (settings) {
      this.activeInvoice.discount_on_item = settings.discount_on_item
      this.activeInvoice.tax_on_item = settings.tax_on_item
      if (settings.tax_on_item == 1) {
        this.taxtext = "Tax (on Bill)"
        this.activeInvoice.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.taxtext = "Tax (on Item)"
        this.activeInvoice.tax_on_item = 2
      } else {
        this.taxtext = "Tax (Disabled)"
        this.activeInvoice.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }
      if (settings.discount_on_item == 0) {
        this.activeInvoice.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        this.activeInvoice.discount_on_item = 2
      } else {
        this.activeInvoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      this.taxtext = "Tax (Disabled)"
      this.activeInvoice.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.activeInvoice.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
  }

  initializeSettings(invNoParam) {
    // Fetch settings if not in store and init settings
    this.store.select('setting').subscribe(sets => {
      if(Object.keys(sets).length == 0) {
        this.settingService.fetch().subscribe((response: any) => {
          this.initSettings(response, invNoParam)
        })
      } else {
        var response = {status: 200, settings: sets}
        this.initSettings(response, invNoParam)
      }
    })
  }

  initSettings(response, invNoParam) {
    var settings = this.authenticated.setting
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
        this.activeInvoice.invoice_number = settings.setInvoiceFormat + invNoParam
      } else {
        if (!isNaN(parseInt(settings.invNo))) {
          this.tempInvNo = parseInt(settings.quotNo) + 1
          invNoParam = this.tempInvNo
        } else {
          this.tempInvNo = 1
          invNoParam = this.tempInvNo
        }
        if (settings.setInvoiceFormat) {
          this.activeInvoice.invoice_number = settings.setInvoiceFormat + this.tempInvNo
        } else {
          this.activeInvoice.invoice_number = "INV_" + this.tempInvNo
        }
      }        
    } else {
      if (invNoParam) {
        this.activeInvoice.invoice_number = settings.setInvoiceFormat + invNoParam
      } else {
        if (!isNaN(parseInt(settings.invNo))) {
          this.tempInvNo = parseInt(settings.quotNo) + 1
          this.tempQuaNoOnAdd = this.tempInvNo
        } else {
          this.tempInvNo = 1
          this.tempQuaNoOnAdd = this.tempInvNo
        }
        if (settings.setInvoiceFormat) {
          this.activeInvoice.invoice_number = settings.setInvoiceFormat + this.tempInvNo
        } else {
          this.activeInvoice.invoice_number = "INV_" + this.tempInvNo
        }
      }
    }
  }

  // Client Functions
  setClientFilter() {
    // Filter for client autocomplete
    this.filteredClients = this.billingTo.valueChanges.pipe(
      startWith<string | client>(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterCli(name) : this.clientList.slice())
    )
  }

  private _filterCli(value: string): client[] {
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()));
  }

  selectedClientChange(client) {
    var temp
    temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]

    if (temp !== undefined) {
      this.activeClient = temp
      this.activeInvoice.unique_key_fk_client = temp.uniqueKeyClient
    } else {
      //console.log("clients",this.clients)
      if(this.activeClient) {
        this.activeClient = {}
      }

      this.openAddClientModal(client.option.value)
    }
  }

  openAddClientModal(name) {
    this.addClientModal = {}
    this.addClientModal.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
      $('#add-client input[type="text"]')[1].focus()
    })
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
          this.activeClient = this.clientList.filter((client) => client.uniqueKeyClient == response.clientList[0].unique_identifier)[0]
          this.billingTo.setValue(this.activeClient)

          $('#add-client').modal('hide')
          //this.data.invoice.unique_key_fk_client = this.activeClient.unique_identifier
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      })
    }
  }

  closeAddClientModal() {
    //alert('closed!!')
    $("#loadb").css("display", "none")
    $('#add-client').modal('hide')

    this.addClientModal = {}
    $('#refreshClient').addClass('rotator')
    $("#loadb").css("display", "none")
  }

  // Product Functions
  setProductFilter() {
    this.filteredProducts = this.addItem.valueChanges.pipe(
      startWith<string | product>(''),
      map(value => typeof value === 'string' ? value : value.prodName),
      map(name => name ? this._filterProd(name) : this.productList.slice())
    )
  }

  private _filterProd(value: string): product[] {
    return this.productList.filter(prod => prod.prodName.toLowerCase().includes(value.toLowerCase()))
  }

  saveProduct(add_product, callback: Function = null) {
    var d = new Date()

    var product = {
      device_modified_on: d.getTime(),
      discription: add_product.description ? add_product.description : '',
      organization_id: this.user.user.orgId,
      prod_name: add_product.prodName,
      rate: add_product.rate ? add_product.rate : 0,
      tax_rate: add_product.tax_rate ? add_product.tax_rate : 0,
      unique_identifier: add_product.unique_identifier ? add_product.unique_identifier : generateUUID(this.user.user.orgId),
      unit: add_product.unit ? add_product.unit : ""
    }

    this.productService.add([product]).subscribe((result: any) => {
      if (result.status === 200) {
        var temp = this.productService.changeKeysForStore(result.productList[0])
        this.store.dispatch(new productActions.add([temp]))

        if(callback !== null) {
          callback(temp)
        }
        alert('Product had been added!')
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    })
  }

  editInvoiceItem(index) {
    $('#edit-item').modal('show')
    this.activeItem = {...this.activeInvoice.listItems[index]}
  }

  addEditInvoiceItem(uid = null) {
    // If product is in product list directly add to invoice else save product and then add to invoice
    // console.log(this.addItem, uid)

    if(this.activeItem.unique_identifier) {
      if(uid == null) {
        // Add Item to invoice
        this.activeInvoice.listItems.push(this.activeItem)
      } else {
        // Edit Item from Invoice
        var index = this.activeInvoice.listItems.findIndex(it => it.unique_identifier = uid)
        this.activeInvoice.listItems[index] = this.activeItem
        $('#edit-item').modal('hide')
      }
      this.addItem.reset('')
      this.activeItem = {
        quantity: 1,
        rate: 0.00
      }
      this.calculateInvoice(1)
    } else {
      this.saveProduct({...this.activeItem, prodName: this.addItem.value}, (product) => {
        this.fillItemDetails({...this.activeItem, ...product})
        this.activeInvoice.listItems.push(this.activeItem)
        this.addItem.reset('')
        this.activeItem = {
          quantity: 1,
          rate: 0.00
        }
        this.calculateInvoice(1)
      })
    }
  }

  closeItemModel() {
    this.activeItem = {
      quantity: 1,
      rate: 0.00,
      total: 0.00
    }
    $('#edit-item').modal('hide')
  }

  // Term Functions
  openAddTermModal() {
    this.addTermModal = {}
    $('#add-terms').modal('show')
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

  closeAddTermModal() {
    $('#add-terms').modal('hide')
  }

  addRemoveTermsFromInvoice(term) {
    // console.log(term)
    var index = this.activeInvoice.termsAndConditions.findIndex(trms => trms.uniqueKeyTerms == term.uniqueKeyTerms)
    if(index == -1) {
      this.activeInvoice.termsAndConditions.push(term)
    } else {
      this.activeInvoice.termsAndConditions.splice(index, 1)
    }
  }

  isTermInInvoice(term) {
    return this.activeInvoice.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
  }

  // Invoice Functions
  changeDueDate(due_date_flag) {
    var [y, m, d] = this.activeInvoice.created_date.split('-').map(x => parseInt(x))

    switch (due_date_flag) {
      case '0':
        this.dueDate.reset()
        this.activeInvoice.due_date_flag = 0
      break

      case '1':
        this.dueDate.reset(new Date(y, (m - 1), d))
        this.activeInvoice.due_date_flag = 1
      break

      case '2':
        this.dueDate.reset(new Date(y, (m - 1), d))
        this.activeInvoice.due_date_flag = 2
      break

      case '3':
        this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 7))
        this.activeInvoice.due_date_flag = 3
      break

      case '4':
        this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 10))
        this.activeInvoice.due_date_flag = 4
      break

      case '5':
      this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 15))
      this.activeInvoice.due_date_flag = 5
      break

      case '6':
        this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 30))
        this.activeInvoice.due_date_flag = 6
      break

      case '7':
        this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 45))
        this.activeInvoice.due_date_flag = 7
      break

      case '8':
        this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 60))
        this.activeInvoice.due_date_flag = 8
      break

      case '9':
      this.dueDate.reset(this.addDays(this.activeInvoice.created_date, 90))
      this.activeInvoice.due_date_flag = 9
      break

      default:
        this.dueDate.reset()
      break
    }
  }

  addDays (date, days) {
    var [y, m, d] =  date.split('-').map(tmp => parseInt(tmp))
    date = new Date(y, (m - 1), d).getTime()
    return new Date(date+(days*24*60*60*1000))
  }

  fillItemDetails(prod = null) {
    var product = (prod == null) ? this.addItem.value : prod
    // console.log(product)
    this.activeItem = {
      unique_identifier: product.uniqueKeyProduct,
      description: product.discription == null ? '' : product.discription,
      product_name: product.prodName,
      quantity: product.quantity ? product.quantity : 1,
      unit: product.unit,
      rate: product.rate,
      tax_rate: 0.00
    }
    this.calculateTotal()
  }

  calculateTotal() {
    if (Object.keys(this.activeItem).length > 0) {
      var rateParse = parseFloat(this.activeItem.rate)
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      var productRate = (this.activeItem.quantity * rateParse)
      this.activeItem.total = productRate
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

    // Discount
    if (this.activeInvoice.percentage_flag == 1) {
      var discountPercent = this.activeInvoice.percentage_value / 100
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
      this.activeInvoice.percentage_value = discountAmount
    }

    // Tax
    if (this.activeInvoice.tax_on_item == 1) {
      tax_rate = (this.activeInvoice.tax_rate * discountTotal) / 100
      if (isNaN(tax_rate)) {
        tax_rate = 0
      }
      this.activeInvoice.tax_amount = tax_rate
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

    // Shipping
    shippingCharges = this.activeInvoice.shipping_charges
    if (isNaN(shippingCharges)) {
      shippingCharges = 0
    }
    totalAmount = discountTotal + shippingCharges + tax_rate

    // Adjustment
    var adjustmentAmount = this.activeInvoice.adjustment
    if (isNaN(adjustmentAmount)) {
      adjustmentAmount = 0
    }
    finalAmount = totalAmount - adjustmentAmount

    if (isNaN(finalAmount)) {
      finalAmount = 0
    }

    this.activeInvoice.balance = parseFloat(finalAmount.toFixed(2)) - this.activeInvoice.payments.reduce((a, b) => a + b.paid_amount, 0)
    this.activeInvoice.amount = parseFloat(finalAmount.toFixed(2))
  }

  removeItem(index) {
    this.activeInvoice.listItems.splice(index, 1)
    this.calculateInvoice(1)
  }

  save(status) {
    if(this.activeInvoice.unique_key_fk_client == '') {
      alert('client not selected')
      return false
    }

    if (this.activeInvoice.listItems.length == 0 || !status) {
      // notifications.showError({ message: 'Select your client!', hideDelay: 1500, hide: true });
      alert('You haven\'t added item')
      // notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
      // $('#invoiceSavebtn').button('reset');
      return false
    }

    $('#invSubmitBtn').attr('disabled', 'disabled')
    this.activeInvoice.organization_id = parseInt(this.user.user.orgId)

    // Add terms in invoice from terms array Invoice api compatible
    var temp = []
    this.activeInvoice.termsAndConditions.forEach(tnc => {
      temp.push(this.termConditionService.changeKeysForInvoiceApi(tnc))
    })
    this.activeInvoice.termsAndConditions = temp
    this.activeInvoice.unique_identifier = generateUUID(this.user.user.orgId)
    // this.activeInvoice.balance = this.balance

    for (var i = this.activeInvoice.listItems.length; i > 0; i--) {
      this.activeInvoice.listItems[i - 1].unique_key_fk_invoice = this.activeInvoice.unique_identifier
      if (!this.activeInvoice.listItems[i - 1].product_name || this.activeInvoice.listItems[i - 1].product_name == '') {
        this.activeInvoice.listItems.splice(i - 1, 1)
      }
    }

    for (var j = 0; j < this.activeInvoice.termsAndConditions.length; j++) {
      this.activeInvoice.termsAndConditions[j].unique_key_fk_invoice = this.activeInvoice.unique_identifier
    }
    for (var t = 0; t < this.activeInvoice.taxList.length; t++) {
      if (this.activeInvoice.taxList[t] == null) {
        this.activeInvoice.taxList.splice(t, 1)
      }
    }

    for (var k = 0; k < this.activeInvoice.payments.length; k++) {
      this.activeInvoice.payments[k].unique_key_fk_invoice = this.activeInvoice.unique_identifier
      this.activeInvoice.payments[k].unique_key_fk_client = this.activeInvoice.unique_key_fk_client
    }

    this.activeInvoice.device_modified_on = new Date().getTime()

    var self = this
    this.invoiceService.add([this.activeInvoice]).subscribe((result: any) => {
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
        // Add Invoice to store
        self.store.dispatch(new invoiceActions.add(result.invoiceList))

        // Reset Create Invoice page for new invoice creation
        self.resetCreateInvoice()
        alert('Invoice saved successfully')
      }
      $('#invSubmitBtn').removeAttr('disabled')
    })
  }

  resetCreateInvoice() {
    this.billingTo.setValue('')
    this.addItem.reset('')

    this.activeInvoice = {...this.emptyInvoice}
    this.activeInvoice.listItems = []
    this.newItemCounter = 0

    this.activeClient = {}
    this.dueDate.reset()

    var settings = this.authenticated.setting
    this.activeInvoice.taxList = []
    this.activeInvoice.percentage_flag = 1

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
      if (settings.setInvoiceFormat) {
        this.activeInvoice.invoice_number = settings.setInvoiceFormat + this.tempInvNo
      } else {
        this.activeInvoice.invoice_number = "INV_" + this.tempInvNo
      }
    }

    this.termList.subscribe(trms => {
      this.activeInvoice.termsAndConditions = trms
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
        this.taxtext = "Tax (on Bill)"
        this.activeInvoice.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.taxtext = "Tax (on Item)"
        this.activeInvoice.tax_on_item = 2
      } else {
        this.taxtext = "Tax (Disabled)"
        this.activeInvoice.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }
      if (settings.discount_on_item == 0) {
        this.activeInvoice.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        this.activeInvoice.discount_on_item = 2
      } else {
        this.activeInvoice.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      this.taxtext = "Tax (Disabled)"
      this.activeInvoice.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.activeInvoice.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
  }

  // Payment Functions
  openAddPaymentModal() {
    this.addPaymentModal = {
      amount: this.activeInvoice.amount,
      balance: this.activeInvoice.amount,
      date_of_payment: this.activeInvoice.created_date,
      paid_amount: 0.00,
      payments: this.activeInvoice.payments,
    }
    this.addPaymentModal.balance -= this.addPaymentModal.payments.reduce((a, b) => a + b.paid_amount, 0)
    $('#addPaymentAddInvoice').modal('show')
  }

  addPaymentInModalPaymentList() {
    this.addPaymentModal.payments.push({
      date_of_payment: this.addPaymentModal.date_of_payment,
      organization_id: this.user.user.orgId,
      paid_amount: this.addPaymentModal.paid_amount,
      unique_identifier: generateUUID(this.user.user.orgId),
      unique_key_fk_client: this.activeInvoice.unique_key_fk_client,
      unique_key_fk_invoice: '',
      unique_key_voucher_no: ''
    })

    this.addPaymentModal.balance -= this.addPaymentModal.paid_amount
    this.addPaymentModal.paid_amount = 0.00
  }

  addPaymentsInInvoice() {
    this.activeInvoice.payments = [...this.addPaymentModal.payments]
    this.calculateInvoice(1)
    this.closeAddPaymentModal()
  }

  closeAddPaymentModal() {
    this.addPaymentModal = {}
    $('#addPaymentAddInvoice').modal('hide')
  }



  // CURRENTLY USELESS FUNCTIONS
  multiTaxButton(taxname) {
    var status = true
    if (this.activeInvoice.taxList)
      for (var k = 0; k < this.activeInvoice.taxList.length; k++) {
        if (this.activeInvoice.taxList[k].taxName !== taxname) {
          status = true
        } else {
          status = false
          break
        }
      }
    return status
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

  // hideMeTaxMultiple(index) {
  //   this.activeInvoice.tax_rate = 0
  //   this.multi_tax_index.splice(index, 1)
  //   this.activeInvoice.taxList.splice(index, 1)
  //   this.calculateInvoice(index)
  //   //this.show_tax_input_list[index] = false
  //   this.tempflagTaxList[index] = false
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
  //         this.discountLabel = true;
  //         this.show_discount = false;
  //       } else if (this.invoice.discount_on_item == 0) {
  //         this.show_discount = true;
  //       } else {
  //         this.show_discount = false;
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
  //       else
  //       if (this.invoice.due_date == null || this.invoice.due_date === '') {
  //         this.selectDueDate = "no_due_date";
  //       } else if (this.invoice.due_date == this.invoice.created_date) {
  //         this.selectDueDate = "immediate";
  //       } else if (this.invoice.due_date != this.invoice.created_date) {
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

  // setPaidAmountTotalView() {
  //   var temp = 0
  //   if (typeof this.invoice.payments !== 'undefined') {
  //     for (var i = 0; i < this.invoice.payments.length; i++) {
  //       temp = temp + parseFloat(this.invoice.payments[i].paidAmount)
  //     }
  //   }
  //   this.paid_amount = temp
  // }

  // dynamicOrder(invoice) {
  //   var order = 0
  //   switch (this.balance) {
  //     case 'name':
  //       order = invoice.orgName
  //       break
  //     case 'created_date':
  //       {
  //         var date = new Date(invoice.createDate)
  //         order = date.getTime()
  //         break
  //       }
  //     case 'invoice_number':
  //       order = invoice.tempInvNo
  //       break
  //     case 'amount':
  //       order = parseFloat(invoice.amount)
  //       break
  //     default:
  //       order = invoice.deviceCreatedDate
  //   }
  //   return order
  // }
}
