import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import {Observable} from 'rxjs'
import {map, startWith} from 'rxjs/operators'

import { response, addEditEstimate, client, terms, setting, product } from '../../../interface'
import { generateUUID } from '../../../globalFunctions'

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

  activeEstimate: addEditEstimate
  estimateDate = new FormControl()
  private tempEstNo: number
  estimateFilterTerm: string
  edit: boolean = false
  last
  index

  private clientList: client[]
  private allClientList: client[]
  activeClient: client = <client>{}
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
  settings: any

  private activeSettings: setting

  showMultipleTax
  taxtext
  discounttext

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
    this.activeEstimate = <addEditEstimate>{}
    this.fetchCommonData()
    this.route.params.subscribe(params => {
      if (params && params.estId) {
        this.edit = true
        this.editInit(params.estId)
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

  editInit(estId) {
    // Fetch selected estimate
    this.commonSettingsInit()

    this.estimateService.fetchById([estId]).subscribe((estimate: any) => {
      if(estimate.records !== null) {
        this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(estimate.records[0])

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
            unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
            unit: this.activeEstimate.listItems[i].unit
          })
        }
        this.activeEstimate.listItems = temp

        // Change TnC keys compatible
        temp = []
        for(let i=0; i < this.activeEstimate.termsAndConditions.length; i++) {
          temp.push({
            orgId: this.activeEstimate.termsAndConditions[i].orgId,
            terms: this.activeEstimate.termsAndConditions[i].termsConditionText,
            uniqueKeyTerms: this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms,
            _id: this.activeEstimate.termsAndConditions[i]._id
          })
        }
        this.activeEstimate.termsAndConditions = temp

        // Set Dates
        var [y, m, d] = this.activeEstimate.created_date.split('-').map(x => parseInt(x))
        this.estimateDate.reset(new Date(y, (m - 1), d))

        // Tax and discounts show or hide
        if(this.activeEstimate.discount == 0) {
          this.activeEstimate.percentage_flag = null
        }
        if(this.activeEstimate.shipping_charges == 0) {
          this.activeEstimate.shipping_charges = undefined
        }
        if(this.activeEstimate.adjustment == 0) {
          this.activeEstimate.adjustment = undefined
        }
        if(this.activeEstimate.tax_amount == 0) {
          this.activeEstimate.tax_rate = null
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
        alert('invalid estimate id!')
        this.router.navigate(['/estimate/view'])
      }
    })
  }

  commonSettingsInit() {
    this.estimateDate.valueChanges.subscribe(value => {
      this.activeEstimate.created_date = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2)
    })

    var settings = this.settings

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
      this.activeEstimate.tax_on_item = 2
      this.activeEstimate.discount_on_item = 2

      if (settings.taxFlagLevel == 0) {
        this.taxtext = "Tax (on Item)"
        this.activeEstimate.tax_on_item = 0
      }
      if (settings.discountFlagLevel == 1) {
        this.activeEstimate.discount_on_item = 1
      }

      // if (settings.tax_on_item == 1) {
      //   this.tax_on = 'taxOnBill'
      //   this.taxtext = "Tax (on Bill)"
      //   this.activeEstimate.tax_on_item = 1
      // } else if (settings.tax_on_item == 0) {
      //   this.tax_on = 'taxOnItem'
      //   this.taxtext = "Tax (on Item)"
      //   this.activeEstimate.tax_on_item = 2
      // } else {
      //   this.tax_on = 'taxDisabled'
      //   this.taxtext = "Tax (Disabled)"
      //   this.activeEstimate.tax_on_item = 2
      //   $('a.taxbtn').addClass('disabledBtn')
      // }

      // if (settings.discount_on_item == 0) {
      //   this.discount_on = 'onBill'
      //   this.discounttext = "Discount (on Bill)"
      //   this.activeEstimate.discount_on_item = 0
      // } else if (settings.discount_on_item == 1) {
      //   this.activeEstimate.discount_on_item = 2
      //   this.discount_on = 'onItem'
      //   this.discounttext = "Discount (on Item)"
      // } else {
      //   this.discount_on = 'disabled'
      //   this.discounttext = "Discount (Disabled)"
      //   this.activeEstimate.discount_on_item = 2
      //   $('a.discountbtn').addClass('disabledBtn')
      // }
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
    // Fetch Products if not in store
    if(this.productList.length < 1) {
      this.productService.fetch().subscribe((response: response) => {
        if (response.records != null) {
          this.store.dispatch(new productActions.add(response.records.filter((prod: any) => (prod.enabled == 0 && prod.prodName !== undefined))))
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
        if (response.termsAndConditionList !== null) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
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
    var temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]

    if (temp !== undefined) {
      this.activeClient = temp
      this.activeEstimate.unique_key_fk_client = temp.uniqueKeyClient
    } else {
      if(this.activeClient) {
        this.activeClient = <client>{}
      }
      this.openAddClientModal(client.option.value)
    }
    $('#estimateNumber').select()
  }

  openAddClientModal(name) {
    this.addClientModal = {}
    this.addClientModal.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
      $('#add-client input[type="text"]')[1].focus()
    })
  }

  closeAddClientModal() {
    $('#add-client').modal('hide')
    this.addClientModal = {}
    this.activeClient = <client>{}
    this.activeEstimate.unique_key_fk_client = null
    this.billingTo.reset('')
  }

  saveClient(status) {
    // If empty spaces
    if(!this.addClientModal.name.toLowerCase().replace(/ /g, '')) {
      alert('Organisation name required!')
      return false
    }

    if (status) {
      this.addClientModal.uniqueKeyClient = generateUUID(this.user.user.orgId)
      var d = new Date()
      this.addClientModal.device_modified_on = d.getTime()
      this.addClientModal.organizationId = this.user.user.orgId

      $('#saveClientButton').attr("disabled", 'disabled')
      this.clientService.add([this.clientService.changeKeysForApi(this.addClientModal)]).subscribe((response: any) => {
        if (response.status === 200) {
          this.store.dispatch(new clientActions.add([this.clientService.changeKeysForStore(response.clientList[0])]))
          this.clientList = this.allClientList.filter(recs => recs.enabled == 0)
          this.activeClient = this.clientList.filter((client) => client.uniqueKeyClient == response.clientList[0].unique_identifier)[0]
          this.billingTo.setValue(this.activeClient)

          $('#add-client').modal('hide')
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      })
    }
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

  editEstimateItem(index) {
    $('#edit-item').modal('show')
    this.activeItem = {...this.activeEstimate.listItems[index]}
  }

  addEditEstimateItem(uid = null) {
    // If product is in product list directly add to Estimate else save product and then add to Estimate
    // console.log(this.addItem, uid)

    if(this.activeItem.unique_identifier) {
      if(uid == null) {
        // Add Item to Estimate
        if(!this.activeEstimate.listItems) {
          this.activeEstimate.listItems = []
        }
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

  removeItem(index) {
    this.activeEstimate.listItems.splice(index, 1)
    this.calculateEstimate(false)
  }

  calculateTotal() {
    if (Object.keys(this.activeItem).length > 0) {
      let rateParse = parseFloat(this.activeItem.rate)
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      this.activeItem.total = (this.activeItem.quantity * rateParse)

      // Discounts
      if(isNaN(this.activeItem.discount) || this.activeItem.discount == 0) {
        this.activeItem.discount = 0
      } else {
        this.activeItem.discount_amount = (this.activeItem.rate*this.activeItem.discount/100)*this.activeItem.quantity
        this.activeItem.total -= this.activeItem.discount_amount
      }

      // Tax
      if(isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0) {
        this.activeItem.tax_rate = 0
      } else {
        this.activeItem.tax_amount = (this.activeItem.rate*this.activeItem.tax_rate/100)*this.activeItem.quantity
        this.activeItem.total += this.activeItem.tax_amount
      }
    }
  }

  // Terms Functions
  openAddTermModal() {
    this.addTermModal = {}
    $('#add-terms').modal('show')
  }

  saveTerm(status) {
    if(this.addTermModal.terms.replace(/ /g, '') == '') {
      alert('Term text is mandatory!')
      return false
    }

    $('#addtermbtn').attr('disabled', 'disabled')
    if (status) {
      this.addTermModal.orgId = this.user.user.orgId
      this.addTermModal.uniqueKeyTerms = generateUUID(this.user.user.orgId)
      this.addTermModal.modifiedOn = new Date().getTime()

      this.termConditionService.add([
        this.termConditionService.changeKeysForApi(this.addTermModal)
      ]).subscribe((response: any) => {
        if (response.status === 200) {
          var temp = this.termConditionService.changeKeysForStore(response.termsAndConditionList[0])
          this.store.dispatch(new termActions.add([temp]))

          this.addTermModal = {}

          if (temp.setDefault === 'DEFAULT') {
            this.activeEstimate.termsAndConditions.push(temp)
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
    if(this.activeEstimate.termsAndConditions) {
      return this.activeEstimate.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
    } else {
      return false
    }
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
    if(!this.activeEstimate.unique_key_fk_client) {
      alert('client not selected')
      $('#bill-to-input').select()
      return false
    }

    if (this.activeEstimate.listItems.length == 0 || !status) {
      alert('You haven\'t added item')
      return false
    }

    if(this.activeEstimate.balance < 0) {
      if(confirm('It seems like you have estimate with negative balance, should we adjust it for you?')) {
        this.activeEstimate.adjustment += this.activeEstimate.balance
        this.calculateEstimate(false)
      }
      return false
    }

    $('#estSubmitBtn').attr('disabled', 'disabled')
    this.activeEstimate.organization_id = parseInt(this.user.user.orgId)

    var temp = []
    this.activeEstimate.termsAndConditions.forEach(tnc => {
      temp.push({...this.termConditionService.changeKeysForInvoiceApi(tnc), unique_key_fk_quotation: this.activeEstimate.unique_identifier})
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

    if(this.activeEstimate.taxList) {
      for (var t = 0; t < this.activeEstimate.taxList.length; t++) {
        if (this.activeEstimate.taxList[t] == null) {
          this.activeEstimate.taxList.splice(t, 1)
        }
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
          this.store.select('estimate').subscribe(ests => {
            let index = ests.findIndex(est => est.unique_identifier == response.quotationList[0].unique_identifier)
            if (response.quotationList[0].deleted_flag == 1) {
              self.store.dispatch(new estimateActions.remove(index))
            } else {
              // self.store.dispatch(new estimateActions.edit({index, value: this.estimateService.changeKeysForStore(response.estimateList[0])}))
            }
          })
        } else {
          // self.store.dispatch(new estimateActions.add([this.estimateService.changeKeysForStore(response.quotationList[0])]))
        }

        // Update settings
        if(!this.edit) {
          this.updateSettings()
        }

        // Reset Create Estimate page for new Estimate creation or redirect to view page if edited
        if(this.edit) {
          alert('Estimate updated successfully')
          this.router.navigate(['/estimate/view'])
        } else {
          alert('Estimate saved successfully')
          self.resetFormControls()
          self.ngOnInit()
        }
      }
      $('#estSubmitBtn').removeAttr('disabled')
    })
  }

  deleteEstimate() {
    this.activeEstimate.deleted_flag = 1
    this.save(true)
  }

  calculateEstimate(indexTaxMultiple) {
    var gross_amount = 0
    var deductions = 0
    var additions = 0

    if(this.activeEstimate.listItems) {
      for (var i = 0; i < this.activeEstimate.listItems.length; i++) {
        gross_amount += parseFloat(this.activeEstimate.listItems[i].total)
      }
    }
    this.activeEstimate.gross_amount = gross_amount

    // Discount
    if (this.activeEstimate.percentage_flag == 1) {
      var discountFactor = this.activeEstimate.percentage_value / 100
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

    if (indexTaxMultiple && this.activeEstimate.taxList) {
      var temp_tax_amount = 0
      for (var i = 0; i < this.activeEstimate.taxList.length; i++) {
        if (this.activeEstimate.taxList[i]) {
          if (isNaN(parseFloat(this.activeEstimate.taxList[i].percentage))) {
            this.activeEstimate.taxList[i].percentage = 0
          }
          this.activeEstimate.taxList[i].calculateValue = (parseFloat(this.activeEstimate.taxList[i].percentage) * (this.activeEstimate.gross_amount - this.activeEstimate.discount)) / 100
          this.activeEstimate.taxList[i].selected = true
          temp_tax_amount = temp_tax_amount + (parseFloat(this.activeEstimate.taxList[i].percentage) * (this.activeEstimate.gross_amount - this.activeEstimate.discount)) / 100
        }
      }
      this.activeEstimate.tax_amount = this.activeEstimate.tax_amount + temp_tax_amount
      additions += this.activeEstimate.tax_amount
    }

    // Shipping
    if (isNaN(this.activeEstimate.shipping_charges)) {
      this.activeEstimate.shipping_charges = undefined
    } else {
      additions += this.activeEstimate.shipping_charges
    }

    // Adjustment
    if (isNaN(this.activeEstimate.adjustment)) {
      this.activeEstimate.adjustment = undefined
    } else {
      deductions += this.activeEstimate.adjustment
    }

    this.activeEstimate.amount = parseFloat((this.activeEstimate.gross_amount - deductions + additions).toFixed(2))
    this.activeEstimate.balance = parseFloat(this.activeEstimate.amount.toFixed(2))
  }

  resetFormControls() {
    this.billingTo.setValue('')
    this.addItem.reset('')

    this.activeClient = <client>{}
    this.activeEstimate.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT')
  }

  updateSettings() {
    var cookie = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')

    cookie.setting.quotNo = this.tempEstNo
    localStorage.setItem('user', JSON.stringify(cookie))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    var settings1 = {
      androidSettings: cookie.setting,
      android_donot_update_push_flag: 1
    }
    settings1.androidSettings.estNo = this.tempEstNo

    this.settingService.add(settings1).subscribe((response: any) => {
      if (response.status == 200) {
        this.store.dispatch(new settingActions.add(response.settings))
      }
      // $('#updateButton').button('reset')
    })
  }
}