import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import {Observable} from 'rxjs'
import {map, startWith} from 'rxjs/operators'

import { response, client, terms, setting } from '../../interface'
import { EstimateService } from '../../services/estimate.service'
import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'
import { generateUUID, changeEstimate } from '../../globalFunctions'
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent implements OnInit {

  private data = {
    item: {},
    estimate: {
      taxList: []
    },
    terms: {},
    add_estimate: {
      amount: 0.00,
      adjustment: 0,
      organization_id: '',
      termsAndConditions: [],
      created_date: '',
      device_modified_on: 0,
      discount: 0,
      discount_on_item: 0,
      estimate_number: '',
      gross_amount: 0,
      listItems: [],
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
    }
  }
  private estimates = []
  private estimate = []
  private estimateItems = []
  private estimateViewLoader: boolean
  private estimateListLoader: boolean
  private selectedEstimate = null
  private tempQuaNoOnAdd: number
  private estimateFilterTerm: string
  private estimateDate
  private tempEstNo: number
  private createEstimate: boolean = true
  private viewEstimate: boolean = false
  private editEstimate: boolean = false

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

  private productList = []
  private addProductList = []
  private addProduct: {
    itemDescription: string
  } = {
    itemDescription: ''
  }

  private repos:client[] = []
  filteredRepos: Observable<client[]>
  private show_tax_input_list: any
  private tempflagTaxList: any

  private tax_on: string
  private taxtext: string
  private discount_on: string
  private discounttext: string

  private customersSelect
  private settings: any
  private terms
  private termList

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
  private sortEstimates: string
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
  billingTo = new FormControl('')
  constructor(private router: Router,
    private route: ActivatedRoute,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private cookie: CookieService,
    private settingService: SettingService,
    private productService: ProductService) {
      this.user = JSON.parse(this.cookie.get('user'))
      this.authenticated = {setting: this.user.setting}
      // console.log(this.authenticated)
    }

  ngOnInit() {
    // var self = this
    // this.estimateService.fetch().subscribe(function (response: response) {
    //   if (response.records != null) {
    //     self.estimates = response.records.filter(pro => pro.enabled == 0)
    //     // console.log(self.estimates);
    //     self.init()
    //   }
    // })
    this.init()
  }

  private _filter(value: string): client[] {
    const filterValue = value.toLowerCase();
    return this.repos.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  toggle() {
    this.checked = !this.checked
  }

  multiTaxButton(taxname) {
    var status = true
    if (this.data.estimate.taxList)
      for (var k = 0; k < this.data.estimate.taxList.length; k++) {
        //console.log("multiTaxButton",this.data.invoice.taxList,$rootScope.authenticated.setting.alstTaxName)
        if (this.data.estimate.taxList[k].taxName !== taxname) {
          status = true
        } else {
          status = false
          break
        }
      }

    return status
  }

  setSortEstimate(searchfield) {
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
    } else if (searchfield == 'estimate_number') {
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
    this.sortEstimates = searchfield
  }

  init() {
    this.estimateViewLoader = true
    this.estimateListLoader = false
    this.clientsLocal = []

    this.clientListLoader = true
    this.clientFocus = false

    this.initializeSettings(this.tempQuaNoOnAdd)

    this.data.add_estimate.taxList = []
    this.show_tax_input_list = []
    this.tempflagTaxList = []
    this.data.add_estimate.gross_amount = 0.00
    this.clients = []

    var settings = this.authenticated.setting

    this.tempQtyLabel = settings.mTvQty ? settings.mTvQty : ''
    this.tempProLabel = settings.mTvProducts ? settings.mTvProducts : ''
    this.tempAmtLabel = settings.mTvRate ? settings.mTvRate : ''
    this.tempRateLabel = settings.mTvAmount ? settings.mTvAmount : ''
    this.tempTermLabel = settings.mTvTermsAndConditions ? settings.mTvTermsAndConditions : ''
    this.tempBillLabel = settings.mTvBillTo ? settings.mTvBillTo :''
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
      if(!this.settings) {
        this.settings = {date_format: ''}
      }
      this.settings.date_format = 'dd-mm-yy'
    }
    if (this.settings.date_format === 'dd-mm-yy') {
      this.estimateDate = new FormControl(new Date())
      this.data.add_estimate.created_date = this.estimateDate.value.getTime()
    } else if (this.settings.date_format = 'mm-dd-yy') {
      this.estimateDate = new FormControl(new Date())
      this.data.add_estimate.created_date = this.estimateDate.value.getTime()
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

          this.repos = response.records.map((repo: any) => {
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
        }else {
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
        this.terms = response.termsAndConditionList
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
          }
        }
      }
    }

    //console.log("settings",settings)
    if (settings) {
      this.data.add_estimate.discount_on_item = settings.discount_on_item
      this.data.add_estimate.tax_on_item = settings.tax_on_item
      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        this.data.add_estimate.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        this.data.add_estimate.tax_on_item = 2
      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        this.data.add_estimate.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }

      if (settings.discount_on_item == 0) {
        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        this.data.add_estimate.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        this.data.add_estimate.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        this.data.add_estimate.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.data.add_estimate.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.data.add_estimate.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
    // DataStore.estimatesList.length == 0
    if (1) {
      this.estimateService.fetch().subscribe((result: response) => {
        this.estimates = result.records.filter(est => est.enabled == 0)
        this.clientService.fetch().subscribe((response: response) => {
          this.clientList = response.records

          for (var i = 0; i < this.estimates.length; i++) {
            for (var j = 0; j < this.clientList.length; j++) {
              if (this.estimates[i].unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
                this.estimates[i].orgName = this.clientList[j].name
              }
            }
            var tempEstNo = this.estimates[i].quetationNo.replace(/[^\d.]/g, '!')
            this.estimates[i].tempEstNo = parseInt(tempEstNo.substr(tempEstNo.lastIndexOf('!') + 1))
            if (isNaN(this.estimates[i].tempEstNo)) {
              this.estimates[i].tempEstNo = 0
            }
          }

          this.estimateListLoader = true
          // console.log(result)
        })
        this.route.params.subscribe(params => {
          if (params.estId != "0") {
            this.getEstimate(params.estId, 3)
          }
        })
      })
    } else {
      // this.estimates = DataStore.estimatesList
      this.estimateListLoader = true
      // $rootScope.pro_bar_load = true
    }
    this.data.add_estimate.listItems.push({
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
            this.data.add_estimate.estimate_number = settings.quotFormat + invNoParam
          else if (typeof settings.quotFormat !== 'undefined')
            this.data.add_estimate.estimate_number = "Est_" + invNoParam
          else
            this.data.add_estimate.estimate_number = invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempEstNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempEstNo
          } else {
            this.tempEstNo = 1
            this.tempQuaNoOnAdd = this.tempEstNo
          }
          if (settings.quotFormat || settings.quotFormat === '') {
            this.data.add_estimate.estimate_number = settings.quotFormat + this.tempEstNo
          } else if (typeof settings.quotFormat !== 'undefined') {
            this.data.add_estimate.estimate_number = "Est_" + this.tempEstNo
          } else {
            this.data.add_estimate.estimate_number = this.tempEstNo.toString()
          }
        }
      } else {
        if (invNoParam) {
          this.data.add_estimate.estimate_number = settings.quotFormat + invNoParam
        } else {
          if (settings.quotNo && !isNaN(parseInt(settings.quotNo))) {
            this.tempEstNo = parseInt(settings.quotNo) + 1
            this.tempQuaNoOnAdd = this.tempEstNo
          } else {
            this.tempEstNo = 1
            this.tempQuaNoOnAdd = this.tempEstNo
          }
          if (settings.quotFormat) {
            this.data.add_estimate.estimate_number = settings.quotFormat + this.tempEstNo
          } else {
            this.data.add_estimate.estimate_number = "Est_" + this.tempEstNo
          }
        }
      }
    })
  }

  getEstimate(id, index) {
    this.estimateViewLoader = false
    $('#msgInv').removeClass("show")
    $('#msgInv').addClass("hide")
    $('#estMain').removeClass("hide")
    $('#estMain').addClass("show")
    $('#editEst').removeClass("show")
    $('#editEst').addClass('hide')

    this.clientList = this.clients
    if (this.estimates) {
      var est_index = this.estimates.findIndex(estimate => estimate.unique_identifier == id)
      this.estimate[0] = this.estimates[est_index]

      this.data.estimate = this.estimate[0]
      this.productList = this.estimate[0].alstQuotProduct
      this.estimateItems = this.estimate[0].alstQuotProduct
      // this.estimateTerms = this.estimate[0].alstQuotTermsCondition
      // this.estimateDate = $filter('date')(this.data.estimate.createDate)
      /* *
      * Multiple Tax Names
      * */
      if (this.data.estimate.taxList) {
        if (this.data.estimate.taxList.length > 0) {
          this.showMultipleTax = true
        } else {
          this.showMultipleTax = false
        }
      } else {
        this.showMultipleTax = false
      }

      if (this.clientList) {
        // var EST_index_client = findObjectIndex(this.clientList, 'uniqueKeyClient', this.data.estimate.unique_key_fk_client)
        //this.clientsLocal[0] = $rootScope.clientList[EST_index_client]
        this.estimateViewLoader = true

        // this.estimate.client = this.clientList[EST_index_client]
        // this.clientsLocal[0] = this.clientList[EST_index_client]
      }

      // if (this.data.estimate.assignDiscountFlag == 1) {
      //   this.discounttext = "Discount (On Item)"
      //   this.show_discount = false
      // } else if (this.data.estimate.assignDiscountFlag == 0) {
      //   this.discounttext = "Discount (On Bill)"
      //   this.show_discount = true
      // } else {
      //   this.show_discount = false
      //   this.discounttext = "Discount (Disabled)"
      // }

      // if (this.data.estimate.assignTaxFlag == 0) {
      //   this.taxtext = "Tax (On Item)"
      //   this.show_tax_input = false
      // } else if (this.data.estimate.assignTaxFlag == 1 && this.data.estimate.taxrate > 0) {
      //   this.taxtext = "Tax (On Bill)"
      //   this.show_tax_input = true
      // } else {
      //   this.show_tax_input = false
      //   this.taxtext = "Tax (Disabled)"
      // }

      // if (this.data.estimate.shippingCharges && this.data.estimate.shippingCharges > 0)
      //   this.show_shipping_charge = true
      // else
      //   this.show_shipping_charge = false

      // if (this.data.estimate.discountFlag && this.data.estimate.discountFlag == 1)
      //   this.isRate = true
      // else
      //   this.isRate = false

    }

    this.routeParams.estId = this.estimate[0].unique_identifier
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

  // dynamicOrder(estimate) {
  //   //console.log("estimates",estimate)
  //   var order = 0
  //   switch (this.sortEstimates) {
  //     case 'name':
  //       order = estimate.orgName
  //       this.rev = false
  //       break

  //     case 'created_date':
  //       {
  //         var date = new Date(estimate.createDate)
  //         order = date.getTime()
  //         this.rev = true
  //         break
  //       }
  //     case 'estimate_number':
  //       order = estimate.tempEstNo
  //       this.rev = true
  //       break

  //     case 'amount':
  //       order = parseFloat(estimate.amount)
  //       this.rev = true
  //       break

  //     default:
  //       order = estimate.deviceCreatedDate
  //       this.rev = true
  //   }

  //   return order
  // }

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

  // saveTermEdit(data, status) {
  //   $('#addtermbtn').prop('disabled', true)
  //   var baseURL = Data.getBaseUrl()
  //   if (status) {
  //     data.organization_id = $rootScope.authenticated.user.orgId
  //     if (!data.unique_identifier)
  //       data.unique_identifier = utility.generateUUID()
  //     var d = new Date()
  //     data.device_modified_on = d.getTime()
  //     this.termConditionService.addTermAndCondition([data]).subscribe(function (response: response) {
  //       if (response.status === 200) {
  //         data = {}
  //         this.termCondition = {}
  //         //console.log("78", response.data.termsAndConditionList, this.terms)

  //         var tempTerm78 = {
  //           "serverTermCondId": response.termsAndConditionList[0]._id,
  //           "uniqueKeyTerms": response.termsAndConditionList[0].unique_identifier,
  //           "orgId": response.termsAndConditionList[0].organization_id,
  //           "terms": response.termsAndConditionList[0].terms,
  //           "setDefault": response.termsAndConditionList[0].set_default,
  //           "enabled": response.termsAndConditionList[0].deleted_flag
  //         }
  //         //this.terms.push(tempTerm78)
  //         // DataStore.pushTermsList(tempTerm78)
  //         this.terms_edit.push(tempTerm78)

  //         if (tempTerm78.setDefault === 'DEFAULT') {
  //           var temp45 = {
  //             "_id": tempTerm78.serverTermCondId,
  //             "unique_identifier": tempTerm78.uniqueKeyTerms,
  //             "organization_id": tempTerm78.orgId,
  //             "terms_condition": tempTerm78.terms
  //           }
  //           this.termListEdit.push(temp45)

  //           var index29 = findObjectIndex(this.terms.filter(function (pro) {
  //             return (pro.enabled == 0)
  //           }), 'uniqueKeyTerms', tempTerm78.uniqueKeyTerms)
  //           this.editdata.terms[index29] = true

  //         }

  //         this.term = {}
  //         this.termForm.$setUntouched()
  //         $('#addtermbtn').prop('disabled', false)
  //         // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true })
  //         //$('#add-terms').modal('hide')
  //       } else {
  //         $('#addtermbtn').prop('disabled', false)
  //         // notifications.showError({ message: response.message, hideDelay: 1500, hide: true })
  //       }
  //     })
  //   }
  // }

  // saveTerm(data, status) {
  //   $('#addtermbtn').prop('disabled', true)
  //   if (status) {
  //     data.organization_id = this.user.user.orgId
  //     if (!data.unique_identifier) data.unique_identifier = generateUUID(this.user.user.orgId)
  //     var d = new Date()
  //     data.device_modified_on = d.getTime()
  //     this.termConditionService.addTermAndCondition([data]).subscribe(function (response: response) {
  //       if (response.status === 200) {
  //         data = {}
  //         this.termCondition = {}

  //         var tempTerm78 = {
  //           "serverTermCondId": response.termsAndConditionList[0]._id,
  //           "uniqueKeyTerms": response.termsAndConditionList[0].unique_identifier,
  //           "orgId": response.termsAndConditionList[0].organization_id,
  //           "terms": response.termsAndConditionList[0].terms,
  //           "setDefault": response.termsAndConditionList[0].set_default,
  //           "enabled": response.termsAndConditionList[0].deleted_flag
  //         }
  //         //this.terms.push(tempTerm78)
  //         // DataStore.pushTermsList(tempTerm78)


  //         if (tempTerm78.setDefault === 'DEFAULT') {
  //           var temp45 = {
  //             "_id": tempTerm78.serverTermCondId,
  //             "unique_identifier": tempTerm78.uniqueKeyTerms,
  //             "organization_id": tempTerm78.orgId,
  //             "terms_condition": tempTerm78.terms
  //           }
  //           this.termList.push(temp45)

  //           var index29 = findObjectIndex(this.terms.filter(function (pro) {
  //             return (pro.enabled == 0)
  //           }), 'uniqueKeyTerms', tempTerm78.uniqueKeyTerms)
  //           this.data.terms[index29] = true

  //         }

  //         this.term = {}
  //         this.termForm.$setUntouched()
  //         $('#addtermbtn').prop('disabled', false)
  //         // notifications.showSuccess({ message: response.data.message, hideDelay: 1500, hide: true })
  //         //$('#add-terms').modal('hide')

  //       } else {
  //         $('#addtermbtn').prop('disabled', false)
  //         // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })

  //         // alert(result.message)
  //       }

  //     })
  //   }
  // }

  // querySearch(query) {
  //   var results
  //   if (this.repos) {
  //     results = query ? this.repos.filter(this.createFilterFor(query)) : this.repos
  //     if (false) {
  //       deferred = $q.defer()
  //       $timeout(function () {
  //         deferred.resolve(results)
  //       }, Math.random() * 1000, false)
  //       return deferred.promise
  //     } else {
  //       return results
  //     }
  //   } else
  //     return []
  // }

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
        // var lowercaseQuery1 = angular.lowercase(this.repos[i].name)
        // if (lowercaseQuery1 === lowercaseQuery) {
        //   this.clientValidation = true
        //   break
        // }
        // else {
        //   this.clientValidation = false
        // }
      }
  }

  // watch() {
  //   var estimateDateArray = ''
  //   if (this.estimateDate.indexOf('.') > -1)
  //     estimateDateArray = this.estimateDate.split('.')
  //   else
  //     estimateDateArray = this.estimateDate.split('-')

  //   if ($rootScope.settings.date_format === 'dd-mm-yy') {
  //     this.data.add_estimate.created_date = (new Date(estimateDateArray[2], parseInt(estimateDateArray[1]) - 1, estimateDateArray[0])).getTime()

  //   } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
  //     this.data.add_estimate.created_date = (new Date(estimateDateArray[2], parseInt(estimateDateArray[0]) - 1, estimateDateArray[1])).getTime()
  //   }
  // }

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
    item = this.repos.filter(client => client.name == item.option.value)[0]

    if (typeof item !== 'undefined') {
      var clientId = item.uniqueKeyClient
      if (typeof this.clients !== 'undefined') {
        var index = this.clients.findIndex(client => client.uniqueKeyClient == clientId)
        if (typeof clientId !== 'undefined' && index === -1) {
          this.client.client = {email: '', number: '', addressLine1: '', name: clientId, shippingAddress: ''}
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
            this.data.add_estimate.unique_key_fk_client = clientId
            this.data.add_estimate.shipping_address = this.client.client.shippingAddress
            this.client.client.addressLine1 = this.client.client.addressLine1
            break
          }
        }
        // this.focusOut(item.name)
        this.showClientError = false
      } else {
        this.client.client = {addressLine1: '', email: '', name: '', number: '', shippingAddress: ''}
      }
    } else {
      //console.log("clients",this.clients)
      this.client.client = {addressLine1: '', email: '', name: '', number: '', shippingAddress: ''}
      this.searchText = ''
    }
  }

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

  newState(state) {
    // this.addClient(state)
  }

  addLineItem() {
    this.newItemCounter += 1
    this.data.add_estimate.listItems.push({
      'description': '',
      'quantity': 1,
      'unique_identifier': 'new' + this.newItemCounter,
      'rate': 0.00,
      'total': 0.00
    })
    // console.log(this.data.add_estimate.listItems)

    if (this.newItemCounter > 0) {
      this.focusOutMessage(this.searchText)
    }
  }

  addItem(index, product) {
    // console.log(index, product);

    if (index !== -1) {
      this.data.add_estimate.listItems[index].unique_key_fk_product = product.uniqueKeyProduct
      this.data.add_estimate.listItems[index].unique_identifier = generateUUID(this.user.user.orgId)
      this.data.add_estimate.listItems[index].description = product.discription == null ? '' : product.discription
      this.data.add_estimate.listItems[index].product_name = product.prodName
      this.data.add_estimate.listItems[index].quantity = 1
      this.data.add_estimate.listItems[index].unit = product.unit
      this.data.add_estimate.listItems[index].rate = product.rate
      this.data.add_estimate.listItems[index].tax_rate = 0.00
    }
    // console.log(this.data.add_estimate.listItems);
    
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
    // this.calculateEstimate(1)
  }

  calculateTotal(index) {
    //console.log("in total " + index)
    if (this.data.add_estimate.listItems.length > 0 && typeof this.data.add_estimate.listItems[index].quantity !== "undefined") {
      var rateParse = parseFloat(this.data.add_estimate.listItems[index].rate)
      // console.log{""}
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      var productRate = (this.data.add_estimate.listItems[index].quantity * rateParse)
      this.data.add_estimate.listItems[index].total = productRate
      this.calculateEstimate(1)
    }
  }

  calculateEstimate(indexTaxMultiple) {
    var total = 0

    for (var i = 0; i < this.data.add_estimate.listItems.length; i++) {
      var item = this.data.add_estimate.listItems[i]
      total += parseFloat(item.total)
    }
    this.data.add_estimate.gross_amount = total

    var grossAmount = total
    var discountTotal = 0
    var finalAmount = 0
    var shippingCharges = 0
    var totalAmount = 0
    var discoutAmount = 0
    var tax_rate = 0

    if (this.data.add_estimate.percentage_flag == 1) {
      var discountPercent = parseFloat(this.data.add_estimate.percentage_value) / 100
      if (isNaN(discountPercent)) {
        discountPercent = 0
      }

      discoutAmount = discountPercent * grossAmount
      this.data.add_estimate.discount = discoutAmount
      discountTotal = grossAmount - discoutAmount
    } else if (this.data.add_estimate.percentage_flag == 0) {

      var estimateDiscount = this.data.add_estimate.discount
      if (isNaN(estimateDiscount)) {
        estimateDiscount = 0
      }
      discountTotal = grossAmount - estimateDiscount
      var discountAmount = (this.data.add_estimate.discount / grossAmount) * 100
      if (isNaN(discountAmount)) {
        discountAmount = 0
      }
      this.data.add_estimate.percentage_value = discountAmount.toString()
    }

    if (this.tax_on == 'taxOnBill') {
      tax_rate = (this.data.add_estimate.tax_rate * discountTotal) / 100
      if (isNaN(tax_rate)) {
        tax_rate = 0
      }
      this.data.add_estimate.tax_amount = tax_rate
      // console.log("tax_ rate bill", tax_rate)
    }

    if (indexTaxMultiple) {
      //console.log("indexmultiple in",indexTaxMultiple,this.data.invoice.taxList)
      var temp_tax_rate = 0
      for (var i = 0; i < this.data.add_estimate.taxList.length; i++) {
        if (this.data.add_estimate.taxList[i]) {
          if (isNaN(parseFloat(this.data.add_estimate.taxList[i].percentage)))
            this.data.add_estimate.taxList[i].percentage = 0
          //console.log("090"+parseFloat(this.data.invoice.taxList[i].percentage))
          this.data.add_estimate.taxList[i].calculateValue = (parseFloat(this.data.add_estimate.taxList[i].percentage) * discountTotal) / 100
          this.data.add_estimate.taxList[i].selected = true
          temp_tax_rate = temp_tax_rate + (parseFloat(this.data.add_estimate.taxList[i].percentage) * discountTotal) / 100
        }
      }
      tax_rate = tax_rate + temp_tax_rate
    }

    shippingCharges = this.data.add_estimate.shipping_charges
    if (isNaN(shippingCharges)) {
      shippingCharges = 0
    }
    totalAmount = discountTotal + shippingCharges + tax_rate

    var adjustmentAmount = this.data.add_estimate.adjustment
    if (isNaN(adjustmentAmount)) {
      adjustmentAmount = 0
    }
    finalAmount = totalAmount - adjustmentAmount

    if (isNaN(finalAmount)) {
      finalAmount = 0
    }
    this.data.add_estimate.amount = parseFloat(finalAmount.toFixed(2))
  }

  setTermsList(term) {
    var index23 = this.terms.filter(pro => pro.enabled == 0).findIndex(temp => temp.uniqueKeyTerms == term.uniqueKeyTerms)
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
      var index26 = this.termList.findIndex(tmp => tmp.unique_identifier == term.uniqueKeyTerms)
      this.termList.splice(index26, 1)
    }
  }

  removeItem(index) {
    // var status = -1
    // for (var i = 0; i < this.data.add_estimate.listItems.length; i++) {
    //   var temProName = angular.lowercase(index.product_name)
    //   var temProName1 = angular.lowercase(this.data.add_estimate.listItems[i].product_name)
    //   if (temProName == temProName1) {
    //     status = i
    //     break
    //   }
    // }
    // console.log(index, this.data.add_estimate.listItems)
    this.data.add_estimate.listItems.splice(index, 1)
    this.calculateEstimate(1)
  }

  // showMe() {
  //   this.show = true
  //   this.tempflag = true
  // }

  // hideMe() {
  //   this.data.add_estimate.discount = 0
  //   this.data.add_estimate.percentage_value = 0
  //   this.calculateEstimate(1)
  //   this.show = false
  //   this.tempflag = false
  // }

  // showMeAdjustment() {
  //   this.show_adjustment = true
  // }

  // hideMeAdjustment() {
  //   this.data.add_estimate.adjustment = 0
  //   this.calculateEstimate(1)

  //   this.show_adjustment = false
  // }

  // showMeTax() {
  //   this.show_tax_input = true
  //   this.tempflagTax = true
  // }

  // showMeMultipleTax(index) {
  //   //console.log("showmultiple",this.data.invoice.taxList[index],$rootScope.authenticated.setting.alstTaxName[index])
  //   var tempIndex = this.data.add_estimate.taxList.length
  //   this.data.add_estimate.taxList[tempIndex] = {}
  //   this.data.add_estimate.taxList[tempIndex].taxName = $rootScope.authenticated.setting.alstTaxName[index].taxName
  //   this.data.add_estimate.taxList[tempIndex].selected = true
  //   this.multi_tax_index.push(index)
  //   this.show_tax_input_list[index] = true
  //   this.tempflagTaxList[index] = true
  // }

  // hideMeTax() {
  //   this.data.add_estimate.tax_rate = 0
  //   this.calculateEstimate(1)
  //   this.show_tax_input = false
  //   this.tempflagTax = false
  // }

  // hideMeTaxMultiple(index) {
  //   this.data.add_estimate.tax_rate = 0
  //   this.multi_tax_index.splice(index, 1)
  //   this.data.add_estimate.taxList.splice(index, 1)
  //   this.calculateEstimate(index)
  //   //this.show_tax_input_list[index] = false
  //   this.tempflagTaxList[index] = false
  // }

  // showMeShipping() {
  //   this.show_shipping_charge = true
  //   this.tempflagShipping = true
  // }

  // hideMeShipping() {
  //   this.data.add_estimate.shipping_charges = 0
  //   this.calculateEstimate(1)

  //   this.show_shipping_charge = false
  //   this.tempflagShipping = false
  // }

  // multiTaxButtonForAddEstimate(taxname, index) {
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

  save(status) {
    // $rootScope.pro_bar_load = false
    // $('#estSubmitBtn').button('loading')

    var createdTime = new Date()
    createdTime.setTime(parseInt(this.data.add_estimate.created_date))
    this.data.add_estimate.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

    this.data.add_estimate.organization_id = this.user.user.orgId
    this.data.add_estimate.termsAndConditions = this.termList
    var update_status = 0
    var estimate_id = null
    for (var i = this.data.add_estimate.listItems.length; i > 0; i--) {
      this.data.add_estimate.listItems[i - 1].unique_key_fk_quotation = this.data.add_estimate.unique_identifier
      if (!this.data.add_estimate.listItems[i - 1].product_name || this.data.add_estimate.listItems[i - 1].product_name == '') {
        this.data.add_estimate.listItems.splice(i - 1, 1)
      }
    }
    var tempIndexName1 = this.repos.findIndex(repo => repo.name == this.billingTo.value)

    if (this.data.add_estimate.listItems.length !== 0 && tempIndexName1 !== -1) {
      if (status) {
        this.data.add_estimate.unique_identifier = generateUUID(this.user.user.orgId)

        for (var j = 0; j < this.data.add_estimate.termsAndConditions.length; j++) {
          this.data.add_estimate.termsAndConditions[j].unique_key_fk_quotation = this.data.add_estimate.unique_identifier
        }
        if (this.addProductList.length > 0) {
          // this.saveProduct(this.addProductList)
        }

        var d = new Date()
        this.data.add_estimate.device_modified_on = d.getTime()
        this.estimateService.add([this.data.add_estimate]).subscribe((result: any) => {
          // $('#estSubmitBtn').button('reset')
          // $rootScope.pro_bar_load = true
          if (result.status !== 200) {
            alert('Some error occurred, please try again!')
            // $('button[type="submit"]').button('reset')
          } else if (result.status === 200) {
            // this.clientList = DataStore.clientsList
            alert('estimate added successfully!')
            for (var j = 0; j < this.clientList.length; j++) {
              if (result.quotationList[0].unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
                result.quotationList[0].orgName = this.clientList[j].name
              }
            }
            var tempCh = changeEstimate(result.quotationList[0])
            //console.log("ff",tempCh,result.data.quotationList[0] )
            // DataStore.pushEstimateList(tempCh)
            // this.routeParams.invId = tempCh.unique_identifier

            this.tempQuaNoOnAdd = this.tempQuaNoOnAdd + 1
            // this.updateSettings()
            //$location.path('/estimate/view/'+result.data.quotationList[0].unique_identifier)
            // notifications.showSuccess({ message: 'Success', hideDelay: 1500, hide: true })
            // this.routeParams.estId = tempCh.unique_identifier
            // this.getEstimate(tempCh.unique_identifier, 0)
            // $rootScope.pro_bar_load = true
          }
          // this.filterClient = ''
        })
      }
      else {
        // $('#estSubmitBtn').button('reset')
        // $rootScope.pro_bar_load = true
        // alert("Form not valid")
        // notifications.showError({ message: 'Form not valid', hideDelay: 1500, hide: true })
      }
    } else {
      if (tempIndexName1 == -1) {
        this.searchText = ''
        // notifications.showError({ message: 'Select your client!', hideDelay: 1500, hide: true })
        // $rootScope.pro_bar_load = true
        // $('#estSubmitBtn').button('reset')
        alert('client not selected!')
        console.log('client not selected', this.billingTo.value)
      } else {
        // $rootScope.pro_bar_load = true
        // $('#estSubmitBtn').button('reset')
        // notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true })
      }
    }
  }

  // saveProduct(add_product_list) {
  //   var d = new Date()
  //   var deleteIndexArray = []
  //   for (var i = 0; i < add_product_list.length; i++) {
  //     var uniqueIdProduct = this.data.add_estimate.listItems.findIndex(
  //       item => item.unique_key_fk_product == add_product_list[i].unique_identifier
  //     )

  //     if (uniqueIdProduct !== -1) {
  //       add_product_list[i].device_modified_on = d.getTime()
  //       add_product_list[i].rate = this.data.add_estimate.listItems[uniqueIdProduct].rate
  //       add_product_list[i].unit = ""
  //       add_product_list[i].discription = this.data.add_estimate.listItems[uniqueIdProduct].description
  //     } else {
  //       deleteIndexArray.push(i)
  //     }
  //   }
  //   for (var j = 0; j < deleteIndexArray.length; j++) {
  //     add_product_list.splice(deleteIndexArray[j], 1)
  //   }
  //   this.productService.add(add_product_list).subscribe((result: response) => {
  //     if (result.status === 200) {
  //       var tempProAdded = {
  //         "buyPrice": result.productList[0].buy_price,
  //         "deviceCreatedDate": result.productList[0].device_modified_on,
  //         "discription": result.productList[0].discription,
  //         "enabled": result.productList[0].deleted_flag,
  //         "inventoryEnabled": result.productList[0].inventory_enabled,
  //         "modifiedDate": result.productList[0].epoch,
  //         "openingStock": result.productList[0].opening_stock,
  //         "prodLocalId": result.productList[0]._id,
  //         "prodName": result.productList[0].prod_name,
  //         "productCode": result.productList.productCode,
  //         "rate": result.productList[0].rate,
  //         "remainingStock": result.productList[0].remaining_stock,
  //         "serverOrgId": result.productList[0].organization_id,
  //         "serverUpdateTime": result.productList[0].serverUpdateTime,
  //         "taxRate": result.productList[0].tax_rate,
  //         "uniqueKeyProduct": result.productList[0].unique_identifier,
  //         "unit": result.productList[0].unit
  //       }
  //       // DataStore.pushProductList(tempProAdded)
  //     } else {
  //       // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
  //     }
  //   })
  // }

  // updateSettings() {
  //   this.settings1 = {}

  //   this.settingService.fetch().subscribe((response: response) => {

  //     if (response.status == 200) {
  //       this.settings1 = response.settings.appSettings
  //       console.log("fgfg", $rootScope.tempQuaNoOnAdd)
  //       this.settings1.androidSettings.quotNo = parseInt($rootScope.tempQuaNoOnAdd) - 1
  //       this.settingService.add(this.settings1).subscribe((response: response) => {

  //         if (response.status == 200) {
  //           var settings = this.settings1

  //           /****** locale code will go here ******/
  //           // if (settings != null) {
  //           //   $rootScope.settings = this.settings1.androidSettings

  //           //   if (settings.numberFormat === "###,###,###.00") {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern1'

  //           //   } else if (settings.numberFormat === "##,##,##,###.00") {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
  //           //     //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
  //           //     //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern2'

  //           //   } else if (settings.numberFormat === "###.###.###,00") {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern1'

  //           //   } else if (settings.numberFormat === "##.##.##.###,00") {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
  //           //     //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
  //           //     //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern2'

  //           //   } else if (settings.numberFormat === "### ### ###,00") {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = settings.decimalSeperator
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = settings.commaSeperator
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern1'

  //           //   } else {
  //           //     $locale.NUMBER_FORMATS.DECIMAL_SEP = "."
  //           //     $locale.NUMBER_FORMATS.GROUP_SEP = ","
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
  //           //     $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
  //           //     $rootScope.settings.currency_pattern = 'pattern1'
  //           //   }
  //           //   if (settings.dateDDMMYY === false) {
  //           //     $locale.DATETIME_FORMATS.mediumDate = "MM-dd-yyyy"
  //           //     $rootScope.settings.date_format = 'mm-dd-yy'
  //           //   } else if (settings.dateDDMMYY === true) {
  //           //     $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
  //           //     $rootScope.settings.date_format = 'dd-mm-yy'
  //           //   }

  //           //   if (settings.currencyInText != "" && typeof settings.currencyInText !== 'undefined') {
  //           //     $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.currencySymbol(settings.currencyInText)
  //           //     $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
  //           //   } else {
  //           //     $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
  //           //     //$rootScope.authenticated.setting = {}
  //           //     //$rootScope.authenticated.setting.currency_symbol = $locale.NUMBER_FORMATS.CURRENCY_SYM
  //           //   }
  //           // } else {
  //           //   $rootScope.authenticated.setting = {}
  //           //   if ($rootScope.authenticated)
  //           //     $rootScope.authenticated.setting.date_format = true
  //           //   $rootScope.settings.date_format = 'dd-mm-yy'
  //           //   $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
  //           //   $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM
  //           //   $rootScope.settings.alstTaxName = []
  //           // }
  //         }
  //         else {

  //         }
  //         // $('#updateButton').button('reset')
  //       })
  //     }
  //   })
  // }

  // addTerm() {
  //   $('#add-terms').modal('show')
  // }

  // close() {
  //   $('#add-terms').modal('hide')
  // }

  // addClient(name) {
  //   //console.log('add new client',name)
  //   this.client.client = {}
  //   this.addClientModal = {}
  //   this.client.client.address_line1 = ''
  //   this.client.client.email = ''
  //   this.client.client.number = ''
  //   this.client.client.name = name
  //   $('#add-client').modal('show')
  //   $('#add-client').on('shown.bs.modal', function (e) {
  //     $('#add-client input[type="text"]')[1].select()
  //   })
  // }

  // closeClient() {
  //   //alert('closed!!')
  //   $("#loadb").css("display", "none")
  //   $('#add-client').modal('hide')

  //   this.client.client = {}

  //   //this.client_display.addressLine1 = ''
  //   this.addClientModal = {}
  //   this.data.add_estimate.unique_key_fk_client = 0

  //   $('#refreshClient').addClass('rotator')

  //   this.searchText = ''
  //   this.clientform.$setUntouched()
  //   // this.repos = DataStore.clientsList
  //   $("#loadb").css("display", "none")
  // }

  // saveClient(data, status) {
  //   $('#saveClientButton').button('loading')
  //   var baseURL = Data.getBaseUrl()
  //   if (status) {
  //     this.client.client.contact_person_name = this.addClientModal.contact_person_name
  //     this.client.client.email = this.addClientModal.email
  //     this.client.client.number = this.addClientModal.number
  //     this.client.client.address_line1 = this.addClientModal.address_line1
  //     this.client.client.shipping_address = this.addClientModal.shipping_address
  //     this.client.client.business_detail = this.addClientModal.business_detail
  //     this.client.client.business_id = this.addClientModal.business_id

  //     this.client.client.unique_identifier = utility.generateUUID()
  //     var d = new Date()
  //     this.client.client.device_modified_on = d.getTime()
  //     this.client.client.organization_id = $rootScope.authenticated.user.orgId
  //     this.data.add_estimate.unique_key_fk_client = this.client.client.unique_identifier

  //     this.clientService.add([this.client.client]).subscribe((response: response) => {
  //       if (response.status === 200) {
  //         $('#refreshClient').addClass('rotator')
  //         this.clientService.fetch().subscribe((response: response) => {
  //           this.clients = response.records

  //           this.data.add_estimate.unique_key_fk_client = this.client.client.unique_identifier
  //           this.repos = response.records.map((repo: {name: string, value: string}) => {
  //             repo.value = repo.name.toLowerCase()
  //             return repo
  //           })
  //           this.repos = this.repos.filter(clien => clien.enabled == 0)

  //           for (var l = 0; l < this.clients.length; l++) {
  //             if (this.clients[l].uniqueKeyClient === this.client.client.unique_identifier) {
  //               this.selectedItem = this.clients[l]
  //             }
  //           }
  //           this.searchText = this.client.client.name
  //           this.clientValidation = true
  //           this.showClientError = false

  //           //$('#refreshClient').removeClass('rotator')
  //           // $('#saveClientButton').button('reset')

  //         })
  //         $('#add-client').modal('hide')
  //         //this.data.invoice.unique_key_fk_client = this.client.client.unique_identifier
  //       }
  //       else {
  //         //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
  //       }
  //     })
  //   }
  // }

  greaterThan(prop, val) {
    return function (item) {
      return item[prop] > val
    }
  }

  // assignClientId(client_id) {
  //   this.estimate.client_id = client_id
  // }

  addRow() {
    this.estimateItems.push({
      "id": null,
      "product_id": null,
      "estimate_id": "",
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

    for (var i = 0; i < this.estimateItems.length; i++) {
      var item = this.estimateItems[i]
      total += parseFloat(item.total)
    }
    // this.data.estimate.total = total
  }

  // goEdit(uniqueIdentity) {
  //   $('#editBtn').button('loading')
  //   $('#updateButton').button('loading')

  //   //$location.path('/invoice/edit/' + this.invoice.unique_identifier)
  //   $('#msgInv').removeClass("show")
  //   $('#msgInv').addClass("hide")
  //   $('#estMain').removeClass("show")
  //   $('#estMain').addClass("hide")
  //   $('#editEst').removeClass("hide")
  //   $('#editEst').addClass('show')
  //   this.filterClient = ''
  //   this.editTempInitializer(uniqueIdentity)
  // }

  // goNew() {
  //   this.filterClient = ''
  //   $('#msgInv').removeClass("hide")
  //   $('#msgInv').addClass("show")
  //   $('#estMain').removeClass("show")
  //   $('#estMain').addClass("hide")
  //   $('#editEst').removeClass("show")
  //   $('#editEst').addClass('hide')
  //   this.checked = false

  //   this.reloadCreateEstimate()
  // }

  loadMore() {
    this.clientDisplayLimit += 10
  }

  // printODownloadEstimate(estimateId, type) {

  //   Data.get('estimate/get-pdf?estimateId=' + estimateId + '&type=' + type + '&timeZone=' + $rootScope.timeZone + '&accessToken=' + $rootScope.settings.dropbox_token, { responseType: 'arraybuffer' }).then(function (result) {
  //     //console.log(result)

  //     var a = window.document.createElement('a')

  //     a.href = window.URL.createObjectURL(new Blob([result], {
  //       type: 'application/pdf'
  //     }))

  //     // Append anchor to body.
  //     document.body.appendChild(a)
  //     // a.download = this.getFileName(estimateId)
  //     a.click()
  //   })

  // }

  // downloadEstimate(estimateId, type, mode) {
  //   if (mode == "download") {
  //     $('#downloadBtn').button('loading')
  //   }
  //   else if (mode == "preview") {
  //     $('#previewBtn').button('loading')
  //   }

  //   var id = this.data.estimate.unique_identifier
  //   this.estimateService.fetchPdf(id).subscribe((result: response) => {

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
  //       a.download = this.getFileName(estimateId)
  //       a.click()
  //       // $('#downloadBtn').button('reset')
  //     }
  //     else if (mode == "preview") {
  //       window.open(a)
  //       // $('#previewBtn').button('reset')
  //     }
  //   })

  // }

  // getFileName(estimateId) {
  //   var day = (new Date()).getDate() <= 9 ? '0' + (new Date()).getDate() : (new Date()).getDate()
  //   var month = this.findMonth((new Date()).getMonth())
  //   var year = (new Date()).getFullYear()
  //   var time = getTime()

  //   function getTime() {
  //     var hour = (new Date()).getHours() < 13 ? (new Date()).getHours() : ((new Date()).getHours() - 12)
  //     hour = hour < 10 ? '0' + hour.toString() : hour.toString()
  //     var min = (new Date()).getMinutes() < 10 ? '0' + (new Date()).getMinutes() : (new Date()).getMinutes()
  //     return hour + min
  //   }

  //   //console.log(time)

  //   var ampm = (new Date()).getHours() < 12 ? 'AM' : 'PM'

  //   // eg: INVPDF_INV_21_02Dec2015_1151AM
  //   return 'ESTPDF_EST_' + this.data.estimate.estimate_number + '_' + day + month + year + '_' + time + ampm + '.pdf'
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

  // generateInvoice(estimateId, invoiceId) {
  //   //console.log(invoiceId)
  //   console.log(estimateId)

  //   Data.get('invoice/create-estimated-invoice?estimateId=' + estimateId).then(function (result) {
  //     //console.log('This is the result: ', result)
  //     if (result.status == 200) {
  //       notifications.showSuccess({ message: 'Successfully added invoice!', hideDelay: 1500, hide: true })

  //       // alert('Successfully added invoice!')
  //       $location.path('/invoice/edit/' + result.id)
  //     }
  //   })
  // }

  // editTempInitializer(uniqueIdentity) {
  //   this.uniqueIdentityTemp = uniqueIdentity
  //   this.show_tax_input_list_edit = []
  //   this.tempflagTaxListEdit = []
  //   this.terms_edit = []

  //   this.tempItemList = []
  //   this.tempTermList = []

  //   this.selected_product_id_edit = []
  //   this.temp_payment_edit = {}

  //   this.loaded = false
  //   $rootScope.pro_bar_load = false
  //   var settings = $rootScope.authenticated.setting
  //   if (settings.dateDDMMYY === false) {
  //     $rootScope.settings.date_format = 'mm-dd-yy'
  //   } else if (settings.dateDDMMYY === true) {
  //     $rootScope.settings.date_format = 'dd-mm-yy'
  //   }
  //   this.editdata.estimate.taxList = []
  //   this.show_tax_input_list = []
  //   this.tempflagTaxList = []
  //   this.editdata.estimate.termsAndConditions = []
  //   //this.clientsLocal = []
  //   this.selectedEstimate = findObjectIndex($rootScope.estimates, 'unique_identifier', this.routeParams.estimateId)
  //   // DataStore.initializer([])
  //   // DataStore.productsList.length == 0
  //   if (1) {
  //     this.productService.fetch().subscribe((response: response) => {
  //       if (response.records != null) {
  //         this.productList = response.records.filter(pro => pro.enabled == 0)
  //       }
  //     })
  //   } else {
  //     // this.productList = DataStore.productsList
  //   }
  //   this.estimateService.fetchById([uniqueIdentity]).subscribe((result: response) => {
  //     if (result.status == 200) {
  //       this.editdata.estimate = result.records[0]
  //       this.clientService.fetchById({
  //         "idList": [this.editdata.estimate.unique_key_fk_client]
  //       }).subscribe((response: response) => {
  //         this.clientsLocal = response.records

  //         $('#editBtn').button('reset')
  //         $('#updateButton').button('reset')
  //         this.loaded = true
  //         $rootScope.pro_bar_load = true
  //       })

  //       if (this.editdata.estimate.taxList) {
  //         if (this.editdata.estimate.taxList.length > 0) {
  //           this.showMultipleTaxEdit = true
  //           for (var i = this.editdata.estimate.taxList.length; i > 0; i--) {
  //             this.show_tax_input_list[i - 1] = true
  //             if (!(this.editdata.estimate.taxList[i - 1].percentage > 0))
  //               this.editdata.estimate.taxList.splice(i - 1, 1)
  //           }
  //         } else {
  //           this.showMultipleTaxEdit = false
  //         }
  //       } else if ($rootScope.settings.alstTaxName) {
  //         this.temp_tax_flag_edit = true
  //         if ($rootScope.settings.alstTaxName.length > 0) {
  //           this.showMultipleTaxEdit = true
  //         } else {
  //           this.showMultipleTaxEdit = false
  //         }
  //       } else {
  //         this.temp_tax_flag_edit = true
  //         this.showMultipleTaxEdit = false
  //       }
  //       /**
  //        * interchanging keys
  //        * */
  //       this.temEstimate = {
  //         'unique_key_fk_client': this.editdata.estimate.unique_key_fk_client,
  //         'unique_identifier': this.editdata.estimate.unique_identifier,
  //         'serverUpdateTime': this.editdata.estimate.serverUpdateTime,
  //         '_id': this.editdata.estimate.localId,
  //         'local_client_id': this.editdata.estimate.localClientId,
  //         'estimate_number': this.editdata.estimate.quetationNo,
  //         'amount': this.editdata.estimate.amount,
  //         'discount': this.editdata.estimate.discount,
  //         'organization_id': this.editdata.estimate.organizationId,
  //         'created_date': this.editdata.estimate.createDate,
  //         'deleted_flag': this.editdata.estimate.enabled,
  //         'epoch': this.editdata.estimate.epochTime,
  //         'shipping_address': this.editdata.estimate.shippingAddress,
  //         'percentage_flag': this.editdata.estimate.discountFlag,
  //         'percentage_value': this.editdata.estimate.percentageValue,
  //         'adjustment': this.editdata.estimate.adjustment,
  //         'shipping_charges': this.editdata.estimate.shippingCharges,
  //         'gross_amount': this.editdata.estimate.grossAmount,
  //         'discount_on_item': this.editdata.estimate.assignDiscountFlag,
  //         'tax_on_item': this.editdata.estimate.assignTaxFlag,
  //         'tax_rate': this.editdata.estimate.taxrate,
  //         'tax_amount': this.editdata.estimate.taxAmt,
  //         'device_modified_on': this.editdata.estimate.deviceCreatedDate,
  //         'client_id': this.editdata.estimate.serverClientId,
  //         'push_flag': this.editdata.estimate.pushFlag,
  //         'deletedItems': this.editdata.estimate.deleteQuoProductIds,
  //         'deletedTerms': this.editdata.estimate.deleteQuoTermsIds,
  //         'listItems': this.editdata.estimate.alstQuotProduct,
  //         'termsAndConditions': this.editdata.estimate.alstQuotTermsCondition
  //       }

  //       for (var j = 0; j < this.editdata.estimate.alstQuotProduct.length; j++) {
  //         var temp = {
  //           'unique_identifier': this.editdata.estimate.alstQuotProduct[j].uniqueKeyQuotationProduct,
  //           'product_name': this.editdata.estimate.alstQuotProduct[j].productName,
  //           'description': this.editdata.estimate.alstQuotProduct[j].description == null ? '' : this.editdata.estimate.alstQuotProduct[j].description,
  //           'quantity': this.editdata.estimate.alstQuotProduct[j].qty,
  //           /*'inventory_enabled':this.productList[index].inventoryEnabled,*/
  //           'unit': this.editdata.estimate.alstQuotProduct[j].unit,
  //           'rate': this.editdata.estimate.alstQuotProduct[j].rate,
  //           'discount': this.editdata.estimate.alstQuotProduct[j].discountRate,
  //           'tax_rate': this.editdata.estimate.alstQuotProduct[j].taxRate,
  //           'total': this.editdata.estimate.alstQuotProduct[j].price,
  //           'discount_amount': this.editdata.estimate.alstQuotProduct[j].discountAmt,
  //           'tax_amount': this.editdata.estimate.alstQuotProduct[j].taxAmount,
  //           'unique_key_fk_product': this.editdata.estimate.alstQuotProduct[j].uniqueKeyFKProduct,
  //           'unique_key_fk_quotation': this.editdata.estimate.unique_identifier

  //         }
  //         this.tempItemList.push(temp)

  //       }
  //       if (!isNaN(this.editdata.estimate.alstQuotTermsCondition && !this.editdata.estimate.alstQuotTermsCondition == null
  //         && this.editdata.estimate.alstQuotTermsCondition.isEmpty())) {
  //         for (var i = 0; i < this.editdata.estimate.alstQuotTermsCondition.length; i++) {
  //           var temp = {
  //             "terms_condition": this.editdata.estimate.alstQuotTermsCondition[i].termsConditionText,
  //             "_id": this.editdata.estimate.alstQuotTermsCondition[i].localId,
  //             "local_quotation_id": this.editdata.estimate.alstQuotTermsCondition[i].localQuotationId,
  //             "estimate_id": this.editdata.estimate.alstQuotTermsCondition[i].serverQuotationId,
  //             "organization_id": this.editdata.estimate.alstQuotTermsCondition[i].orgId,
  //             "unique_identifier": this.editdata.estimate.alstQuotTermsCondition[i].uniqueKeyQuotTerms,
  //             "unique_key_fk_quotation": this.editdata.estimate.alstQuotTermsCondition[i].uniqueKeyFKQuotation

  //           }
  //           this.tempTermList.push(temp)

  //           // this.deleteTerm = result[i]
  //           // this.index = i
  //           // console.log(result[i], i)
  //         }
  //       }
  //       if (this.editdata.estimate.taxList)
  //         this.temEstimate.taxList = this.editdata.estimate.taxList

  //       this.deleteEstimateData = Object.assign({}, this.temEstimate)
  //       this.deleteEstimateData.listItems = this.tempItemList
  //       this.deleteEstimateData.termsAndConditions = this.tempTermList
  //       delete this.deleteEstimateData.orgName

  //       this.editdata.estimate = this.temEstimate
  //       this.existingItem = this.tempItemList
  //       this.editdata.estimate.listItems = []

  //       this.editdata.estimate.termsAndConditions = this.tempTermList
  //       // DataStore.termsList.length == 0
  //       if (1) {
  //         this.termConditionService.fetch().subscribe((response: response) => {
  //           this.terms_edit = response.termsAndConditionList
  //           this.termListEdit = []
  //           for (var i = 0; i < this.terms_edit.length; i++) {
  //             for (var j = 0; j < this.editdata.estimate.termsAndConditions.length; j++) {
  //               if (this.terms_edit[i].terms == this.editdata.estimate.termsAndConditions[j].terms_condition && this.terms_edit[i].enabled == 0) {
  //                 this.terms_edit[i].setDefault = 'DEFAULT'
  //                 break
  //               } else {
  //                 this.terms_edit[i].setDefault = ''
  //               }
  //             }
  //             if (this.editdata.estimate.termsAndConditions.length == 0) {
  //               this.terms_edit[i].setDefault = ''
  //             }
  //             if (this.terms_edit[i].setDefault == 'DEFAULT') {
  //               var temp = {
  //                 "_id": this.terms_edit[i].serverTermCondId,
  //                 "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
  //                 "organization_id": this.terms_edit[i].orgId,
  //                 "terms_condition": this.terms_edit[i].terms
  //               }
  //               this.termListEdit.push(temp)
  //             }
  //           }
  //         })
  //       } else {
  //         // this.terms_edit = JSON.parse(JSON.stringify(DataStore.termsList))
  //         this.termListEdit = []
  //         for (var i = 0; i < this.terms_edit.length; i++) {
  //           for (var j = 0; j < this.editdata.estimate.termsAndConditions.length; j++) {
  //             if (this.terms_edit[i].terms == this.editdata.estimate.termsAndConditions[j].terms_condition && this.terms_edit[i].enabled == 0) {
  //               this.terms_edit[i].setDefault = 'DEFAULT'
  //               break
  //             } else {
  //               this.terms_edit[i].setDefault = ''
  //             }
  //           }
  //           if (this.editdata.estimate.termsAndConditions.length == 0) {
  //             this.terms_edit[i].setDefault = ''
  //           }
  //           if (this.terms_edit[i].setDefault == 'DEFAULT') {
  //             var temp = {
  //               "_id": this.terms_edit[i].serverTermCondId,
  //               "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
  //               "organization_id": this.terms_edit[i].orgId,
  //               "terms_condition": this.terms_edit[i].terms
  //             }
  //             this.termListEdit.push(temp)
  //           }
  //         }
  //       }

  //       this.estimateDateEdit = $filter('date')(this.editdata.estimate.created_date)

  //       if ($rootScope.settings.date_format === 'dd-mm-yy') {
  //         this.editdata.estimate.created_date = (new Date(this.estimateDateEdit.split('-')[2], parseInt(this.estimateDateEdit.split('-')[1]) - 1, this.estimateDateEdit.split('-')[0])).getTime()
  //       } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
  //         this.editdata.estimate.created_date = (new Date(this.estimateDateEdit.split('-')[2], parseInt(this.estimateDateEdit.split('-')[0]) - 1, this.estimateDateEdit.split('-')[1])).getTime()
  //       }

  //       if (result) {
  //         this.estimatenumber = this.editdata.estimate.estimate_number
  //         //this.estimatedate = $filter('date')(result.created_date, 'yyyy-mm-dd')
  //         //this.duedate = $filter('date')(result.due_date, 'yyyy-mm-dd')
  //       }

  //       if (this.editdata.estimate.discount_on_item == 1) {
  //         this.discount_on_edit = 'onItem'
  //         this.discounttext = "discount (on item)"
  //       } else if (this.editdata.estimate.discount_on_item == 0 && (this.editdata.estimate.percentage_value > 0 || this.editdata.estimate.discount > 0)) {
  //         this.discount_on_edit = 'onBill'
  //         this.discounttext = "discount (on bill)"
  //         this.show_discount_edit = true
  //       } else {
  //         this.discount_on_edit = 'disabled'
  //         this.discounttext = "discount (on disabled)"
  //         this.show_discount_edit = false
  //       }


  //       if (this.editdata.estimate.tax_on_item == 0) {
  //         this.tax_on_edit = 'taxOnItem'
  //         this.taxtext = "tax (on item)"

  //       } else if (this.editdata.estimate.tax_on_item == 1 && this.editdata.estimate.tax_rate > 0) {
  //         this.tax_on_edit = 'taxOnBill'
  //         this.taxtext = "tax (on bill)"
  //         this.show_tax_input_edit = true
  //       } else {
  //         this.tax_on_edit = 'taxDisabled'
  //         this.taxtext = "tax (on disabled)"
  //         this.show_tax_input_edit = false
  //       }
  //       //console.log("in services client :" + JSON.stringify(this.clientsLocal))
  //     }

  //     if (this.editdata.estimate.shipping_charges && this.editdata.estimate.shipping_charges > 0)
  //       this.show_shipping_charge_edit = true

  //     if (this.editdata.estimate.percentage_flag && this.editdata.estimate.percentage_flag == 1)
  //       this.isRateEdit = true
  //     else
  //       this.isRateEdit = false
  //   })
  //   // DataStore.estimatesList.length == 0
  //   if (1) {
  //     this.estimateService.fetch().subscribe((result: response) => {
  //       this.estimates = result.records.filter(est => est.enabled == 0)

  //       this.clientService.fetch().subscribe((response: response) => {
  //         this.clientList = response.records
  //         for (var i = 0; i < this.estimates.length; i++) {
  //           for (var j = 0; j < this.clientList.length; j++) {
  //             if (this.estimates[i].unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
  //               this.estimates[i].orgName = this.clientList[j].name
  //             }
  //           }
  //         }
  //       })
  //     })
  //   } else {
  //     // this.estimates = DataStore.estimatesList
  //   }
  // }

  // removeItemEdit(index) {
  //   var itemId = this.editdata.estimate.listItems[index].unique_key_fk_product
  //   this.selected_product_id_edit.splice(index, 1)
  //   this.editdata.estimate.listItems.splice(index, 1)
  //   // $('#prod' + highlightedIndex).removeClass('selected')
  //   this.calculateEstimateEdit(1)

  //   //}
  // }

  // calculateEstimateEdit(indexTaxMultiple) {

  //   var total = 0

  //   for (var i = 0; i < this.editdata.estimate.listItems.length; i++) {
  //     if (this.editdata.estimate.listItems[i].deleted_flag != 1) {
  //       var item = this.editdata.estimate.listItems[i]
  //       total += parseFloat(item.total)
  //     }
  //   }
  //   for (var i = 0; i < this.existingItem.length; i++) {

  //     if (this.existingItem.deleted_flag != 1) {
  //       var item = this.existingItem[i]
  //       total += parseFloat(item.total)
  //     }
  //   }
  //   this.editdata.estimate.gross_amount = total

  //   var grossAmount = total
  //   var discountTotal = 0
  //   var finalAmount = 0
  //   var shippingCharges = 0
  //   var totalAmount = 0
  //   var discoutAmount = 0
  //   var tax_rate = 0

  //   if (this.editdata.estimate.percentage_flag == 1) {
  //     var discountPercent = parseFloat(this.editdata.estimate.percentage_value) / 100
  //     if (isNaN(discountPercent)) {
  //       discountPercent = 0
  //     }
  //     discoutAmount = discountPercent * grossAmount

  //     this.editdata.estimate.discount = discoutAmount
  //     discountTotal = grossAmount - discoutAmount


  //   } else if (this.editdata.estimate.percentage_flag == 0) {
  //     var estimateDiscount = parseFloat(this.editdata.estimate.discount)

  //     if (isNaN(estimateDiscount)) {
  //       estimateDiscount = 0
  //     }
  //     discountTotal = grossAmount - estimateDiscount

  //     var discountAmount = (parseFloat(this.editdata.estimate.discount) / grossAmount) * 100
  //     if (isNaN(discountAmount)) {
  //       discountAmount = 0
  //     }
  //     this.editdata.estimate.percentage_value = discountAmount

  //   }

  //   if (this.tax_on == 'taxOnBill') {
  //     tax_rate = (parseFloat(this.editdata.estimate.tax_rate) * discountTotal) / 100
  //     if (isNaN(tax_rate)) {
  //       tax_rate = 0
  //     }
  //     // console.log("tax_ rate bill", tax_rate)
  //   }
  //   if (indexTaxMultiple) {
  //     //console.log("indexmultiple in",indexTaxMultiple,this.data.invoice.taxList)
  //     var temp_tax_rate = 0
  //     if (this.editdata.estimate.taxList) {
  //       for (var i = 0; i < this.editdata.estimate.taxList.length; i++) {
  //         if (this.editdata.estimate.taxList[i]) {
  //           if (isNaN(parseFloat(this.editdata.estimate.taxList[i].percentage)))
  //             this.editdata.estimate.taxList[i].percentage = 0
  //           //console.log("090" + parseFloat(this.data.invoice.taxList[i].percentage))
  //           this.editdata.estimate.taxList[i].calculateValue = (parseFloat(this.editdata.estimate.taxList[i].percentage) * discountTotal) / 100
  //           this.editdata.estimate.taxList[i].selected = true
  //           temp_tax_rate = temp_tax_rate + (parseFloat(this.editdata.estimate.taxList[i].percentage) * discountTotal) / 100
  //         }
  //       }
  //       tax_rate = tax_rate + temp_tax_rate
  //     }
  //   }

  //   shippingCharges = parseFloat(this.editdata.estimate.shipping_charges)
  //   if (isNaN(shippingCharges)) {
  //     shippingCharges = 0
  //   }
  //   totalAmount = discountTotal + shippingCharges + tax_rate

  //   var adjustmentAmount = parseFloat(this.editdata.estimate.adjustment)
  //   if (isNaN(adjustmentAmount)) {
  //     adjustmentAmount = 0
  //   }
  //   finalAmount = totalAmount - adjustmentAmount

  //   if (isNaN(finalAmount)) {
  //     finalAmount = 0
  //   }
  //   this.editdata.estimate.amount = finalAmount

  // }

  // deleteExistingItemEdit(index) {
  //   this.existingItem.splice(index, 1)
  //   this.calculateEstimateEdit(1)
  // }

  // addLineItemEdit() {
  //   this.editdata.estimate.listItems.push({
  //     'quantity': parseInt(1),
  //     'rate': parseFloat(0.00),
  //     'total': parseFloat(0.00),
  //     'tax_rate': 0,
  //     'discount': 0
  //   })
  // }

  // showMeEdit() {
  //   this.show_discount_edit = true
  //   this.tempflagEdit = true
  // }

  // hideMeEdit() {
  //   this.editdata.estimate.discount = 0
  //   this.editdata.estimate.percentage_value = 0
  //   this.calculateEstimateEdit(1)
  //   this.show_discount_edit = false
  //   this.tempflagEdit = false
  // }

  // showMeTaxEdit() {
  //   this.show_tax_input_edit = true
  //   this.tempflagTaxEdit = true
  // }

  // showMeMultipleTaxEdit(index) {
  //   //console.log("showmultiple",this.data.invoice.taxList,$rootScope.authenticated.setting.alstTaxName,index)
  //   if (!this.editdata.estimate.taxList) {
  //     this.editdata.estimate.taxList = []
  //   }
  //   var indexTax = this.editdata.estimate.taxList.length
  //   this.editdata.estimate.taxList[indexTax] = {}
  //   this.editdata.estimate.taxList[indexTax].taxName = $rootScope.authenticated.setting.alstTaxName[index].taxName
  //   this.show_tax_input_list_edit[indexTax] = true
  //   this.tempflagTaxListEdit[indexTax] = true
  //   this.editdata.estimate.taxList[indexTax].selected = true
  //   //console.log("showmultiple",this.data.invoice.taxList[indexTax],indexTax)
  // }

  // hideMeTaxEdit() {
  //   this.editdata.estimate.tax_rate = 0
  //   this.calculateEstimateEdit()
  //   this.show_tax_input_edit = false
  //   this.tempflagTaxEdit = false
  // }

  // hideMeTaxMultipleEdit(index) {
  //   this.editdata.estimate.tax_rate = 0
  //   this.editdata.estimate.taxList.splice(index, 1)
  //   this.calculateEstimateEdit(1)
  //   this.show_tax_input_list_edit[index] = false
  //   this.tempflagTaxListEdit[index] = false
  //   //console.log("taxList4",this.data.invoice.taxList)
  // }

  // showMeShippingEdit() {
  //   this.show_shipping_charge_edit = true
  //   this.tempflagShippingEdit = true
  // }

  // hideMeShippingEdit() {
  //   this.editdata.estimate.shipping_charges = 0
  //   this.calculateEstimateEdit(1)
  //   this.show_shipping_charge_edit = false
  //   this.tempflagShippingEdit = false
  // }

  // showMeAdjustmentEdit() {
  //   this.show_adjustment_edit = true
  //   this.tempAdjustmentEdit = false
  // }

  // hideMeAdjustmentEdit() {
  //   this.editdata.estimate.adjustment = 0
  //   this.tempAdjustmentEdit = true
  //   this.calculateEstimateEdit(1)

  //   this.show_adjustment_edit = false
  // }

  // addItemEdit(indexTemp, item, selected_product_id) {
  //   console.log("Add item edit", indexTemp, item, selected_product_id)
  //   var index = findObjectIndex(this.productList, 'prodName', selected_product_id)

  //   if (index !== -1) {

  //     item.unique_key_fk_product = this.productList[index].uniqueKeyProduct
  //     item.unique_identifier = utility.generateUUID()
  //     item.product_name = this.productList[index].prodName
  //     item.description = this.productList[index].discription == null ? '' : this.productList[index].discription
  //     item.quantity = 1
  //     item.unit = this.productList[index].unit
  //     item.rate = this.productList[index].rate
  //     //item.discount = this.productList[index].discount
  //     //item.tax_rate = this.productList[index].taxRate
  //     item.tax_rate = 0.00

  //   } else if (selected_product_id !== '' && typeof selected_product_id !== 'undefined') {
  //     var tempProAddFlag = false
  //     var tempSelectedProduct = angular.lowercase(selected_product_id)
  //     var tempProName = ''
  //     var tempMatchPro = {}
  //     for (var k = 0; k < this.productList.length; k++) {
  //       tempProName = angular.lowercase(this.productList[k].prodName)
  //       if (tempSelectedProduct == tempProName) {
  //         tempProAddFlag = true
  //         tempMatchPro = this.productList[k]
  //       }
  //     }
  //     if (!tempProAddFlag) {
  //       item.unique_key_fk_product = utility.generateUUID()
  //       item.unique_identifier = utility.generateUUID()
  //       item.product_name = selected_product_id
  //       item.description = ""
  //       item.quantity = 1
  //       item.unit = ""
  //       item.rate = 0.00
  //       item.discount = 0.00
  //       item.tax_rate = 0.00
  //       /**
  //        * Adding Product to Product List
  //        * */

  //       var d = new Date()
  //       var temp1 = {
  //         'prod_name': item.product_name,
  //         'rate': parseFloat(item.rate),
  //         'tax_rate': item.tax_rate,
  //         //'description' : item.description,
  //         'device_modified_on': d.getTime(),
  //         'organization_id': $rootScope.authenticated.user.orgId,
  //         'unique_identifier': item.unique_key_fk_product

  //       }
  //       this.addProductList.push(temp1)
  //       //console.log("count1",item,temp1,this.addProductList,selected_product_id)
  //     } else {
  //       item.unique_key_fk_product = tempMatchPro.uniqueKeyProduct
  //       item.unique_identifier = utility.generateUUID()
  //       item.product_name = tempMatchPro.prodName
  //       item.description = tempMatchPro.discription
  //       item.quantity = 1
  //       item.unit = tempMatchPro.unit
  //       item.rate = tempMatchPro.rate
  //       //item.discount = this.productList[index].discount
  //       //item.tax_rate = this.productList[index].taxRate
  //       item.tax_rate = 0.00
  //       //console.log("count12",this.productList)
  //     }
  //   } else {
  //     item.description = ""
  //     item.quantity = 1
  //     item.unit = ""
  //     item.rate = 0.00
  //     item.discount = 0.00
  //     item.tax_rate = 0.00
  //   }
  //   this.calculateTotalEdit(this.editdata.estimate.listItems.indexOf(item))

  //   this.calculateEstimateEdit()
  // }

  // calculateTotalEdit(index) {

  //   if (this.editdata.estimate.listItems.length > 0 && typeof this.editdata.estimate.listItems[index].quantity !== "undefined") {

  //     var rateParse = parseFloat(this.editdata.estimate.listItems[index].rate)
  //     if (isNaN(rateParse)) {
  //       rateParse = 0
  //     }
  //     var productRate = (this.editdata.estimate.listItems[index].quantity * rateParse)

  //     if (this.tax_on_edit == 'taxOnItem') {
  //       var taxedAmt = ((this.editdata.estimate.listItems[index].rate * this.editdata.estimate.listItems[index].quantity) * this.editdata.estimate.listItems[index].tax_rate) / 100
  //       if (isNaN(taxedAmt)) {
  //         taxedAmt = 0
  //       }
  //       this.editdata.estimate.listItems[index].tax_amount = taxedAmt
  //       productRate = productRate + taxedAmt
  //     }

  //     if (this.discount_on_edit == 'onItem') {

  //       var discountItem = (productRate * parseFloat(this.editdata.estimate.listItems[index].discount)) / 100
  //       if (isNaN(discountItem)) {
  //         discountItem = 0
  //       }
  //       this.editdata.estimate.listItems[index].discount_amount = discountItem
  //       productRate = productRate - discountItem
  //     }

  //     this.editdata.estimate.listItems[index].total = productRate

  //     this.calculateEstimateEdit()
  //   }
  // }

  // setTermsListEdit(term) {
  //   this.termListEdit = []

  //   var index23 = findObjectIndex(this.terms.filter(function (pro) {
  //     return (pro.enabled == 0)
  //   }), 'uniqueKeyTerms', term.uniqueKeyTerms)

  //   if (term.setDefault == 'DEFAULT') {
  //     term.setDefault = ''
  //     this.editdata.terms[index23] = false
  //   } else {
  //     term.setDefault = 'DEFAULT'
  //     this.editdata.terms[index23] = true
  //   }
  //   if (this.terms_edit !== null && typeof this.terms_edit !== 'undefined') {

  //     for (var i = 0; i < this.terms_edit.length; i++) {

  //       if (this.terms_edit[i].setDefault == 'DEFAULT') {
  //         var temp = {
  //           "_id": this.terms_edit[i].serverTermCondId,
  //           "unique_identifier": this.terms_edit[i].uniqueKeyTerms,
  //           "organization_id": this.terms_edit[i].orgId,
  //           "terms_condition": this.terms_edit[i].terms
  //           //"unique_key_fk_invoice" :
  //         }
  //         this.termListEdit.push(temp)
  //       }
  //     }
  //   }
  // }

  // addTermEdit() {
  //   $('#add-terms-edit').modal('show')
  //   // this.terms = DataStore.termsList
  // }

  // closeEdit() {
  //   $('#add-product, #add-terms-edit,#addPaymentEdit,#addPaymentAddInvoice').modal('hide')
  // }

  // saveEdit(data, status) {
  //   $('#updateButton').button('loading')
  //   this.editdata.estimate.termsAndConditions = this.termListEdit
  //   var createdTime = new Date()
  //   createdTime.setTime(this.editdata.estimate.created_date)
  //   this.editdata.estimate.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

  //   var baseURL = Data.getBaseUrl()
  //   var update_status = 0

  //   var date = new Date()
  //   var currentTime = date.getTime()
  //   data.estimate.device_modified_on = currentTime

  //   for (var i = this.editdata.estimate.listItems.length; i > 0; i--) {
  //     this.editdata.estimate.listItems[i - 1].unique_key_fk_quotation = this.editdata.estimate.unique_identifier
  //     if (!this.editdata.estimate.listItems[i - 1].product_name || this.editdata.estimate.listItems[i - 1].product_name == '') {
  //       this.editdata.estimate.listItems.splice(i - 1, 1)
  //     }
  //   }
  //   var tempNewItem = angular.copy(this.editdata.estimate.listItems)
  //   if (this.existingItem) {
  //     this.editdata.estimate.listItems = []
  //     for (var u = 0; u < this.existingItem.length; u++) {
  //       this.editdata.estimate.listItems.push(this.existingItem[u])
  //     }
  //     for (var m = 0; m < tempNewItem.length; m++) {
  //       this.editdata.estimate.listItems.push(tempNewItem[m])
  //     }
  //   }

  //   if (this.addProductList.length > 0)
  //     this.saveProduct(this.addProductList)


  //   if (status) {

  //     this.estimateService.add([data.estimate]).subscribe((result: response) => {
  //       if (result.status !== 200) {

  //       } else if (result.status === 200) {

  //         update_status++
  //         // notifications.showSuccess({ message: result.data.message, hideDelay: 1500, hide: true })

  //         // var tempInv = DataStore.estimatesList
  //         var indexInv = findObjectIndex(tempInv, "unique_identifier", result.data.quotationList[0].unique_identifier)
  //         var tempCh = changeEstimate(result.data.quotationList[0])

  //         // this.clientList = DataStore.clientsList
  //         for (var j = 0; j < this.clientList.length; j++) {
  //           if (tempCh.unique_key_fk_client == this.clientList[j].uniqueKeyClient) {
  //             tempCh.orgName = this.clientList[j].name
  //           }
  //         }
  //         tempInv.splice(indexInv, 1, tempCh)
  //         // DataStore.addEstimatesList(tempInv)

  //         this.getEstimate(result.data.quotationList[0].unique_identifier, 1)
  //         $rootScope.pro_bar_load = true
  //       }
  //       $('#updateButton').button('reset')
  //     })
  //   }
  //   else {
  //     $('#updateButton').button('reset')
  //     //alert("Form not valid")
  //   }
  // }

  // deleteEstimate(estimateId) {
  //   SweetAlert.swal({
  //     title: "Are you sure want to delete" + this.estimateNumber + "?", //Bold text
  //     type: "warning", //type -- adds appropiriate icon
  //     showCancelButton: true, // displays cancel btton
  //     confirmButtonColor: "#DD6B55",
  //     confirmButtonText: "Yes, delete it!",
  //     closeOnConfirm: true, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
  //     closeOnCancel: true
  //   },
  //     function (isConfirm) { //Function that triggers on user action.
  //       if (isConfirm) {
  //         $('#deleteBtn').button('loading')
  //         this.deleteEstimateData.deleted_flag = 1
  //         var createdTime = new Date()
  //         createdTime.setTime(this.deleteEstimateData.created_date)
  //         this.deleteEstimateData.created_date = createdTime.getFullYear() + '-' + ('0' + (createdTime.getMonth() + 1)).slice(-2) + '-' + ('0' + createdTime.getDate()).slice(-2)

  //         var baseURL = Data.getBaseUrl()


  //         var date = new Date()
  //         var currentTime = date.getTime()
  //         this.deleteEstimateData.device_modified_on = currentTime

  //         this.estimateService.add([this.deleteEstimateData]).subscribe((result: response) => {
  //           if (result.status !== 200) {

  //           } else if (result.status === 200) {
  //             // var tempEst = DataStore.estimatesList
  //             var indexEst = findObjectIndex(tempEst, "unique_identifier", result.data.quotationList[0].unique_identifier)
  //             tempEst.splice(indexEst, 1)
  //             // DataStore.addInvoicesList(tempEst)
  //             this.goNew()

  //             //notifications.showSuccess({message: result.data.message, hideDelay: 1500,hide: true})
  //             //this.data.terms = []
  //             //$location.path('/estimate/view/0')

  //           }
  //           $('#deleteBtn').button('reset')
  //         })

  //       } else {
  //         SweetAlert.swal("Your file is safe!")
  //       }
  //     })
  // }

  // reloadCreateEstimate() {
  //   this.data.add_estimate = {}
  //   this.routeParams.invId = ''
  //   this.data.add_estimate.listItems = []
  //   this.data.add_estimate.listItems.push({
  //     'quantity': parseInt(1),
  //     'unique_identifier': 'new' + this.newItemCounter,
  //     'rate': parseFloat(0.00),
  //     'total': parseFloat(0.00)
  //   })
  //   this.client = {}
  //   this.client.client = {}
  //   this.addProductList = []
  //   this.customDate = true
  //   this.isRate = true
  //   this.dueDate = ""

  //   var d = new Date()
  //   this.searchText = ''
  //   var settings = $rootScope.authenticated.setting
  //   this.data.add_estimate.taxList = []
  //   this.data.add_estimate.percentage_flag = 1
  //   this.tempflag = false
  //   this.tempflagShipping = false
  //   this.tempflagTax = false
  //   this.show_adjustment = false
  //   this.tempflag = false

  //   this.show = false
  //   this.tempflag = false

  //   this.show_tax_input = false
  //   this.tempflagTax = false

  //   this.show_shipping_charge = false
  //   this.tempflagShipping = false
  //   this.show_adjustment = false
  //   this.data.terms = []

  //   if (settings.alstTaxName) {
  //     if (settings.alstTaxName.length > 0) {
  //       this.showMultipleTax = true
  //     } else {
  //       this.showMultipleTax = false
  //     }
  //   }
  //   this.multi_tax_index = []
  //   if ($rootScope.tempQuaNoOnAdd) {
  //     if (typeof settings.quotFormat !== 'undefined')
  //       this.data.add_estimate.estimate_number = settings.quotFormat + $rootScope.tempQuaNoOnAdd
  //     else
  //       this.data.add_estimate.estimate_number = $rootScope.tempQuaNoOnAdd
  //   } else {
  //     if (!isNaN(settings.invNo)) {
  //       this.tempEstNo = parseInt(settings.quotNo) + 1
  //       $rootScope.tempQuaNoOnAdd = this.tempEstNo
  //     } else {
  //       this.tempEstNo = 1
  //       $rootScope.tempInvNoOnAdd = this.tempEstNo
  //     }
  //     if (settings.quotFormat) {
  //       this.data.add_invoice.estimate_number = settings.quotFormat + this.tempEstNo
  //     } else {
  //       this.data.add_invoice.estimate_number = "Est_" + this.tempEstNo
  //     }
  //   }
  //   // this.productList = DataStore.productsList
  //   // this.terms = DataStore.termsList


  //   this.termList = []
  //   if (this.terms !== null && typeof this.terms !== 'undefined') {
  //     for (var i = 0; i < this.terms.length; i++) {
  //       if (this.terms[i].setDefault == 'DEFAULT' && this.terms[i].enabled == 0) {
  //         var temp = {
  //           "_id": this.terms[i].serverTermCondId,
  //           "unique_identifier": this.terms[i].uniqueKeyTerms,
  //           "organization_id": this.terms[i].orgId,
  //           "terms_condition": this.terms[i].terms
  //         }
  //         this.termList.push(temp)

  //         var index29 = findObjectIndex(this.terms.filter(function (pro) {
  //           return (pro.enabled == 0)
  //         }), 'uniqueKeyTerms', this.terms[i].uniqueKeyTerms)
  //         this.data.terms[index29] = true
  //       }
  //     }
  //   }
  //   var date = new Date()
  //   if (settings.dateDDMMYY === false) {
  //     $rootScope.settings.date_format = 'mm-dd-yy'
  //   } else if (settings.dateDDMMYY === true) {
  //     $rootScope.settings.date_format = 'dd-mm-yy'
  //   } else {
  //     $rootScope.settings.date_format = 'dd-mm-yy'
  //   }

  //   if ($rootScope.settings.date_format === 'dd-mm-yy') {
  //     this.estimateDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()
  //     this.data.add_estimate.created_date = (new Date(this.estimateDate.split('-')[2], parseInt(this.estimateDate.split('-')[1]) - 1, this.estimateDate.split('-')[0])).getTime()
  //   } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
  //     this.estimateDate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear()
  //     this.data.add_estimate.created_date = (new Date(this.estimateDate.split('-')[2], parseInt(this.estimateDate.split('-')[0]) - 1, this.estimateDate.split('-')[1])).getTime()
  //   }
  //   if (settings) {

  //     if (settings.tax_on_item == 1) {
  //       this.tax_on = 'taxOnBill'
  //       this.taxtext = "Tax (on Bill)"
  //       this.data.add_estimate.tax_on_item = 1
  //       //console.log("setting 1")

  //     } else if (settings.tax_on_item == 0) {
  //       this.tax_on = 'taxOnItem'
  //       this.taxtext = "Tax (on Item)"
  //       this.data.add_estimate.tax_on_item = 2
  //       //console.log("setting 2")

  //     } else {
  //       this.tax_on = 'taxDisabled'
  //       this.taxtext = "Tax (Disabled)"
  //       this.data.add_estimate.tax_on_item = 2
  //       //console.log("setting 3")
  //       $('a.taxbtn').addClass('disabledBtn')

  //     }
  //     if (settings.discount_on_item == 0) {

  //       this.discount_on = 'onBill'
  //       this.discounttext = "Discount (on Bill)"
  //       this.data.add_estimate.discount_on_item = 0
  //       //console.log("setting 1,1")
  //     } else if (settings.discount_on_item == 1) {
  //       //console.log("setting 1,2")
  //       this.data.add_estimate.discount_on_item = 2
  //       this.discount_on = 'onItem'
  //       this.discounttext = "Discount (on Item)"
  //     } else {
  //       //console.log("setting 1,3")
  //       this.discount_on = 'disabled'
  //       this.discounttext = "Discount (Disabled)"
  //       this.data.add_estimate.discount_on_item = 2
  //       $('a.discountbtn').addClass('disabledBtn')
  //     }
  //   } else {
  //     //console.log("2")
  //     this.tax_on = 'taxDisabled'
  //     this.taxtext = "Tax (Disabled)"
  //     this.data.add_estimate.tax_on_item = parseInt(2)
  //     $('a.taxbtn').addClass('disabledBtn')

  //     this.discount_on = 'disabled'
  //     this.discounttext = "Discount (Disabled)"
  //     this.data.add_estimate.discount_on_item = parseInt(2)
  //     $('a.discountbtn').addClass('disabledBtn')
  //   }
  // }

  // cancel() {
  //   this.getEstimate(this.uniqueIdentityTemp, 1)
  // }

  // watchEdit() {
  //   var estimateDateArray = ''
  //   if (this.estimateDateEdit.indexOf('.') > -1)
  //     estimateDateArray = this.estimateDateEdit.split('.')
  //   else
  //     estimateDateArray = this.estimateDateEdit.split('-')

  //   if ($rootScope.settings.date_format === 'dd-mm-yy') {
  //     this.editdata.estimate.created_date = (new Date(estimateDateArray[2], parseInt(estimateDateArray[1]) - 1, estimateDateArray[0])).getTime()

  //   } else if ($rootScope.settings.date_format = 'mm-dd-yy') {
  //     this.editdata.estimate.created_date = (new Date(estimateDateArray[2], parseInt(estimateDateArray[0]) - 1, estimateDateArray[1])).getTime()
  //   }
  // }

  // multiTaxButtonEdit(taxname, index) {
  //   var status = true
  //   if (this.editdata.estimate.taxList)
  //     for (var k = 0; k < this.editdata.estimate.taxList.length; k++) {
  //       //console.log("multiTaxButton",this.data.invoice.taxList,$rootScope.authenticated.setting.alstTaxName)
  //       if (this.editdata.estimate.taxList[k].taxName !== taxname) {
  //         status = true
  //       } else {
  //         status = false
  //         break
  //       }
  //     }
  //   else
  //     status = true

  //   return status
  // }

  // setTermsListDelete(index) {
  //   this.termList.splice(index, 1)
  //   this.data.terms[index] = false
  // }
}