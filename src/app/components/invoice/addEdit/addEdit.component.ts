import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith, last } from 'rxjs/operators'

import { response, client, invoice, terms, setting, product } from '../../../interface'
import { generateUUID } from '../../../globalFunctions'

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
import * as settingActions from '../../../actions/setting.action'
import { AppState } from '../../../app.state'

@Component({
  selector: 'app-invoice',
  templateUrl: './addEdit.component.html',
  styleUrls: ['./addEdit.component.css']
})
export class AddEditComponent implements OnInit {

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
  activeInvoice: invoice = {...this.emptyInvoice}
  invoiceDate = new FormControl()
  private dueDate = new FormControl()
  private tempInvNo: number
  private showMultipleTax: boolean
  private show_tax_input_list: any
  private tempflagTaxList: any
  private taxtext: string
  edit: boolean = false
  last
  index

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

  addPaymentModal: any = {}

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
  tempInv12: any
  tempPaymentList
  tempItemList
  tempTermList
  routeParams: {
    invId: string
  }

  private newItemCounter: number = 0

  settings: any
  private activeSettings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }

  constructor(public router: Router,
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
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

  displayWith(disp): string | undefined {
    if (disp && disp.name) {
      return disp.name
    } else if ( disp && disp.prodName) {
      return disp.prodName
    }
    return undefined
  }

  // Initialisation functions
  ngOnInit() {
    this.fetchCommonData()
    this.route.params.subscribe(params => {
      if (params && params.invId) {
        this.edit = true
        this.editInit(params.invId)
      } else {
        this.addInit()
      }
    })
  }

  addInit() {
    this.commonSettingsInit()

    var settings = this.settings
    var date = new Date()
    this.invoiceDate.reset(date)
    this.activeInvoice.created_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

    // Invoice Number
    if (!isNaN(parseInt(settings.invNo))) {
      this.tempInvNo = parseInt(settings.invNo) + 1
    } else {
      this.tempInvNo = 1
    }
    if (settings.setInvoiceFormat) {
      this.activeInvoice.invoice_number = settings.setInvoiceFormat + this.tempInvNo
    } else {
      this.activeInvoice.invoice_number = "INV_" + this.tempInvNo
    }
  }

  editInit(invId) {
    // Fetch selected invoice
    this.commonSettingsInit()

    this.invoiceService.fetchById([invId]).subscribe((invoice: any) => {
      if(invoice.records !== null) {
        this.activeInvoice = {...this.activeInvoice, ...invoice.records[0]}

        // Change list item keys compatible
        var temp = []
        for(let i=0; i < this.activeInvoice.listItems.length; i++) {
          temp.push({
            description: this.activeInvoice.listItems[i].description,
            product_name: this.activeInvoice.listItems[i].productName,
            quantity: this.activeInvoice.listItems[i].qty,
            rate: this.activeInvoice.listItems[i].rate,
            tax_rate: this.activeInvoice.listItems[i].tax_rate,
            total: this.activeInvoice.listItems[i].price,
            unique_identifier: this.activeInvoice.listItems[i].uniqueKeyListItem,
            unit: this.activeInvoice.listItems[i].unit
          })
        }
        this.activeInvoice.listItems = temp

        // Change payment keys compatible
        if(this.activeInvoice.payments) {
          var temp1 = []
          for(let i=0; i < this.activeInvoice.payments.length; i++) {
            temp1.push({
              date_of_payment: this.activeInvoice.payments[i].dateOfPayment,
              organization_id: this.activeInvoice.payments[i].orgId,
              paid_amount: this.activeInvoice.payments[i].paidAmount,
              unique_identifier: this.activeInvoice.payments[i].uniqueKeyInvoicePayment,
              unique_key_fk_client: this.activeInvoice.payments[i].uniqueKeyFKClient,
              unique_key_fk_invoice: this.activeInvoice.payments[i].uniqueKeyFKInvoice,
              unique_key_voucher_no: this.activeInvoice.payments[i].uniqueKeyVoucherNo
            })
          }
          this.activeInvoice.payments = temp1
        }

        // Set Dates
        var [y, m, d] = this.activeInvoice.created_date.split('-').map(x => parseInt(x))
        this.invoiceDate.reset(new Date(y, (m - 1), d))

        // Tax and discounts show or hide
        if(this.activeInvoice.discount == 0) {
          this.activeInvoice.discount = null
        }
        if(this.activeInvoice.shipping_charges == 0) {
          this.activeInvoice.shipping_charges = null
        }
        if(this.activeInvoice.adjustment == 0) {
          this.activeInvoice.adjustment = null
        }

        this.changeDueDate(this.activeInvoice.due_date_flag.toString())
        // Wait for clients to be loaded before setting active client
        var ref = setInterval(() => {
          if (this.allClientList.length > 0) {
            let uid = this.activeInvoice.unique_key_fk_client
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

    var settings = this.settings
    // Set Labels
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
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      this.settings.date_format = 'dd-mm-yy'
    }

    this.activeSettings = <setting>{}
    this.activeSettings.date_format = 'dd-mm-yy'

    if (this.settings.dateDDMMYY === false) {
      this.activeSettings.date_format = 'mm-dd-yy'
    } else if (this.settings.dateDDMMYY === true) {
      this.activeSettings.date_format = 'dd-mm-yy'
    }

    if (this.settings.currencyInText != "" && typeof this.settings.currencyInText !== 'undefined') {
    } else {

    }

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
        self.activeInvoice.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
      })
    } else {
      this.activeInvoice.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
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
        var index = this.activeInvoice.listItems.findIndex(it => it.unique_identifier == uid)
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
        console.log(this.activeInvoice.listItems)
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

    if (!this.edit) {
      this.activeInvoice.unique_identifier = generateUUID(this.user.user.orgId)
    }
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
      } else if (result.status === 200) {
        // Add Invoice to store
        if(this.edit) {
          this.store.select('invoice').subscribe(invs => {
            let index = invs.findIndex(inv => inv.unique_identifier == result.invoiceList[0].unique_identifier)
            if (result.invoiceList[0].deleted_flag == 1) {
              self.store.dispatch(new invoiceActions.remove(index))
            } else {
              self.store.dispatch(new invoiceActions.edit({index, value: this.invoiceService.changeKeysForStore(result.invoiceList[0])}))
            }
          })
        } else {
          self.store.dispatch(new invoiceActions.add([this.invoiceService.changeKeysForStore(result.invoiceList[0])]))
        }

        // Update settings
        if(!this.edit) {
          this.updateSettings()
        }

        alert('Invoice saved successfully')
        // Reset Create Invoice page for new invoice creation or redirect to view page if edited
        if(this.edit) {
          this.router.navigate(['/invoice/view'])
        } else {
          self.resetCreateInvoice()
          self.addInit()
        }
      }
      $('#invSubmitBtn').removeAttr('disabled')
    })
  }

  deleteInvoice() {
    console.log('asdfwe ')
    this.activeInvoice.deleted_flag = 1
    this.save(true)
  }

  resetCreateInvoice() {
    this.billingTo.setValue('')
    this.addItem.reset('')

    this.activeInvoice = {...this.emptyInvoice}

    this.activeInvoice.listItems = []
    this.activeInvoice.payments = []
    this.newItemCounter = 0
    this.activeInvoice.taxList = []
    this.show_tax_input_list = []
    this.tempflagTaxList = []
    this.activeInvoice.gross_amount = 0.00
    this.activeInvoice.balance = 0.00

    this.activeClient = {}
    this.dueDate.reset()

    var settings = this.settings
    this.activeInvoice.taxList = []
    this.activeInvoice.percentage_flag = 1

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

    cookie.setting.invNo = this.tempInvNo
    localStorage.setItem('user', JSON.stringify(cookie))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    var settings1 = {
      androidSettings: cookie.setting,
      android_donot_update_push_flag: 1
    }
    settings1.androidSettings.invNo = this.tempInvNo

    this.settingService.add(settings1).subscribe((response: any) => {
      if (response.status == 200) {
        this.store.dispatch(new settingActions.add(response.settings))
      }
      // $('#updateButton').button('reset')
    })
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
}