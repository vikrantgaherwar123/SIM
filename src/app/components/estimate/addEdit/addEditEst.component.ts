import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import {Observable} from 'rxjs'
import {map, startWith} from 'rxjs/operators'

import { response, client, terms, setting, product } from '../../../interface'
import { generateUUID, changeEstimate } from '../../../globalFunctions'

import { EstimateService } from '../../../services/estimate.service'
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { TermConditionService } from '../../../services/term-condition.service'
import { SettingService } from '../../../services/setting.service'

import { Store } from '@ngrx/store'
import * as estimateActions from '../../../actions/estimate.action'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'
import * as termActions from '../../../actions/terms.action'
import * as settingActions from '../../../actions/setting.action'
import { AppState } from '../../../app.state'

@Component({
  selector: 'app-estimate',
  templateUrl: './addEditEst.component.html',
  styleUrls: ['./addEditEst.component.css']
})
export class AddEditEstComponent implements OnInit {

  private emptyEstimate = {
    adjustment: null,
    amount: 0,
    created_date: '',
    device_modified_on:0,
    discount: 0,
    discount_on_item: 2,
    estimate_number: "",
    gross_amount: 0,
    listItems: [],
    organization_id: 0,
    percentage_flag: null,
    percentage_value: 0,
    shipping_address: "",
    shipping_charges: null,
    taxList: [],
    tax_amount: 0,
    tax_on_item: 2,
    tax_rate: null,
    termsAndConditions: [],
    unique_identifier: "",
    unique_key_fk_client: ""
  }
  private activeEstimate: any = {...this.emptyEstimate}
  estimateDate = new FormControl()
  private tempEstNo: number
  edit: boolean = false
  last
  index

  private estimateItems = []
  private estimateViewLoader: boolean
  estimateListLoader: boolean
  private selectedEstimate = null
  private tempQuaNoOnAdd: number
  estimateFilterTerm: string
  
  
  private createEstimate: boolean = true
  viewEstimate: boolean = false
  editEstimate: boolean = false
  private dueDate = new FormControl()

  private clientList: client[]
  private allClientList: client[]
  activeClient: any = {}
  clientListLoading: boolean
  billingTo = new FormControl()
  filteredClients: Observable<string[] | client[]>
  addClientModal: any = {}

  private productList: product[]
  activeItem: any = {
    quantity: 1,
    rate: 0.00,
    total: 0.00
  }
  addItem = new FormControl()
  filteredProducts: Observable<string[] | product[]>

  termList: terms[]
  addTermModal: any = {}

  tax_on: string
  discount_on: string
  private settings: any

  tempQtyLabel: string
  tempProLabel: string
  tempAmtLabel: string
  tempRateLabel: string
  tempTermLabel: string
  tempBillLabel: string
  tempShipLabel: string
  tempDueLabel: string
  tempDisLabel: string
  tempSubToLabel: string
  tempShippingLabel: string
  tempAdjLabel: string
  tempPaidLabel: string
  tempTotalLabel: string
  tempBalLabel: string
  routeParams: {
    estId: string,
    invId: string
  }

  private activeSettings: setting
  private taxtext: string
  private discounttext: string
  private showMultipleTax: boolean

  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  constructor(public router: Router,
    private route: ActivatedRoute,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private settingService: SettingService,
    private productService: ProductService,
    private store: Store<AppState>
  ) {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    store.select('client').subscribe(clients => this.allClientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)
  }

  ngOnInit() {
    this.fetchCommonData()
    this.route.params.subscribe(params => {
      if (params && params.invId) {
        this.edit = true
        // this.editInit(params.invId)
      } else {
        this.addInit()
      }
    })
  }

  displayWith(disp): string | undefined {
    if (disp && disp.name) {
      return disp.name
    } else if ( disp && disp.prodName) {
      return disp.prodName
    }
    return undefined
  }

