import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, NavigationStart  } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { CONSTANTS } from '../../../constants'
import { response, addEditEstimate, client, terms, setting, product } from '../../../interface'
import { generateUUID, setStorage } from '../../../globalFunctions'

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
import { AppState } from '../../../app.state'
import { ToasterService } from 'angular2-toaster'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-estimate',
  templateUrl: './addEditEst.component.html',
  styleUrls: ['./addEditEst.component.css'],
  providers: [DatePipe]
})


export class AddEditEstComponent implements OnInit {

  activeEstimate: addEditEstimate
  estimateDate = new FormControl()
  private tempEstNo: number
  estimateFilterTerm: string
  balance: number
  edit: boolean = false
  // editDiscount: boolean = true
  ifClientExist: boolean = false
  modalDescription: boolean = true
  estimateActive: boolean = false
  openClientModal: boolean = false
  shippingAdressChanged: boolean = false
  shippingAddressEditMode: boolean = false
  editTerms: boolean = true
  disableProductText: boolean = true
  ifProductEmpty:boolean = false

  last
  index
  mysymbols

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
  myDate : any

  showMultipleTax
  taxtext
  discounttext
  shippingAddress

  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  keepGoing: boolean;
  estimateDelete: boolean;

  constructor(private CONST: CONSTANTS, public router: Router,
    public toasterService: ToasterService,
    private route: ActivatedRoute,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private settingService: SettingService,
    private productService: ProductService,
    private datePipe: DatePipe,
    private store: Store<AppState>
  ) {
    this.toasterService = toasterService
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    store.select('client').subscribe(clients => this.allClientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)
    
    // save button processing script
    $(document).ready(function () {
      $('.btn').on('click', function () {
        var $this = $(this);
        var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> loading...';
        if ($(this).html() !== loadingText) {
          $this.data('original-text', $(this).html());
          $this.html(loadingText);
        }
        setTimeout(function () {
          $this.html($this.data('original-text'));
        }, 4000);
      });
    })
    // save button processing script ends
  }

  ngOnInit() {
    
    this.activeEstimate = <addEditEstimate>{}
    this.route.params.subscribe(params => {
      if (params.estId) {
        this.edit = true
        this.editTerms = false
        this.editInit(params.estId)
        this.fetchCommonData()
      } else {
        this.fetchCommonData()
        this.addInit()
      }
    })
    for (let i = 0; i < this.productList.length; i++) {
      if (this.productList[i].prodName == "") {
        var product = this.productList[i];
        var index = this.productList.indexOf(product)
        if (index > -1) {
          this.productList.splice(index, 1);
        }
      }
    }
  }

  dataChanged(input) {
    if (input > 100) {
      alert("amount must be under 100");
      this.activeEstimate.percentage_value = 0;
      this.activeEstimate.amount = this.activeEstimate.gross_amount;
      this.balance = this.activeEstimate.gross_amount;
    }
  }

  displayWith(disp): string | undefined {
    if (disp && disp.name) {
      return disp.name
    } else if (disp && disp.prodName) {
      return disp.prodName
    }
    return undefined
  }

  addInit() {
    
    this.commonSettingsInit()
    var date = new Date()
    this.estimateDate.reset(date)
    this.activeEstimate.created_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
    if (!this.activeEstimate.listItems) {
      this.activeEstimate.listItems = []
    }
  }

