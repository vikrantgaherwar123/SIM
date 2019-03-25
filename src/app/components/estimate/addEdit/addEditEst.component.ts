import { Component, OnInit } from '@angular/core'
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of } from 'rxjs';
import { Router, ActivatedRoute, NavigationStart  } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { ToasterService } from 'angular2-toaster'
import { DatePipe } from '@angular/common';
import { Title }     from '@angular/platform-browser';
import { DateAdapter } from '@angular/material';
import { Store } from '@ngrx/store'

import { CONSTANTS } from '../../../constants'
import { response, addEditEstimate, estimate , client, terms, setting, product } from '../../../interface'
import { generateUUID, setStorage } from '../../../globalFunctions'

import { EstimateService } from '../../../services/estimate.service'
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { TermConditionService } from '../../../services/term-condition.service'
import { SettingService } from '../../../services/setting.service'

import * as estimateActions from '../../../actions/estimate.action'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'
import * as termActions from '../../../actions/terms.action'
import { AppState } from '../../../app.state'



@Component({
  selector: 'app-estimate',
  templateUrl: './addEditEst.component.html',
  styleUrls: ['./addEditEst.component.css'],
  providers: [DatePipe]
})


export class AddEditEstComponent implements OnInit {


  estimateList: estimate[]
  activeEst: estimate
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
  shippingChange: boolean = true
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
  estimateListLoading: boolean
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
  showTaxRate: number;
  showTaxRateFlag: boolean;
  showDiscountRateFlag: boolean;
  showDiscountRate: number;
  setTaxOnItem: boolean;
  setDiscountOnItem: boolean;
  showDiscountField: boolean;
  tncLoading: boolean;
  settingsLoading: boolean;
  estimateId: any;
  recentEstimateList: any = [];
  disabledDescription: boolean = false;
  discountFlag: any;
  viewTodaysEstimate: boolean = false;
  estListLoader: boolean;

  constructor(private CONST: CONSTANTS, public router: Router,
    private adapter: DateAdapter<any>,
    public toasterService: ToasterService,
    private route: ActivatedRoute,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private settingService: SettingService,
    private productService: ProductService,
    private datePipe: DatePipe,
    private store: Store<AppState>,
    private titleService: Title
  ) {
    this.toasterService = toasterService
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    store.select('client').subscribe(clients => this.allClientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)
    
    // save button processing script
    $(document).ready(function () {
      $('.save').on('click', function () {
        var $this = $(this);
        var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Saving...';
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
    this.titleService.setTitle('Simple Invoice | Estimate');
    this.activeEstimate = <addEditEstimate>{}
    this.route.params.subscribe(params => {
      if (params.estId) {
        this.estimateId = params.estId;
        this.edit = true
        this.editTerms = false
        this.editInit(params.estId)
        this.fetchCommonData()
      } else {
        this.fetchCommonData()
        this.addInit()
      }
    })
    //get other estimates which are not deleted 
    this.store.select('estimate').subscribe(estimates => {
      this.estimateList = estimates
    })
    
    this.fetchEstimates();
  }


  dataChanged(input) {
    if (input > 100) {
      alert("amount must be under 100");
      this.activeEstimate.percentage_value = 0;
      this.activeEstimate.discount = 0;
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
    //tax and discount position according to settings changed
    if(this.settings.taxFlagLevel === 1){
      this.showTaxRate = 0;
    }
    // condition for disable tax 
    else if(this.settings.taxFlagLevel === 2){
      this.showTaxRateFlag = false;
    }
    if(this.settings.discountFlagLevel === 0){
      this.showDiscountRateFlag = false;
      this.showDiscountRate = 0;
    }
    // condition for disable discount 
    else if(this.settings.discountFlagLevel === 2){
      this.showDiscountRateFlag = false;
    }


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
        this.discountFlag = estimate.records[0].discountFlag;
        this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(estimate.records[0])
        if(this.activeEstimate.discount !==0){
          this.discountFlag = 1;
        }
        this.shippingAddressEditMode = true
        this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping address from device
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
              discount: this.activeEstimate.listItems[i].discountRate,
              rate: this.activeEstimate.listItems[i].rate,
              tax_rate: this.activeEstimate.listItems[i].taxRate,
              total: this.activeEstimate.listItems[i].price,
              unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
              unit: this.activeEstimate.listItems[i].unit
            })
          }
          this.activeEstimate.listItems = temp
          //show discount and tax fields when item settings is selected
          for(let i=0;i<this.activeEstimate.listItems.length;i++){
          this.showTaxRate = this.activeEstimate.listItems[i].tax_rate;
          if(this.showTaxRate!==0){
            this.settings.taxFlagLevel = 0;
            // this.setTaxOnItem = true;
          }
          this.showDiscountRate = this.activeEstimate.listItems[i].discount;
          if(this.showDiscountRate!==0){
            this.settings.discountFlagLevel = 1;
            this.showDiscountRateFlag = false;
            this.activeEstimate.discount_on_item = 1;
            // this.setDiscountOnItem = true;
          }
          }
        }

        //tax and discount position according to settings changed
        if (this.settings.taxFlagLevel === 0 && this.showTaxRate !== 0) {
          this.showTaxRateFlag = false;
        } else {
          this.activeEstimate.tax_on_item = 2
          this.showTaxRateFlag = true;
        }
        if (this.settings.discountFlagLevel === 1 && this.showDiscountRate !== 0) {
          this.showDiscountRateFlag = false;
          this.showDiscountField = true;
        } else {
          this.activeEstimate.discount_on_item = 2
          this.showDiscountRateFlag = true;
          this.showDiscountField = false;
        }
        //hide discount and tax fields when bill settings is selected
        if (this.activeEstimate.discount !== 0) {
          this.settings.discountFlagLevel = 0;
          this.activeEstimate.discount_on_item = 0;
        }
        if (this.activeEstimate.tax_rate !== 0) {
          this.settings.taxFlagLevel = 1;
          this.showTaxRate=0;
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
          },err => this.openErrorModal())
        } else {
          this.activeEstimate.termsAndConditions = this.editTerms ? this.termList.filter(trm => trm.setDefault == 'DEFAULT') : [];
        }