  addInit() {
    this.commonSettingsInit()

    var settings = this.settings
    var date = new Date()
    this.estimateDate.reset(date)
    this.activeEstimate.created_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

    // Estimate Number
    if (!isNaN(parseInt(settings.quotNo))) {
      this.tempEstNo = parseInt(settings.quotNo) + 1
    } else {
      this.tempEstNo = 1
    }
    if (settings.quotFormat || settings.quotFormat == '') {
      this.activeEstimate.estimate_number = settings.quotFormat + this.tempEstNo
    } else {
      this.activeEstimate.estimate_number = "EST_" + this.tempEstNo
    }
  }

  editInit(invId) {
    // Fetch selected invoice
    this.commonSettingsInit()

    this.estimateService.fetchById([invId]).subscribe((invoice: any) => {
      if(invoice.records !== null) {
        this.activeEstimate = {...this.activeEstimate, ...invoice.records[0]}

        // Change list item keys compatible
        var temp = []
        for(let i=0; i < this.activeEstimate.listItems.length; i++) {
          temp.push({
            description: this.activeEstimate.listItems[i].description,
            product_name: this.activeEstimate.listItems[i].productName,
            quantity: this.activeEstimate.listItems[i].qty,
            rate: this.activeEstimate.listItems[i].rate,
            tax_rate: this.activeEstimate.listItems[i].tax_rate,
            total: this.activeEstimate.listItems[i].price,
            unique_identifier: this.activeEstimate.listItems[i].uniqueKeyListItem,
            unit: this.activeEstimate.listItems[i].unit
          })
        }
        this.activeEstimate.listItems = temp

        // Set Dates
        var [y, m, d] = this.activeEstimate.created_date.split('-').map(x => parseInt(x))
        this.estimateDate.reset(new Date(y, (m - 1), d))

        // Tax and discounts show or hide
        if(this.activeEstimate.discount == 0) {
          this.activeEstimate.discount = null
        }
        if(this.activeEstimate.shippingCharges == 0) {
          this.activeEstimate.shippingCharges = null
        }
        if(this.activeEstimate.adjustment == 0) {
          this.activeEstimate.adjustment = null
        }

        // Wait for clients to be loaded before setting active client
        var ref = setInterval(() => {
          if (this.allClientList.length > 0) {
            let uid = this.activeEstimate.unique_key_fk_client
            this.activeClient = this.allClientList.filter(cli => cli.uniqueKeyClient == uid)[0]
            this.billingTo.reset(this.activeClient)
            clearInterval(ref)
          }
        }, 50)
      } else {
        alert('invalid invoice id!')
        this.router.navigate(['/invoice/view'])
      }
      return false
    })
  }

  commonSettingsInit() {
    this.estimateDate.valueChanges.subscribe(value => {
      this.activeEstimate.created_date = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2)
    })