  editInit(estId) {
    //to view updated or viewed estimate in view page
    // localStorage.setItem('estimateId', estId )
    // Fetch selected estimate
    this.commonSettingsInit()

    this.estimateService.fetchById([estId]).subscribe((estimate: any) => {
      if (estimate.records !== null) {
        this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(estimate.records[0])
        this.shippingAddressEditMode = true
        this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
        if (!this.activeEstimate.taxList)
          this.activeEstimate.taxList = [];

        // Change list item keys compatible
        if (this.activeEstimate.listItems) {
          var temp = []
          for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
            temp.push({
              description: this.activeEstimate.listItems[i].description,
              product_name: this.activeEstimate.listItems[i].productName,
              quantity: this.activeEstimate.listItems[i].qty,
              rate: this.activeEstimate.listItems[i].rate,
              tax_rate: this.activeEstimate.listItems[i].tax_rate,
              total: this.activeEstimate.listItems[i].price,
              unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
              unit: this.activeEstimate.listItems[i].unit
            })
          }
          this.activeEstimate.listItems = temp
        }



        // Change TnC keys compatible
        if (this.activeEstimate.termsAndConditions) {
          temp = []
          for (let i = 0; i < this.activeEstimate.termsAndConditions.length; i++) {
            temp.push({
              orgId: this.activeEstimate.termsAndConditions[i].orgId,
              terms: this.activeEstimate.termsAndConditions[i].termsConditionText,
              uniqueKeyTerms: this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms,
              _id: this.activeEstimate.termsAndConditions[i]._id
            })
          }
          this.activeEstimate.termsAndConditions = temp
        } else if (this.termList.length < 1) {
          this.termConditionService.fetch().subscribe((response: response) => {
            if (response.termsAndConditionList) {
              this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
            }
            this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
          })
        } else {
          this.activeEstimate.termsAndConditions = this.editTerms ? this.termList.filter(trm => trm.setDefault == 'DEFAULT') : [];
        }

        // Set Dates
        var [y, m, d] = this.activeEstimate.created_date.split('-').map(x => parseInt(x))
        this.estimateDate.reset(new Date(y, (m - 1), d))

        // Tax and discounts show or hide
        if (this.activeEstimate.discount == 0) {
          this.activeEstimate.percentage_flag = null
        }
        if (this.activeEstimate.shipping_charges == 0) {
          this.activeEstimate.shipping_charges = undefined
        }
        if (this.activeEstimate.adjustment == 0) {
          this.activeEstimate.adjustment = undefined
        }
        if (this.activeEstimate.tax_amount == 0) {
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
        this.toasterService.pop('failure', 'Invalid estimate id');
        this.router.navigate(['/estimate/view'])
      }
    })
  }

  commonSettingsInit() {
    this.estimateDate.valueChanges.subscribe(value => {
      this.activeEstimate.created_date = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2)
    })

    var settings = this.settings

    // Multiple Tax
    if (settings.alstTaxName && settings.alstTaxName.length > 0) {
      this.activeEstimate.taxList = []
    }
    // Currency Dropdown
    if (settings.currencyText) {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyName;
    }
    else {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyCode;
    }

    if (settings.dateDDMMYY === false) {
      this.settings.date_format = 'mm-dd-yy'
    } else if (settings.dateDDMMYY === true) {
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      this.settings.date_format = 'dd-mm-yy'
    }

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
    if (this.productList.length < 1) {
      this.productService.fetch().subscribe((response: response) => {
        if (response.records != null) {
          this.store.dispatch(new productActions.add(response.records.filter((prod: any) =>
            (prod.enabled == 0 && prod.prodName !== undefined)
          )))
          this.setProductFilter()
        } else {
          this.setProductFilter()
        }
      })
    } else {
      this.setProductFilter()
    }