        // Set Dates
        var [y, m, d] = this.activeEstimate.created_date.split('-').map(x => parseInt(x))
        this.estimateDate.reset(new Date(y, (m - 1), d))

        // Tax and discounts show or hide
        if (this.activeEstimate.discount == 0) {
          this.activeEstimate.percentage_flag = null
        }else{
          this.activeEstimate.discount_on_item = 0;
        }
        if (this.activeEstimate.shipping_charges == 0) {
          this.activeEstimate.shipping_charges = undefined
        }
        if (this.activeEstimate.adjustment == 0) {
          this.activeEstimate.adjustment = undefined
        }
        if (this.activeEstimate.tax_amount == 0 || this.activeEstimate.tax_rate == 0 ) {
          this.activeEstimate.tax_rate = null
        }else{
          this.activeEstimate.tax_on_item = 1;
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
    },err => this.openErrorModal())
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

     // Date format selection with locale
    if (settings.dateDDMMYY === false) {
      // this.settings.date_format = 'mm-dd-yy'
      this.settings.date_format = this.adapter.setLocale('en-US');
    } else if (settings.dateDDMMYY === true) {
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      // this.settings.date_format = 'dd-mm-yy'
      this.settings.date_format = this.adapter.setLocale('en-GB');
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
        this.activeEstimate.tax_on_item = 2
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
        }
        //  else {
        //   this.setProductFilter()
        // }
      },err => this.openErrorModal())
    } else {
      this.setProductFilter()
    }

    // Fetch Clients if not in store
    if (this.allClientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          this.removeEmptyNameClients();
          //findout shipping address of selected client from clientlist
          var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEstimate.unique_key_fk_client)[0]
          if(client){
            this.shippingAddress = client.shippingAddress;
            this.activeEstimate.shipping_address = this.shippingAddress;
          }
          
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
        
      },err => this.openErrorModal())
    } else {
      
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    if (this.termList.length < 1 && !this.edit) {
      this.tncLoading = false;
      this.termConditionService.fetch().subscribe((response: response) => {
        this.tncLoading = true;
        if (response.termsAndConditionList) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
      },err => this.openErrorModal())
    } else {
      this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT');
    }


    //Fetch Settings every time
    this.settingsLoading = false;
    this.settingService.fetch().subscribe((response: any) => {
      this.settingsLoading = true;
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
        this.activeEstimate.estimate_number = this.tempEstNo.toString();
      }

    //   if(!this.edit){
    //     this.tempEstNo = JSON.parse(localStorage.getItem('estNo'));
    //     if (this.tempEstNo) {
    //     //regex code to find no. from string
    //     // var r = /\d+/;
    //     // var m = r.exec(this.tempInvNo.toString())[0]
    //     // var s =parseInt(m);
    //     // console.log(s);


    //     // this regex code separates string and no.
    //     var text = this.tempEstNo.toString().split(/(\d+)/)
    //     var t = text[0] //text
    //     var n = parseInt(text[1]) //number
    //     if( isNaN(n)){
    //       n = 0; 
    //     }
    //     // var x = t+(n+1);
    //     this.tempEstNo = n + 1 ;

    //   } else {
    //     this.tempEstNo = 1
    //     t = this.settings.setInvoiceFormat;
    //   }
    //   if (this.settings.setInvoiceFormat) {
    //     this.activeEstimate.estimate_number = t + this.tempEstNo
    //   } else {
    //     this.activeEstimate.estimate_number = this.tempEstNo.toString();
    //   }
    // }
    },err => this.openErrorModal()
    )
  }

  // Client Functions
  setClientFilter() {
    // Filter for client autocomplete
    if (this.clientList) {
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
      this.removeEmptyNameClients();
      this.filteredClients = this.billingTo.valueChanges.pipe(
        startWith<string | client>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterCli(name) : this.clientList.slice())
      )
  }else{
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false;
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          this.removeEmptyNameClients();
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
          this.filteredClients = this.billingTo.valueChanges.pipe(
            startWith<string | client>(''),
            map(value => typeof value === 'string' ? value : value.name),
            map(name => name ? this._filterCli(name) : this.clientList.slice())
          )
        }
        // this.setClientFilter()
      },err => this.openErrorModal()
      )
  }
}

  private _filterCli(value: string): client[] {
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()))
  }

  removeEmptyNameClients(){
    //remove whitespaces from clientlist
    for (let i = 0; i < this.clientList.length; i++) {
      if(!this.clientList[i].name){
        this.clientList.splice(i,1);
      }
      var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "");
      if (tempClient === "") {
        this.clientList.splice(i);
      }
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
    this.addClientModal.name = this.billingTo.value;
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

    var proStatus = true
    // If adding or editing client, make sure client with same name doesnt already exist
      var tempClientName = this.addClientModal.name.toLowerCase().replace(/ /g, '')

      var tempCompare = ''
      if (this.clientList.length > 0) {
        for (var p = 0; p < this.clientList.length; p++) {
          tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempClientName) {
            proStatus = false
            break
          }
        }
      }


    if (status && proStatus) {
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
          window.location.reload(true);
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      },err => this.openErrorModal()
      )
    }else {
      if (!proStatus) {
        this.toasterService.pop('failure', 'Client name already exists.');
      }
    }
  }

  // Product Functions
  setProductFilter() {
    // filter productlist to avoid duplicates
    var obj = {};
    //You can filter based on Id or Name based on the requirement
    var uniqueProducts = this.productList.filter(function (item) {
      if(item.prodName){
      if (obj.hasOwnProperty(item.prodName)) {
        return false;
      } else {
        obj[item.prodName] = true;
        return true;
      }
    }
    });
    this.productList = uniqueProducts;
    //remove whitespaces from productList
    for (let i = 0; i < this.productList.length; i++) {
      if (this.productList[i].prodName == undefined) {
        this.productList.splice(i,1);
      }
      var tempProduct = this.productList[i].prodName.toLowerCase().replace(/\s/g, "")
      if (tempProduct === "") {
        this.productList.splice(i,1);
      }
    }

    
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

    if(this.activeItem.quantity !==null &&  this.activeItem.rate !== 0 && this.activeItem.unique_identifier &&
       this.activeItem.rate !==null ){
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
   else {
   
   if(this.activeItem.quantity !== 0 && this.activeItem.rate !== 0 && this.addItem.value !=="") {
    var tempCompare = ''
    var duplicateProduct = false;
    for (var p = 0; p < this.productList.length; p++) {
      if (this.productList[p].prodName) {
        tempCompare = this.productList[p].prodName.toLowerCase().replace(/ /g, '');
      }
      // If Name is same,
      if (tempCompare === this.addItem.value.toLowerCase().replace(/ /g, '')) {
        duplicateProduct = true;
      }
    }
    if(duplicateProduct === false){
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
    }else{
      this.toasterService.pop('failure', 'Duplicate name or field is empty!!!');
    }
    }
  }
  }

  saveProduct(add_product, callback: Function = null) {
    var d = new Date()

    var product = {
      device_modified_on: d.getTime(),
      discription: add_product.description ? add_product.description : '',
      organization_id: this.user.user.orgId,
      prod_name: add_product.prodName,
      tax : add_product.tax,
      discountAmt : add_product.discountAmt,
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
        //called store and set product here to update store when new product added
        this.store.select('product').subscribe(products => this.productList = products)
        // this.setProductFilter();
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    },err => this.openErrorModal()
    )
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
        if(this.activeItem.discount_amount){
          this.activeItem.tax_amount = ((this.activeItem.rate * this.activeItem.quantity) - this.activeItem.discount_amount) * this.activeItem.tax_rate/100;
          this.activeItem.total = (this.activeItem.rate * this.activeItem.quantity) - this.activeItem.discount_amount +  this.activeItem.tax_amount;
        }else{
          this.activeItem.total += this.activeItem.tax_amount
        }
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
      },err => this.openErrorModal()
      )
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
      temp.push({ ...this.termConditionService.changeKeysForInvoiceApi(tnc)}) //, unique_key_fk_quotation: this.activeEstimate.unique_identifier 
    })
  
    this.activeEstimate.termsAndConditions = temp


    if (!this.edit) {
      this.activeEstimate.unique_identifier = generateUUID(this.user.user.orgId)
    }
    for (var i = this.activeEstimate.listItems.length; i > 0; i--) {
      this.activeEstimate.listItems[i - 1].unique_key_fk_quotation = this.activeEstimate.unique_identifier
      if (!this.activeEstimate.listItems[i - 1].product_name || this.activeEstimate.listItems[i - 1].product_name == '') {
        this.activeEstimate.listItems.splice(i - 1, 1)
      }
    }

    for (var j = 0; j < this.activeEstimate.termsAndConditions.length; j++) {
      this.activeEstimate.termsAndConditions[j].unique_key_fk_quotation = this.activeEstimate.unique_identifier
    }

    if (this.activeEstimate.taxList) {
      for (var t = 0; t < this.activeEstimate.taxList.length; t++) {
        if (this.activeEstimate.taxList[t] == null) {
          this.activeEstimate.taxList.splice(t, 1)
        }
      }
    }

    this.activeEstimate.device_modified_on = new Date().getTime()
    //add shipping address
    if(this.shippingAddressEditMode === true){
    this.activeEstimate.shipping_address = this.shippingAddress;
    }else{
      this.activeEstimate.shipping_address = this.activeClient.shippingAddress
    }

    var self = this
    if(this.activeEstimate.estimate_number !=="" && this.activeEstimate.created_date){
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
            } else{
              // self.store.dispatch(new estimateActions.edit({index, value: this.estimateService.changeKeysForStore(response.estimateList[0])}))
              // this.edit = false;
            }
          })
        } else {
          self.store.dispatch(new estimateActions.add([this.estimateService.changeKeysForStore(response.quotationList[0])]))
        }

        // Reset Create Estimate page for new Estimate creation or redirect to view page if edited
        if (this.edit && this.activeEstimate.deleted_flag !== 1) {
           this.toasterService.pop('success', 'Estimate updated successfully');
          this.router.navigate([`estimate/view/${this.estimateId}`])
        } else if(this.activeEstimate.deleted_flag !== 1) {
          //add recently added esimate in store
          this.fetchEstimates();
          this.toasterService.pop('success', 'Estimate saved successfully');
          this.updateSettings();
          self.resetFormControls()
          self.addInit()
        }
      }
      $('#estSubmitBtn').removeAttr('disabled')
    },err => this.openErrorModal()
    )
  }
  // validate user if he removes invoice number and try to save invoice 
  else {                    
    this.toasterService.pop('failure', 'Couldnt save estimate Please add estimate Number');
    this.activeEstimate.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT');
    $('#estSubmitBtn').removeAttr('disabled')
  }
  }

  getClientName(id) {
    if(this.clientList){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  deleteEstimate() {
    this.activeEstimate.deleted_flag = 1
    this.save(true)
    this.toasterService.pop('success', 'estimate Deleted successfully');
    this.router.navigate(['/estimate/add']);
  }


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
      //remove digits after two decimal
      var value = this.activeEstimate.discount.toString().substring(0, this.activeEstimate.discount.toString().indexOf(".") + 3);
      this.activeEstimate.discount = parseFloat(value);
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
    // multiple taxes
    if (this.activeEstimate.taxList && this.activeEstimate.taxList.length > 0) {
      var temp_tax_amount = 0
      for (var i = 0; i < this.activeEstimate.taxList.length; i++) {
        if (this.activeEstimate.taxList[i]) {
          this.activeEstimate.taxList[i].selected = true
          if (isNaN(this.activeEstimate.taxList[i].percentage)) {
            this.activeEstimate.taxList[i].percentage = 0
          }
          this.activeEstimate.taxList[i].calculateValue = (this.activeEstimate.gross_amount - deductions) / 100 * this.activeEstimate.taxList[i].percentage
          //remove digits after two decimal
          var b = this.activeEstimate.taxList[i].calculateValue.toString().substring(0, this.activeEstimate.taxList[i].toString().indexOf(".") + 5);
          this.activeEstimate.taxList[i].calculateValue = parseFloat(b);
          temp_tax_amount += this.activeEstimate.taxList[i].calculateValue
        }
      }
      additions += temp_tax_amount
    }
    this.activeEstimate.tax_amount = additions
    //remove digits after two decimal
    var value = this.activeEstimate.tax_amount.toString().substring(0, this.activeEstimate.tax_amount.toString().indexOf(".") + 3);
    this.activeEstimate.tax_amount = parseFloat(value);

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
    this.activeEstimate = <addEditEstimate>{}
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
      this.activeEstimate.estimate_number = this.tempEstNo.toString();
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
    // settings1.androidSettings.estNo = this.tempEstNo

    this.settingService.add(settings1).subscribe((response: any) => { },err => this.openErrorModal()
    )
  }

  // error modal
  openErrorModal() {
    $('#error-message').modal('show')
    $('#error-message').on('shown.bs.modal', (e) => {
    })
  }


  //todays estimates functionality

  fetchEstimates() {
    // Fetch estimates with given query

    if (this.estimateList.length < 1) {
      var start = new Date();
      start.setHours(0, 0, 0, 0);
      var query = {
        clientIdList: null,
        startTime: start.getTime(),
        endTime: new Date().getTime()
      }

      this.estListLoader = true
      this.estimateService.fetchByQuery(query).subscribe((response: any) => {
        if (response.status === 200) {
          this.estListLoader = false
          this.store.dispatch(new estimateActions.reset(response.records ? response.records.filter(rec => rec.enabled == 0) : []))
          // Set Active invoice whenever invoice list changes
          this.store.select('estimate').subscribe(estimates => {
            this.estimateList = estimates
          })
        }
      }, err => this.openErrorModal());
    }
  }

  setActiveEst(estId: string = '') {
    this.viewTodaysEstimate = true;
    this.estimateId = estId;
    this.estimateListLoading = true;
    this.activeEst = this.estimateList.filter(est => est.unique_identifier == estId)[0]
    this.setActiveClient()
  }
 
  setActiveClient() {
    if (this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        this.removeEmptyNameClients();
      },err => this.openErrorModal()
      )
    }

    if (this.activeEst) {
      for(let i=0; i<this.activeEst.alstQuotProduct.length;i++){
      if(!this.activeEst.alstQuotProduct[i].productName){
        this.activeEst.alstQuotProduct[i].productName = this.activeEst.alstQuotProduct[i].product_name;
      }
      if(!this.activeEst.alstQuotProduct[i].qty){
        this.activeEst.alstQuotProduct[i].qty = this.activeEst.alstQuotProduct[i].quantity;
      }
      if(!this.activeEst.alstQuotProduct[i].taxRate){
        this.activeEst.alstQuotProduct[i].taxRate = this.activeEst.alstQuotProduct[i].tax_rate;
      }
      if(!this.activeEst.alstQuotProduct[i].discountRate){
        this.activeEst.alstQuotProduct[i].discountRate = this.activeEst.alstQuotProduct[i].discount;
      }
      if(!this.activeEst.alstQuotProduct[i].price){
        this.activeEst.alstQuotProduct[i].price = this.activeEst.alstQuotProduct[i].total;
      }
    }
    for(let i=0; i<this.activeEst.alstQuotTermsCondition.length;i++){
      if(!this.activeEst.alstQuotTermsCondition[i].termsConditionText){
        this.activeEst.alstQuotTermsCondition[i].termsConditionText = this.activeEst.alstQuotTermsCondition[i].terms_condition;
      }
    }
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEst.unique_key_fk_client)[0]
      if (client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
  }

  goEdit(estId) {
    this.viewTodaysEstimate = false;
    this.router.navigate([`estimate/edit/${estId}`])
  }

  makeInvoice() {
    this.router.navigate([`invoice/edit/${this.activeEst.unique_identifier}`])
  }

  downloadEstimate(type) {
    if (type == "download") {
      $('#downloadBtn').attr('disabled', 'disabled')
    } else if (type == "preview") {
      $('#previewBtn').attr('disabled', 'disabled')
    }

    this.estimateService.fetchPdf(this.activeEst.unique_identifier).subscribe((response: any) => {
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
    },err => this.openErrorModal()
    )
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

    var estimateNumber = this.activeEst.quetationNo.replace('/', '')
    return 'ESTPDF_' + estimateNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
  }

  addNewEstimate(){
    this.viewTodaysEstimate = false;
    this.estimateId = '';
    this.activeClient = <client>{}
    this.shippingAddress = null;
    this.router.navigate(['/estimate/add'])
  }
}