    var settings = this.settings
    // Set Labels
    this.tempQtyLabel = settings.mTvQty ? settings.mTvQty : ''
    this.tempProLabel = settings.mTvProducts ? settings.mTvProducts : ''
    this.tempAmtLabel = settings.mTvAmount ? settings.mTvAmount : ''
    this.tempRateLabel = settings.mTvRate ? settings.mTvRate : ''
    this.tempTermLabel = settings.mTvTermsAndConditions ? settings.mTvTermsAndConditions : ''
    this.tempBillLabel = settings.mTvBillTo ? settings.mTvBillTo : ''
    this.tempShipLabel = settings.mTvShipTo ? settings.mTvShipTo : ''
    this.tempDueLabel = settings.mTvDueDate ? settings.mTvDueDate : ''
    this.tempDisLabel = settings.discount ? settings.discount : ''
    this.tempSubToLabel = settings.subtotal ? settings.subtotal : ''
    this.tempShippingLabel = settings.shipping ? settings.shipping : 'Shipping'
    this.tempAdjLabel = settings.adjustment ? settings.adjustment : ''
    this.tempPaidLabel = settings.paid ? settings.paid : ''
    this.tempTotalLabel = settings.total ? settings.total : ''
    this.tempBalLabel = settings.balance ? settings.balance : ''

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
      if(!this.settings) {
        this.settings = {date_format: ''}
      }
      this.settings.date_format = 'dd-mm-yy'
    }

    this.activeSettings = <setting>{}
    this.activeSettings.date_format = 'dd-mm-yy'

    if (this.settings.date_format === 'dd-mm-yy') {
      this.estimateDate.reset(new Date())
      this.activeEstimate.created_date = this.estimateDate.value.getTime()
    } else if (this.settings.date_format = 'mm-dd-yy') {
      this.estimateDate.reset(new Date())
      this.activeEstimate.created_date = this.estimateDate.value.getTime()
    }

    if (settings) {
      this.activeEstimate.discount = settings.discount_on_item
      // this.activeEstimate.tax_on_item = settings.tax_on_item
      if (settings.tax_on_item == 1) {
        this.tax_on = 'taxOnBill'
        this.taxtext = "Tax (on Bill)"
        // this.activeEstimate.tax_on_item = 1
      } else if (settings.tax_on_item == 0) {
        this.tax_on = 'taxOnItem'
        this.taxtext = "Tax (on Item)"
        // this.activeEstimate.tax_on_item = 2
      } else {
        this.tax_on = 'taxDisabled'
        this.taxtext = "Tax (Disabled)"
        // this.activeEstimate.tax_on_item = 2
        $('a.taxbtn').addClass('disabledBtn')
      }

      if (settings.discount_on_item == 0) {
        this.discount_on = 'onBill'
        this.discounttext = "Discount (on Bill)"
        // this.activeEstimate.discount_on_item = 0
      } else if (settings.discount_on_item == 1) {
        // this.activeEstimate.discount_on_item = 2
        this.discount_on = 'onItem'
        this.discounttext = "Discount (on Item)"
      } else {
        this.discount_on = 'disabled'
        this.discounttext = "Discount (Disabled)"
        // this.activeEstimate.discount_on_item = 2
        $('a.discountbtn').addClass('disabledBtn')
      }
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      // this.activeEstimate.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      // this.activeEstimate.discount_on_item = 2
      $('a.discountbtn').addClass('disabledBtn')
    }
  }

  fetchCommonData() {
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
    if(this.allClientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        if (response.records !== null) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
        }
        this.setClientFilter()
        this.clientListLoading = false
      })
    } else {
      this.clientList = this.allClientList.filter(recs => recs.enabled == 0)
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    if(this.termList.length < 1) {
      this.termConditionService.fetch().subscribe((response: response) => {
        // console.log(response)
        if (response.termsAndConditionList !== null) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        self.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
      })
    } else {
      this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
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
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()))
  }

  selectedClientChange(client) {
    var temp
    temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]

    if (temp !== undefined) {
      this.activeClient = temp
      this.activeEstimate.unique_key_fk_client = temp.uniqueKeyClient
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

  openEditEstimateItemModal(index) {
    $('#edit-item').modal('show')
    this.activeItem = {...this.activeEstimate.listItems[index]}
  }

  addEditEstimateItem(uid = null) {
    // If product is in product list directly add to Estimate else save product and then add to Estimate
    // console.log(this.addItem, uid)

    if(this.activeItem.unique_key_fk_product) {
      if(uid == null) {
        // Add Item to Estimate
        this.activeEstimate.listItems.push(this.activeItem)
      } else {
        // Edit Item from Estimate
        var index = this.activeEstimate.listItems.findIndex(it => it.unique_identifier == uid)
        this.activeEstimate.listItems[index] = this.activeItem
        $('#edit-item').modal('hide')
      }
      this.addItem.reset('')
      this.activeItem = {
        quantity: 1,
        rate: 0.00
      }
      this.calculateEstimate(false)
    } else {
      this.saveProduct({...this.activeItem, prodName: this.addItem.value}, (product) => {
        this.fillItemDetails({...this.activeItem, ...product})
        this.activeEstimate.listItems.push(this.activeItem)
        this.addItem.reset('')
        this.activeItem = {
          quantity: 1,
          rate: 0.00
        }
        this.calculateEstimate(false)
      })
    }
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

  closeEditItemModal() {
    this.activeItem = {
      quantity: 1,
      rate: 0.00,
      total: 0.00
    }
    $('#edit-item').modal('hide')
  }

  // Terms Functions
  openAddTermModal() {
    this.addTermModal = {}
    $('#add-terms').modal('show')
  }

  addRemoveTermsFromEstimate(term) {
    // console.log(term)
    var index = this.activeEstimate.termsAndConditions.findIndex(trms => trms.uniqueKeyTerms == term.uniqueKeyTerms)
    if(index == -1) {
      this.activeEstimate.termsAndConditions.push(term)
    } else {
      this.activeEstimate.termsAndConditions.splice(index, 1)
    }
  }

  isTermInEstimate(term) {
    return this.activeEstimate.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
  }

  // Estimate Functions
  fillItemDetails(prod = null) {
    var product = (prod == null) ? this.addItem.value : prod
    this.activeItem = {
      description: product.discription == null ? '' : product.discription,
      product_name: product.prodName,
      quantity: product.quantity ? product.quantity : 1,
      rate: product.rate,
      tax_rate: 0.00,
      unique_identifier: generateUUID(this.user.user.orgId),
      unique_key_fk_product: product.uniqueKeyProduct,
      unit: product.unit
    }
    this.calculateTotal()
  }

  save(status) {
    if(this.activeEstimate.unique_key_fk_client == '') {
      alert('client not selected')
      return false
    }

    if (this.activeEstimate.listItems.length == 0 || !status) {
      // notifications.showError({ message: 'Select your client!', hideDelay: 1500, hide: true });
      alert('You haven\'t added item')
      // notifications.showError({ message: 'You haven\'t added any item.', hideDelay: 1500, hide: true });
      // $('#invoiceSavebtn').button('reset');
      return false
    }

    $('#invSubmitBtn').attr('disabled', 'disabled')
    this.activeEstimate.organization_id = parseInt(this.user.user.orgId)

    var temp = []
    this.activeEstimate.termsAndConditions.forEach(tnc => {
      temp.push(this.termConditionService.changeKeysForInvoiceApi(tnc))
    })
    this.activeEstimate.termsAndConditions = temp

    if (!this.edit) {
      this.activeEstimate.unique_identifier = generateUUID(this.user.user.orgId)
    }
    for (var i = this.activeEstimate.listItems.length; i > 0; i--) {
      if (!this.activeEstimate.listItems[i - 1].product_name || this.activeEstimate.listItems[i - 1].product_name == '') {
        this.activeEstimate.listItems.splice(i - 1, 1)
      }
    }

    for (var j = 0; j < this.activeEstimate.termsAndConditions.length; j++) {
      this.activeEstimate.termsAndConditions[j].unique_key_fk_quotation = this.activeEstimate.unique_identifier
    }

    for (var t = 0; t < this.activeEstimate.taxList.length; t++) {
      if (this.activeEstimate.taxList[t] == null) {
        this.activeEstimate.taxList.splice(t, 1)
      }
    }

    this.activeEstimate.device_modified_on = new Date().getTime()

    var self = this
    this.estimateService.add([this.activeEstimate]).subscribe((response: any) => {
      if (response.status !== 200) {
        alert('Couldnt save Estimate')
      } else if (response.status === 200) {
        // Add Estimate to store
        if(this.edit) {
          this.store.select('estimate').subscribe(invs => {
            let index = invs.findIndex(inv => inv.unique_identifier == response.quotationList[0].unique_identifier)
            if (response.quotationList[0].deleted_flag == 1) {
              self.store.dispatch(new estimateActions.remove(index))
            } else {
              // self.store.dispatch(new estimateActions.edit({index, value: this.estimateService.changeKeysForStore(response.invoiceList[0])}))
            }
          })
        } else {
          // self.store.dispatch(new estimateActions.add([this.estimateService.changeKeysForStore(response.quotationList[0])]))
        }

        // Update settings
        if(!this.edit) {
          this.updateSettings()
        }

        alert('Estimate saved successfully')
        // Reset Create Estimate page for new Estimate creation or redirect to view page if edited
        if(this.edit) {
          this.router.navigate(['/estimate/view'])
        } else {
          self.resetCreateEstimate()
          self.addInit()
        }
      }
      $('#invSubmitBtn').removeAttr('disabled')
    })
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

  calculateEstimate(indexTaxMultiple) {
    var gross_amount = 0
    var deductions = 0
    var additions = 0

    for (var i = 0; i < this.activeEstimate.listItems.length; i++) {
      gross_amount += parseFloat(this.activeEstimate.listItems[i].total)
    }
    this.activeEstimate.gross_amount = gross_amount

    // Discount
    if (this.activeEstimate.percentage_flag == 1) {
      let discountFactor = this.activeEstimate.percentage_value / 100
      if (isNaN(discountFactor)) {
        discountFactor = 0
      }

      this.activeEstimate.discount = gross_amount * discountFactor
      deductions += this.activeEstimate.discount
    } else {
      if(isNaN(this.activeEstimate.discount)) {
        this.activeEstimate.discount = 0
      }
      deductions += this.activeEstimate.discount
      this.activeEstimate.percentage_value = this.activeEstimate.discount / this.activeEstimate.gross_amount * 100
    }

    // Tax
    if (this.activeEstimate.tax_rate != null) {
      if(isNaN(this.activeEstimate.tax_rate)) {
        this.activeEstimate.tax_rate = 0
      }
      this.activeEstimate.tax_amount = (this.activeEstimate.gross_amount - this.activeEstimate.discount) * this.activeEstimate.tax_rate / 100
      additions += this.activeEstimate.tax_amount
    }

    if (indexTaxMultiple) {
      // var temp_tax_amount = 0
      // for (var i = 0; i < this.activeEstimate.taxList.length; i++) {
      //   if (this.activeEstimate.taxList[i]) {
      //     if (isNaN(parseFloat(this.activeEstimate.taxList[i].percentage)))
      //       this.activeEstimate.taxList[i].percentage = 0
      //     this.activeEstimate.taxList[i].calculateValue = (parseFloat(this.activeEstimate.taxList[i].percentage) * discountTotal) / 100
      //     this.activeEstimate.taxList[i].selected = true
      //     temp_tax_amount = temp_tax_amount + (parseFloat(this.activeEstimate.taxList[i].percentage) * discountTotal) / 100
      //   }
      // }
      // this.activeEstimate.tax_amount = this.activeEstimate.tax_amount + temp_tax_amount
    }

    // Shipping
    if (isNaN(this.activeEstimate.shipping_charges)) {
      this.activeClient.shipping_charges = 0
    }
    additions += this.activeEstimate.shipping_charges

    // Adjustment
    if (isNaN(this.activeEstimate.adjustment)) {
      this.activeEstimate.adjustment = 0
    }
    deductions += this.activeEstimate.adjustment

    this.activeEstimate.amount = parseFloat((this.activeEstimate.gross_amount - deductions + additions).toFixed(2))
  }

  removeItem(index) {
    this.activeEstimate.listItems.splice(index, 1)
    this.calculateEstimate(false)
  }

  resetCreateEstimate() {
    this.billingTo.setValue('')
    this.addItem.reset('')

    this.activeEstimate = {...this.emptyEstimate}

    this.activeEstimate.listItems = []
    this.activeEstimate.payments = []
    this.activeEstimate = 0
    this.activeEstimate.taxList = []
    this.activeEstimate = []
    this.activeEstimate = []
    this.activeEstimate.gross_amount = 0.00
    this.activeEstimate.balance = 0.00

    this.activeClient = {}
    this.dueDate.reset()

    var settings = this.settings
    this.activeEstimate.taxList = []
    this.activeEstimate.percentage_flag = 1

    if (settings.alstTaxName) {
      if (settings.alstTaxName.length > 0) {
        this.showMultipleTax = true
      } else {
        this.showMultipleTax = false
      }
    }
  }

  updateSettings() {
    var cookie = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')

    cookie.setting.invNo = this.tempEstNo
    localStorage.setItem('user', JSON.stringify(cookie))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    var settings1 = {
      androidSettings: cookie.setting,
      android_donot_update_push_flag: 1
    }
    settings1.androidSettings.invNo = this.tempEstNo

    this.settingService.add(settings1).subscribe((response: any) => {
      if (response.status == 200) {
        this.store.dispatch(new settingActions.add(response.settings))
      }
      // $('#updateButton').button('reset')
    })
  }
}