    // Fetch Clients if not in store
    if (this.allClientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          var seen = {};
          //You can filter based on Id or Name based on the requirement
          var uniqueClients = this.clientList.filter(function (item) {
            if (seen.hasOwnProperty(item.name)) {
              return false;
            } else {
              seen[item.name] = true;
              return true;
            }
          });
          this.clientList = uniqueClients;
        }
        this.setClientFilter()
        this.clientListLoading = false
      })
    } else {
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    if (this.termList.length < 1 && !this.edit) {
      this.termConditionService.fetch().subscribe((response: response) => {
        if (response.termsAndConditionList) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
      })
    } else {
      this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT');
    }


    //Fetch Settings every time
    this.settingService.fetch().subscribe((response: any) => {
      if (response.settings !== null) {
        setStorage(response.settings)
        this.user = JSON.parse(localStorage.getItem('user'))
        this.settings = this.user.setting
      }

      // Estimate Number
      if (!isNaN(parseInt(this.settings.quotNo))) {
        this.tempEstNo = parseInt(this.settings.quotNo) + 1
      } else {
        this.tempEstNo = 1
      }
      if (this.settings.quotFormat || this.settings.quotFormat == '') {
        this.activeEstimate.estimate_number = this.settings.quotFormat + this.tempEstNo
      } else {
        this.activeEstimate.estimate_number = "EST_" + this.tempEstNo
      }
    })
  }

  // Client Functions
  setClientFilter() {
    // Filter for client autocomplete
    if(this.clientList){
      this.filteredClients = this.billingTo.valueChanges.pipe(
        startWith<string | client>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterCli(name) : this.clientList.slice())
      )
  }else{
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          var seen = {};
          //You can filter based on Id or Name based on the requirement
          var uniqueClients = this.clientList.filter(function (item) {
            if (seen.hasOwnProperty(item.name)) {
              return false;
            } else {
              seen[item.name] = true;
              return true;
            }
          });
          this.clientList = uniqueClients;
        }
        this.setClientFilter()
        this.clientListLoading = false
      })
  }
}

  private _filterCli(value: string): client[] {
    if(this.clientList){
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()))
    }
  }

  selectedClientChange(client) {
    this.shippingAdressChanged = true;               //this flag is used to show shipping adrress of main client
    var temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]

    if (temp !== undefined) {
      this.activeClient = temp
      this.activeEstimate.unique_key_fk_client = temp.uniqueKeyClient
    } else {
      if (this.activeClient) {
        this.activeClient = <client>{}
      }
      this.openAddClientModal(client.option.value)
    }
    $('#estimateNumber').select()
  }

  openAddClientModal(name) {
    this.openClientModal = true
    this.addClientModal = {}
    this.addClientModal.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
      $('#add-client input[type="text"]')[1].focus()
    })
  }

  closeAddClientModal() {
    this.openClientModal = false
    $('#add-client').modal('hide')
    this.addClientModal = {}
    this.activeClient = <client>{}
    this.activeEstimate.unique_key_fk_client = null
    this.billingTo.reset('')
  }

  saveClient(status) {
    // If empty spaces
    if (!this.addClientModal.name.toLowerCase().replace(/ /g, '')) {
      this.toasterService.pop('failure', 'Organization name required');
      return false
    }

    if (status) {
      this.addClientModal.uniqueKeyClient = generateUUID(this.user.user.orgId)
      var d = new Date()
      this.addClientModal.device_modified_on = d.getTime()
      this.addClientModal.organizationId = this.user.user.orgId
      this.clientListLoading = true

      $('#saveClientButton').attr("disabled", 'disabled')
      this.clientService.add([this.clientService.changeKeysForApi(this.addClientModal)]).subscribe((response: any) => {
        if (response.status === 200) {
          this.store.dispatch(new clientActions.add([this.clientService.changeKeysForStore(response.clientList[0])]))
          this.clientList = this.allClientList.filter(recs => recs.enabled == 0)
          this.activeClient = this.clientList.filter((client) => client.uniqueKeyClient == response.clientList[0].unique_identifier)[0]
          this.billingTo.setValue(this.activeClient)
          this.toasterService.pop('success', 'Client Added Successfully');
          $('#add-client').modal('hide')
          this.clientListLoading = false
          // match a key to select and save a client in a textbox after adding client successfully
          this.activeEstimate.unique_key_fk_client = this.activeClient.uniqueKeyClient;
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      })
    }
  }

  // Product Functions
  setProductFilter() {
    // filter productlist to avoid duplicates
    var obj = {};
    //You can filter based on Id or Name based on the requirement
    var uniqueProducts = this.productList.filter(function (item) {
      if (obj.hasOwnProperty(item.prodName)) {
        return false;
      } else {
        obj[item.prodName] = true;
        return true;
      }
    });
    this.productList = uniqueProducts;

    
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
    this.modalDescription = false;
    $('#edit-item').modal('show')
    this.activeItem = { ...this.activeEstimate.listItems[index] }
  }

  addEditEstimateItem(uid = null) {
    // If product is in product list directly add to Estimate else save product and then add to Estimate
    // console.log(this.addItem, uid)

    if(this.activeItem.product_name ===null ){
      this.ifProductEmpty = true;
      this.toasterService.pop('failure', 'Product Name can not be empty');
    }else if(this.activeItem.quantity ===null || this.activeItem.quantity === 0){
      this.toasterService.pop('failure', 'Quantity can not be 0 or empty');
    }
    else if( this.activeItem.rate ===null || this.activeItem.rate === 0){
      this.toasterService.pop('failure', 'rate can not be 0 or empty');
    }

    if(this.activeItem.quantity !==null && this.activeItem.quantity !== 0 && this.activeItem.rate !== 0 &&
       this.activeItem.rate !==null ){
    if (this.activeItem.unique_identifier && this.activeEstimate.listItems!==undefined || this.activeEstimate.listItems.length != 0) {
      if (uid == null) {
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
      this.calculateEstimate()
   }
   } 
   else {
      this.saveProduct({ ...this.activeItem, prodName: this.addItem.value }, (product) => {
        this.fillItemDetails({ ...this.activeItem, ...product })
        this.activeEstimate.listItems.push(this.activeItem)
        this.addItem.reset('')
        this.activeItem = {
          quantity: 1,
          rate: 0.00
        }
        this.calculateEstimate()
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

        if (callback !== null) {
          callback(temp)
        }
        this.toasterService.pop('success', 'Product has been added')
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    })
  }

  closeEditItemModal() {
    this.modalDescription = true;
    this.activeItem = {
      quantity: 1,
      rate: 0.00,
      total: 0.00
    }
    $('#edit-item').modal('hide')
  }

  removeItem(index) {
    this.activeEstimate.listItems.splice(index, 1)
    this.calculateEstimate()
  }

  calculateTotal() {
    if (Object.keys(this.activeItem).length > 0) {
      let rateParse = parseFloat(this.activeItem.rate)
      if (isNaN(rateParse)) {
        rateParse = 0
      }
      this.activeItem.total = (this.activeItem.quantity * rateParse)

      // Discounts

      if (isNaN(this.activeItem.discount) || this.activeItem.discount == 0) {
        this.activeItem.discount = 0
      } else {
        this.activeItem.discount_amount = (this.activeItem.rate * this.activeItem.discount / 100) * this.activeItem.quantity
        this.activeItem.total -= this.activeItem.discount_amount
      }

      // Tax
      if (isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0) {
        this.activeItem.tax_rate = 0
      } else {
        this.activeItem.tax_amount = (this.activeItem.rate * this.activeItem.tax_rate / 100) * this.activeItem.quantity
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
    if (this.addTermModal.terms.replace(/ /g, '') == '') {
      this.toasterService.pop('failure', 'Term text is mandatory');
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
          this.toasterService.pop('failure', 'Error occured');
        }
      })
    }
  }

  addRemoveTermsFromEstimate(term) {
    var index = this.activeEstimate.termsAndConditions.findIndex(trms => trms.uniqueKeyTerms == term.uniqueKeyTerms)
    if (index == -1) {
      this.activeEstimate.termsAndConditions.push(term)
    } else {
      this.activeEstimate.termsAndConditions.splice(index, 1)
    }
  }

  isTermInEstimate(term) {
    if (this.activeEstimate.termsAndConditions) {
      return this.activeEstimate.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
    } else {
      return false
    }
  }

  // Estimate Functions
  fillItemDetails(prod = null) {
    this.ifProductEmpty = false;
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
    if (!this.activeEstimate.unique_key_fk_client) {
      this.toasterService.pop('failure', 'Client not selected');
      $('#bill-to-input').select()
      return false
    }

    if (this.activeEstimate.listItems.length == 0 || !status) {
      alert('You haven\'t added item')
      return false
    }

    if (this.balance < 0) {
      if (confirm('It seems like you have estimate with negative balance, should we adjust it for you?')) {
        this.activeEstimate.adjustment += this.balance
        this.calculateEstimate()
      }
      return false
    }

    $('#estSubmitBtn').attr('disabled', 'disabled')
    this.activeEstimate.organization_id = parseInt(this.user.user.orgId)



    var temp = []
    this.activeEstimate.termsAndConditions.forEach(tnc => {
      temp.push({ ...this.termConditionService.changeKeysForInvoiceApi(tnc), unique_key_fk_quotation: this.activeEstimate.unique_identifier })

    })
  //   for(let i = 0;i<temp.length; i++){
  //   if(temp[i].terms_condition === undefined){
  //     temp.splice(i,1);
  //   }
  // }
    this.activeEstimate.termsAndConditions = temp


    if (!this.edit) {
      this.activeEstimate.unique_identifier = generateUUID(this.user.user.orgId)
    }
    for (var i = this.activeEstimate.listItems.length; i > 0; i--) {
      if (!this.activeEstimate.listItems[i - 1].product_name || this.activeEstimate.listItems[i - 1].product_name == '') {
        this.activeEstimate.listItems.splice(i - 1, 1)
      }
    }

    if (this.activeEstimate.taxList) {
      for (var t = 0; t < this.activeEstimate.taxList.length; t++) {
        if (this.activeEstimate.taxList[t] == null) {
          this.activeEstimate.taxList.splice(t, 1)
        }
      }
    }

    this.activeEstimate.device_modified_on = new Date().getTime()

    var self = this
    if(this.activeEstimate.estimate_number !==""){
    this.estimateService.add([this.activeEstimate]).subscribe((response: any) => {
      if (response.status !== 200) {
        //alert('Couldnt save Estimate')
        this.toasterService.pop('failure', 'Error occured')
      } else if (response.status === 200) {
        // Add Estimate to store
        if (this.edit) {
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
        if (!this.edit) {
          this.updateSettings()
        }

        // if (this.edit && this.estimateDelete === false) {
        //   //  this.toasterService.pop('success', 'Estimate updated successfully');
        //   this.router.navigate(['/estimate/view'])
        // } else if(this.estimateDelete === undefined) {
        //   this.toasterService.pop('success', 'Estimate saved successfully');
        //   this.router.navigate(['/estimate/view'])
        //   self.resetFormControls()
        //   self.ngOnInit()
        // }

        // Reset Create Estimate page for new Estimate creation or redirect to view page if edited
        if (this.edit) {
          //  this.toasterService.pop('success', 'Estimate updated successfully');
          this.router.navigate(['/estimate/view'])
        } else{
          this.toasterService.pop('success', 'Estimate saved successfully');
          self.resetFormControls()
          self.ngOnInit()
        }
      }
      $('#estSubmitBtn').removeAttr('disabled')
    })
  }
  // validate user if he removes invoice number and try to save invoice 
  else {                    
    this.toasterService.pop('failure', 'Couldnt save estimate Please add estimate Number');
    this.activeEstimate.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT');
    $('#estSubmitBtn').removeAttr('disabled')
  }
  }

  deleteEstimate() {
    this.activeEstimate.deleted_flag = 1
    // localStorage.setItem('deleteEstimateId', "1" )
    // this.estimateDelete = false;
    this.save(true)
    this.toasterService.pop('success', 'estimate Deleted successfully');
    // this.closeDeleteEstimateModal();
  }

  // openDeleteEstimateModal() {
  //   this.estimateDelete = true
  //   $('#delete-estimate').modal('show')
  // }

  // closeDeleteEstimateModal(){
  //   $('#delete-estimate').modal('hide')
  // }

  calculateEstimate() {
    var gross_amount = 0
    var deductions = 0
    var additions = 0

    if (this.activeEstimate.listItems) {
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
      if (isNaN(this.activeEstimate.discount)) {
        this.activeEstimate.discount = 0
      }
      deductions += this.activeEstimate.discount
      this.activeEstimate.percentage_value = this.activeEstimate.discount / this.activeEstimate.gross_amount * 100
    }

    // Tax
    if (this.activeEstimate.tax_rate != null) {
      if (isNaN(this.activeEstimate.tax_rate)) {
        this.activeEstimate.tax_rate = 0
      }
      additions += (this.activeEstimate.gross_amount - this.activeEstimate.discount) * this.activeEstimate.tax_rate / 100
    }

    if (this.activeEstimate.taxList && this.activeEstimate.taxList.length > 0) {
      var temp_tax_amount = 0
      for (var i = 0; i < this.activeEstimate.taxList.length; i++) {
        if (this.activeEstimate.taxList[i]) {
          this.activeEstimate.taxList[i].selected = true
          if (isNaN(this.activeEstimate.taxList[i].percentage)) {
            this.activeEstimate.taxList[i].percentage = 0
          }
          this.activeEstimate.taxList[i].calculateValue = (this.activeEstimate.gross_amount - deductions) / 100 * this.activeEstimate.taxList[i].percentage
          temp_tax_amount += this.activeEstimate.taxList[i].calculateValue
        }
      }
      additions += temp_tax_amount
    }
    this.activeEstimate.tax_amount = additions

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
    this.balance = parseFloat(this.activeEstimate.amount.toFixed(2))
  }

  resetFormControls() {
    this.billingTo.setValue('')
    this.addItem.reset('')

    this.activeClient = <client>{}
    // Estimate Number
    if (!isNaN(parseInt(this.settings.quotNo))) {
      this.tempEstNo = parseInt(this.settings.quotNo) + 1
    } else {
      this.tempEstNo = 1
    }
    if (this.settings.quotFormat || this.settings.quotFormat == '') {
      this.activeEstimate.estimate_number = this.settings.quotFormat + this.tempEstNo
    } else {
      this.activeEstimate.estimate_number = "EST_" + this.tempEstNo
    }
    this.activeEstimate.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT')
  }

  updateSettings() {
    var user = JSON.parse(localStorage.getItem('user'))

    let matches = this.activeEstimate.estimate_number.match(/\d+$/)
    if (matches) {
      user.setting.quotNo = matches[0]
      user.setting.quotFormat = this.activeEstimate.estimate_number.split(user.setting.quotNo)[0]
    } else {
      user.setting.quotNo = 0
      user.setting.setInvoiceFormat = this.activeEstimate.estimate_number
    }

    localStorage.setItem('user', JSON.stringify(user))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    var settings1 = {
      androidSettings: user.setting,
      android_donot_update_push_flag: 1
    }
    settings1.androidSettings.estNo = this.tempEstNo

    this.settingService.add(settings1).subscribe((response: any) => { })
  }
}