import { Component, OnInit } from '@angular/core'
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of } from 'rxjs';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd  } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { ToasterService, Toast } from 'angular2-toaster'
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { Title }     from '@angular/platform-browser';
import { DateAdapter } from '@angular/material';
import { Store } from '@ngrx/store'

import { CONSTANTS } from '../../../constants'
import { response, addEditEstimate, estimate , client, terms, setting, product, recentEstimates } from '../../../interface'
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
  recentEstimateList: recentEstimates[];
  recentEstimate: recentEstimates = <recentEstimates>{}

  appSettings: any
  activeSettings: setting

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
  hideme = [] //show more or less flag

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
  showTaxRate: number;
  showTaxRateFlag: boolean;
  showDiscountRateFlag: boolean;
  showDiscountRate: number;
  showTaxOnItem: boolean = false;
  showDiscountOnItem: boolean = false;
  showDiscountField: boolean;
  tncLoading: boolean;
  settingsLoading: boolean;
  estimateId: any;
  disabledDescription: boolean = false;
  estListLoader: boolean;
  noProductSelected: boolean = false;
  noClientSelected: boolean = false;
  errorMessage: any;
  defaultChecked: boolean;
  noDiscountOnItem: boolean = true;
  noTaxOnItem: boolean = true;
  recentEstListLoading: boolean;
  noRecentEstimate: boolean;
  noShippingCharges: boolean = true;
  noAdjustment: boolean = true;
  includeTax: boolean;
  taxLabel: string;
  discountLabel: string;
  showBalPaidAmountFlag: boolean;

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
    private toastr: ToastrService,
    private titleService: Title
  ) {
    
    this.toasterService = toasterService
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    store.select('client').subscribe(clients => this.allClientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)
    store.select('estimate').subscribe(estimates => this.estimateList = estimates)
    store.select('recentEstimates').subscribe(recentInvoices => this.recentEstimateList = recentInvoices)

  
    
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
        this.fetchCommonData()
        this.editInit(params.estId)
      } else {
        this.fetchCommonData()
        this.addInit()
      }
    })
   
    if(this.recentEstimateList.length < 1){
      this.fetchEstimates();
    }
    
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

    this.commonSettingsInit()
    var date = new Date()
    this.estimateDate.reset(date)
    this.activeEstimate.created_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

    if (!this.activeEstimate.listItems) {
      this.activeEstimate.listItems = []
    }
    
  }

  setSettings(){
    //set settingFlags according to edit i.e invoice saved previously
    if(this.activeEstimate.discount_on_item == 0){
      this.activeEstimate.percentage_flag = 1;
      this.noDiscountOnItem = false;
      this.discountLabel = "On Bill"
    }else if(this.activeEstimate.discount_on_item == 1){
      this.noDiscountOnItem = true;
      this.discountLabel = "On Item"
    }

    if(this.activeEstimate.tax_on_item == 0){
      this.taxtext = "Tax (on Item)"
      this.noTaxOnItem = true;
      this.taxLabel = "On Item"
    }else if(this.activeEstimate.tax_on_item == 1){
      this.noTaxOnItem = false;
      this.taxLabel = "On Bill"
    }

    //if item and Disabled condition  
    if(this.activeEstimate.discount_on_item == 2){
      this.noDiscountOnItem = true;
      this.discountLabel = "Disabled"
    }

    if(this.activeEstimate.tax_on_item == 2){
      this.noTaxOnItem = true;
      this.taxLabel = "Disabled"
    }

    //if setting of bill but no value added
    if (this.activeEstimate.discount == 0) {
      this.noDiscountOnItem = true;
    }
    if (this.activeEstimate.tax_rate == 0) {
      this.noTaxOnItem = true;
    }

    
    //item settings
    //this.activeEstimate.tax_on_item = 0
    //this.activeEstimate.discount_on_item = 1

    //Bill settings
    //this.activeEstimate.tax_on_item = 1
    //this.activeEstimate.discount_on_item = 0


    //shipping & adjustment
    if(this.activeEstimate.shipping_charges){
      this.noShippingCharges = false
    }
    if(this.activeEstimate.adjustment){
      this.noAdjustment = false
    }
    //set balance
    this.balance = this.activeEstimate.amount;
  }

  editInit(estId) {
    //to view updated or viewed estimate in view page
    // Fetch selected estimate
    this.commonSettingsInit()
    this.recentEstListLoading = true;

    // Fetch selected invoice
    this.activeEstimate = this.estimateList.find(x => x.unique_identifier === estId);
    if(this.activeEstimate){
      this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(this.activeEstimate)
    }
    
    if(this.recentEstimateList.length > 0 && !this.activeEstimate){
      this.activeEstimate = this.recentEstimateList.find(x => x.unique_identifier === estId);
      this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(this.activeEstimate)
    }
    
    if(this.activeEstimate){
      this.recentEstListLoading = false;

      this.setSettings();

        this.shippingAddressEditMode = true
        this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping address from device
        if (!this.activeEstimate.taxList)
          this.activeEstimate.taxList = [];

        // Change list item keys compatible
        if (this.activeEstimate.listItems) {
          var temp = []
          for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
            //set variables according to data comes from API and store 
            if(this.activeEstimate.listItems[i].discount || this.activeEstimate.listItems[i].discount == 0){
          
              this.activeEstimate.listItems[i].discountRate = this.activeEstimate.listItems[i].discount;
            }
            if(this.activeEstimate.listItems[i].discountAmt || this.activeEstimate.listItems[i].discountAmt ==0){
              this.activeEstimate.listItems[i].discount_amount = this.activeEstimate.listItems[i].discountAmt;
            }
            if(this.activeEstimate.listItems[i].taxAmount || this.activeEstimate.listItems[i].taxAmount == 0){
              this.activeEstimate.listItems[i].tax_amount = this.activeEstimate.listItems[i].taxAmount;
            }
            
            if(this.activeEstimate.listItems[i].product_name){
              this.activeEstimate.listItems[i].productName = this.activeEstimate.listItems[i].product_name;
            }
            if(this.activeEstimate.listItems[i].quantity){
              this.activeEstimate.listItems[i].qty = this.activeEstimate.listItems[i].quantity;
            }
            if(this.activeEstimate.listItems[i].total){
              this.activeEstimate.listItems[i].price = this.activeEstimate.listItems[i].total;
            }
            if(this.activeEstimate.listItems[i].unique_identifier){
              this.activeEstimate.listItems[i].uniqueKeyListItem = this.activeEstimate.listItems[i].unique_identifier;
            }
            temp.push({
              description: this.activeEstimate.listItems[i].description,
              product_name: this.activeEstimate.listItems[i].productName,
              quantity: this.activeEstimate.listItems[i].qty,
              discount: this.activeEstimate.listItems[i].discountRate,
              discount_amount: this.activeEstimate.listItems[i].discount_amount,
              tax_amount: this.activeEstimate.listItems[i].tax_amount,
              rate: this.activeEstimate.listItems[i].rate,
              tax_rate: this.activeEstimate.listItems[i].taxRate,
              total: this.activeEstimate.listItems[i].price,
              unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
              unit: this.activeEstimate.listItems[i].unit
            })
          }
          this.activeEstimate.listItems = temp
          for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
            if(this.activeEstimate.listItems[i].discount !==0){
              this.activeEstimate.discount_on_item = 1;
            }
          }
        }

        // Change TnC keys compatible
        if (this.activeEstimate.termsAndConditions) {
          temp = []
          for (let i = 0; i < this.activeEstimate.termsAndConditions.length; i++) {
            if(this.activeEstimate.termsAndConditions[i].organization_id){
              this.activeEstimate.termsAndConditions[i].orgId = this.activeEstimate.termsAndConditions[i].organization_id
            }
            if(this.activeEstimate.termsAndConditions[i].unique_identifier){
              this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms = this.activeEstimate.termsAndConditions[i].unique_identifier
            }
            if(this.activeEstimate.termsAndConditions[i].terms_condition){
              this.activeEstimate.termsAndConditions[i].termsConditionText = this.activeEstimate.termsAndConditions[i].terms_condition
            }
            temp.push({
              orgId: this.activeEstimate.termsAndConditions[i].orgId,
              terms: this.activeEstimate.termsAndConditions[i].termsConditionText,
              uniqueKeyTerms: this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms,
              _id: this.activeEstimate.termsAndConditions[i]._id
            })
          }
          this.activeEstimate.termsAndConditions = temp
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
        if (this.activeEstimate.tax_amount == 0 || this.activeEstimate.tax_rate == 0 ) {
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
      }

    else if(this.recentEstListLoading){

    this.estimateService.fetchById([estId]).subscribe((estimate: any) => {
      if (estimate.records !== null) {
        this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(estimate.records[0])
        this.setSettings();
        
        this.shippingAddressEditMode = true
        this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping address from device
        if (!this.activeEstimate.taxList)
          this.activeEstimate.taxList = [];

        // Change list item keys compatible
        if (this.activeEstimate.listItems) {
          var temp = []
          for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
            if(this.activeEstimate.listItems[i].uniqueKeyFKQuotation){
              this.activeEstimate.listItems[i].uniqueKeyFKProduct = this.activeEstimate.listItems[i].uniqueKeyFKQuotation;
            }
            temp.push({
              description: this.activeEstimate.listItems[i].description,
              product_name: this.activeEstimate.listItems[i].productName,
              quantity: this.activeEstimate.listItems[i].qty,
              discount: this.activeEstimate.listItems[i].discountRate,
              discount_amount: this.activeEstimate.listItems[i].discountAmt,
              tax_amount: this.activeEstimate.listItems[i].taxAmount,
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

        // Change TnC keys compatible
        if (this.activeEstimate.termsAndConditions) {
          temp = []
          for (let i = 0; i < this.activeEstimate.termsAndConditions.length; i++) {
            temp.push({
              orgId: this.activeEstimate.termsAndConditions[i].orgId,
              terms: this.activeEstimate.termsAndConditions[i].termsConditionText ? this.activeEstimate.termsAndConditions[i].termsConditionText : this.activeEstimate.termsAndConditions[i].terms_condition,
              uniqueKeyTerms: this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms ? this.activeEstimate.termsAndConditions[i].uniqueKeyQuotTerms : this.activeEstimate.termsAndConditions[i].uniqueKeyTerms,
              _id: this.activeEstimate.termsAndConditions[i]._id
            })
          }
          this.activeEstimate.termsAndConditions = temp
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
        this.toastr.error('Please enter valid estimate id', 'Invalid estimate id');
        this.router.navigate(['/estimate/view'])
      }
    },err => this.openErrorModal(err))
  } 

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
        this.activeEstimate.tax_on_item = 0
        this.noTaxOnItem = true;
        this.taxLabel = "On Item"
      }

      //keep open tax field when tax on bill
      if (settings.taxFlagLevel == 1) {
        this.activeEstimate.tax_on_item = 1
        // this.activeEstimate.tax_rate = 0;
        this.noTaxOnItem = false;
        this.taxLabel = "On Bill"
      }

      //keep open discount field when discount on bill && make default % choice as selected for discount
      if(this.settings.discountFlagLevel == 0 && this.settings.discountFlagLevel !== 2){
        this.activeEstimate.discount_on_item = 0;
        this.activeEstimate.percentage_flag=1;
        // this.activeEstimate.percentage_value=0;
        this.noDiscountOnItem = false;
        this.discountLabel = "On Bill"
      }

      if (settings.discountFlagLevel == 1) {
        this.activeEstimate.discount_on_item = 1
        this.noDiscountOnItem = true;
        this.discountLabel = "On Item"
      }

      //set label if for disabled condition
      if(settings.discountFlagLevel == 2){
        this.activeEstimate.discount_on_item = 2
        this.discountLabel = "Disabled"
        this.noDiscountOnItem = true;
      }
      if(settings.taxFlagLevel == 2){
        this.activeEstimate.tax_on_item = 2
        this.taxLabel = "Disabled"
        this.noTaxOnItem = true;
      }
      
    } else {
      //console.log("2")
      this.tax_on = 'taxDisabled'
      this.taxtext = "Tax (Disabled)"
      this.activeEstimate.tax_on_item = 2
      $('a.taxbtn').addClass('disabledBtn')

      this.discount_on = 'disabled'
      this.discounttext = "Discount (Disabled)"
      this.activeEstimate.discount_on_item = 2
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
      },err => this.openErrorModal(err))
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
          this.removeEmptySpaces(this.clientList);
          //findout shipping address of selected client from clientlist
          if(this.activeEstimate){
          var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEstimate.unique_key_fk_client)[0]
          if(client){
            this.shippingAddress = client.shippingAddress;
            this.activeEstimate.shipping_address = this.shippingAddress;
          }
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
        
      },err => this.openErrorModal(err))
    } else {
      
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    if (this.termList.length < 1) {
      this.tncLoading = false;
      this.termConditionService.fetch().subscribe((response: response) => {
        this.tncLoading = true;
        if (response.termsAndConditionList) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        if(this.activeEstimate && !this.edit){
          this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
        }
        
      },err => this.openErrorModal(err))
    } else {
      this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT');
    }


    // Fetch Settings 
    if(!this.edit){
      this.settingsLoading = true;
      this.settingService.fetch().subscribe((response: any) => {
        this.settingsLoading = false;
        if (response.settings) {
          this.appSettings = response.settings.appSettings
          this.activeSettings = response.settings.appSettings.androidSettings
          setStorage(response.settings)
          this.user = JSON.parse(localStorage.getItem('user'))
          this.settings = this.user.setting
        }
      }, err => this.openErrorModal(err))
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

    
    
  }

  // Client Functions
  setClientFilter() {
    this.store.select('client').subscribe(clients => this.clientList = clients)
    this.clientList = this.clientList.filter(recs => recs.enabled == 0)
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
      this.removeEmptySpaces(this.clientList);
      this.filteredClients = this.billingTo.valueChanges.pipe(
        startWith<string | client>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterCli(name) : this.clientList.slice())
      )
    }

  }

  private _filterCli(value: string): client[] {
    if (!value) return this.clientList;
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()))
  }

  removeEmptySpaces(data){
    //remove whitespaces from clientlist
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === undefined) {
        data.splice(i, 1);
      }
      if (data[i].name) {
        var tempClient = data[i].name.toLowerCase().replace(/\s/g, "");
        if (tempClient === "") {
          data.splice(i, 1);
        }
      }else if(!data[i].name){
        data.splice(i, 1);
      }
    }
    return data
  }

  selectedClientChange(client) {
    this.noClientSelected = false;
    var temp
    if (client.name) { //while adding and showing client invoice page modal
      temp = this.clientList.filter(cli => cli.name == client.name)[0]
    } else if(client.option){
      temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]
    }

    if (temp !== undefined) {
      this.shippingAdressChanged = true;               //this flag is used to show shipping adrress of main client
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
      this.toastr.error('Please enter Organization name', 'Organization name required');
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
          let tempClient = this.clientService.changeKeysForStore(response.clientList[0])
          this.store.dispatch(new clientActions.add(tempClient))
          this.clientList.push(tempClient)
          this.activeClient = tempClient
          this.billingTo.setValue(this.activeClient)
          this.toastr.success('Client Added Successfully', 'Success');
          this.clientListLoading = false
          $('#add-client').modal('hide')
          // match a key to select and save a client in a textbox after adding client successfully
          this.activeEstimate.unique_key_fk_client = this.activeClient.uniqueKeyClient;
          this.selectedClientChange(this.activeClient); //this function shows added recent client
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      },err => this.openErrorModal(err)
      )
    }else {
      if (!proStatus) {
        this.toastr.error('Client name already exists', 'Duplicate Client Name');
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
    
    if(this.activeItem.product_name === undefined || this.activeItem.product_name ===""){
      this.ifProductEmpty = true;
      this.toastr.error('Product name cannot be empty', 'Failure');
    }else if(this.activeItem.quantity === null || this.activeItem.quantity === 0){
      this.toastr.error('Quantity can not be 0 or empty', 'Failure');
    }
    else if(this.activeItem.rate === null || this.activeItem.rate === 0){ //replace by this  if( this.activeItem.rate ===null || this.activeItem.rate === ""){
      this.toastr.error('Rate can not be 0 or empty', 'Failure');
    }

    if(this.activeItem.quantity !==null &&  this.activeItem.rate && this.activeItem.unique_identifier &&
       this.activeItem.rate !==null ){
      if (uid == null) {
        //if no tax item and still tax is there then make it 0
        if(this.activeEstimate.tax_on_item !== 0){
          this.activeItem.tax_rate = 0; 
        }
        if(this.activeItem.tax_rate == 0){
          this.activeItem.tax_amount = 0;
        }
        if(this.activeItem.discount == 0){
          this.activeItem.discount_amount = 0;
        }
        // Add Item to Estimate
        this.activeEstimate.listItems.push(this.activeItem)
      } else {
        // Edit Item from Estimate
        if(this.activeItem.tax_rate == 0){
          this.activeItem.tax_amount = 0;
        }
        if(this.activeItem.discount == 0){
          this.activeItem.discount_amount = 0;
        }
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
   
   if(this.activeItem.quantity && this.activeItem.rate && this.addItem.value !=="") {
    var tempCompare = ''
    var duplicateProduct = false;
    for (var p = 0; p < this.productList.length; p++) {
      if (this.productList[p].prodName) {
        tempCompare = this.productList[p].prodName.toLowerCase().replace(/ /g, '');
      }
      // If Name is same,
      if(this.addItem.value){
        if (tempCompare === this.addItem.value.toLowerCase().replace(/ /g, '')) {
          duplicateProduct = true;
        }
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
      this.toastr.error('Duplicate name or field is empty!!!', 'Failure');
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
        this.toastr.success('Product has been added', 'Success');
        //called store and set product here to update store when new product added
        this.store.select('product').subscribe(products => this.productList = products)
        // this.setProductFilter();
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    },err => this.openErrorModal(err)
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

      //inclusive tax
      if(this.includeTax){
        if(isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0) {
          this.activeItem.tax_rate = 0
        } else if(this.settings.taxFlagLevel === 0 || this.activeEstimate.tax_on_item === 0){ //when tax on item selected from settings
          if(this.activeItem.discount_amount){
            this.activeItem.tax_amount = ((this.activeItem.rate - (this.activeItem.rate * this.activeItem.discount/100)) * this.activeItem.quantity * this.activeItem.tax_rate) / (100 + this.activeItem.tax_rate)
            this.activeItem.total = (this.activeItem.rate * this.activeItem.quantity) - this.activeItem.discount_amount
          }
        }
      }
      //exclusive tax
      else if(isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0 && !this.includeTax) {
        this.activeItem.tax_rate = 0
      } else if(this.settings.taxFlagLevel === 0 || this.activeEstimate.tax_on_item === 0){ //when tax on item selected from settings
        this.activeItem.tax_amount = (this.activeItem.rate*this.activeItem.tax_rate/100)*this.activeItem.quantity
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
    this.defaultChecked = true;
    this.addTermModal = {}
    this.addTermModal.setDefault = true;
    $('#add-terms').modal('show')
  }

  //toggle checked box for terms
  changeCheckbox() {
    if (this.defaultChecked) {
      this.addTermModal.setDefault = true;
    }else{
      delete this.addTermModal.setDefault;
    }
  }

  saveTerm(status) {
    if (this.addTermModal.terms.replace(/ /g, '') == '') {
      this.toastr.error('Term text is mandatory', 'Empty Field');
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
          this.toastr.error('Error occured', 'Failure');
        }
      },err => this.openErrorModal(err)
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
    if (this.activeEstimate && this.activeEstimate.termsAndConditions) {
      return this.activeEstimate.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
    } else {
      return false
    }
  }

  // Estimate Functions
  fillItemDetails(prod = null) {
    this.noProductSelected = false;   //dont show red box
    this.ifProductEmpty = false;
    var product = (prod == null) ? this.addItem.value : prod
    //if no tax on item and still tax is there then make it 0
    if(this.activeEstimate.tax_on_item !== 0){
      product.taxRate = 0; 
    }
    this.activeItem = {
      description: product.discription == null ? '' : product.discription,
      product_name: product.prodName,
      quantity: product.quantity ? product.quantity : 1,
      rate: product.rate,
      // tax_rate: 0.00,
      unique_identifier: generateUUID(this.user.user.orgId),
      unique_key_fk_product: product.uniqueKeyProduct,
      unit: product.unit,
      discount : product.discount,
      tax_rate: product.taxRate,
    }
    this.calculateTotal()
  }

  save(status) {
    if (!this.activeEstimate.unique_key_fk_client) {
      this.noClientSelected = true;
      this.toastr.error('Client not selected', 'Failure');
      $('#bill-to-input').select()
      return false
    }

    if (this.activeEstimate.listItems.length == 0 || !status) {
      this.noProductSelected = true;  // show red box
      this.toastr.error('You haven\'t added item', 'Failure');
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
    if(this.shippingChange === false){
      this.activeEstimate.shipping_address = this.shippingAddress;
      }else{
        this.activeEstimate.shipping_address = this.activeClient.shippingAddress
      }

    
    var self = this
    
    if(this.activeEstimate.estimate_number !=="" && this.activeEstimate.created_date){
    this.estimateService.add([this.activeEstimate]).subscribe((response: any) => {
      if (response.status !== 200) {
        //alert('Couldnt save Estimate')
        this.toastr.error('Error occured', 'Failure');
      } else if (response.status === 200) {
        // Add Estimate to store
        if (this.edit) {
          
        // Add Estimate to recent store
          this.store.select('recentEstimates').subscribe(ests => {
            let index = ests.findIndex(est => est.unique_identifier == response.quotationList[0].unique_identifier)
            if (response.quotationList[0].deleted_flag == 1 && index == 0 ) {
              self.store.dispatch(new estimateActions.removeRecentEstimate(index))
              this.toastr.success('Estimate Deleted successfully', 'Success');
              this.router.navigate(['/estimate/add']);
            }else if(response.quotationList[0].deleted_flag !== 1){
              this.toastr.success('Estimate Edited successfully', 'Success');
              self.store.dispatch(new estimateActions.editRecentEstimate({index, value: this.estimateService.changeKeysForStore(response.quotationList[0])}))
              this.router.navigate([`viewtodaysestimate/${this.estimateId}`]);
            }
          })
        } else {
          self.store.dispatch(new estimateActions.recentEstimate([this.estimateService.changeKeysForStore(response.quotationList[0])]))
          
        }
        // Reset Create Estimate page for new Estimate creation or redirect to view page if edited
       if(!this.edit) {
          //add recently added esimate in store
          this.toastr.success('Estimate saved successfully', 'Success');
          // this.updateSettings();
          self.resetFormControls()
          self.addInit()
          this.router.navigate([`viewtodaysestimate/${response.quotationList[0].unique_identifier}`]);
        }
      }
      $('#estSubmitBtn').removeAttr('disabled')
    },err => this.openErrorModal(err)
    )
  }
  // validate user if he removes invoice number and try to save invoice 
  else {            
    this.toastr.error('Couldnt save estimate Please add estimate Number', 'Failure');        
    this.activeEstimate.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT');
    $('#estSubmitBtn').removeAttr('disabled')
  }
  }

  getClientName(id) {
    if(this.clientList && this.clientList.length !== 0){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  deleteEstimate() {
    this.activeEstimate.deleted_flag = 1
    this.save(true)
    
    this.router.navigate(['/estimate/add']);
  }

  inclTax(event){
    if(event.target.checked === true){
      this.includeTax = true
      this.activeEstimate.taxableFlag = 1;
      this.updateSettings();
      this.calculateEstimate();
    }
    //exclusive tax
    else{
      this.includeTax = false;
      this.activeEstimate.taxableFlag = 0;
      this.updateSettings();
      this.calculateEstimate();
      
    }
  }
  
  showBalPaidOnPdf(event){
    if(event.target.checked === true){
      this.showBalPaidAmountFlag = true;
      this.updateSettings();
    }else{
      this.showBalPaidAmountFlag = false;
      this.updateSettings();
    }
  }


  calculateEstimate() {
    var gross_amount = 0
    var deductions = 0
    var additions = 0
    //when inclusive tax was saved 
    if(this.activeEstimate.taxableFlag === 1){
      this.includeTax = true;
    }

    if (this.activeEstimate.listItems) {
      for (var i = 0; i < this.activeEstimate.listItems.length; i++) {

        if (this.activeEstimate.discount_on_item === 0 || this.activeEstimate.discount_on_item === 2) {         //on bill as well as on disabled
          this.activeEstimate.listItems[i].discount = 0;
          this.activeEstimate.listItems[i].discount_amount = 0;
          this.activeEstimate.listItems[i].tax_amount = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) * this.activeEstimate.listItems[i].tax_rate / 100;
          this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) - this.activeEstimate.listItems[i].discount_amount + this.activeEstimate.listItems[i].tax_amount;
        }
        if (this.activeEstimate.tax_on_item === 1 || this.activeEstimate.tax_on_item === 2) {         //on bill as well as on disabled
          this.activeEstimate.listItems[i].tax_rate = 0;
          this.activeEstimate.listItems[i].tax_amount = 0;
          if (this.activeEstimate.listItems[i].discount_amount) {
            this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) - this.activeEstimate.listItems[i].discount_amount;
          } else {
            this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity);
          }
        }

        //inclusive tax
        if (this.includeTax) {
          
          if (isNaN(this.activeEstimate.listItems[i].tax_rate) || this.activeEstimate.listItems[i].tax_rate == 0) {
            this.activeEstimate.listItems[i].tax_rate = 0
          }  //when tax on item selected from settings
            this.activeEstimate.listItems[i].tax_amount = ((this.activeEstimate.listItems[i].rate - (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].discount / 100)) * this.activeEstimate.listItems[i].quantity * this.activeEstimate.listItems[i].tax_rate) / (100 + this.activeEstimate.listItems[i].tax_rate)
            if (this.activeEstimate.listItems[i].discount_amount) {
              this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) - this.activeEstimate.listItems[i].discount_amount
            }else{
              this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity)
            }

        }else{
          if (isNaN(this.activeEstimate.listItems[i].tax_rate) || this.activeEstimate.listItems[i].tax_rate == 0) {
            this.activeEstimate.listItems[i].tax_rate = 0
          }else { //when tax on item selected from settings
            if (this.activeEstimate.listItems[i].discount_amount) {
              this.activeEstimate.listItems[i].tax_amount = ((this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) - this.activeEstimate.listItems[i].discount_amount) * this.activeEstimate.listItems[i].tax_rate/100;
              this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) - this.activeEstimate.listItems[i].discount_amount +  this.activeEstimate.listItems[i].tax_amount;
            }else if(!this.activeEstimate.listItems[i].discount_amount){
              this.activeEstimate.listItems[i].tax_amount = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) * this.activeEstimate.listItems[i].tax_rate/100;
              this.activeEstimate.listItems[i].total = (this.activeEstimate.listItems[i].rate * this.activeEstimate.listItems[i].quantity) +  this.activeEstimate.listItems[i].tax_amount;
            }
          }
          
        }
        gross_amount += parseFloat(this.activeEstimate.listItems[i].total)
      }
    }
    this.activeEstimate.gross_amount = gross_amount

    // Discount

    if(this.activeEstimate.discount_on_item === 1 && !this.includeTax || this.activeEstimate.discount_on_item === 2){
      this.activeEstimate.percentage_value = 0;
      this.activeEstimate.discount = 0;
    }
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

    if(this.activeEstimate.tax_on_item === 0  && !this.includeTax || this.activeEstimate.tax_on_item === 2){
      this.activeEstimate.tax_rate = 0;
      this.activeEstimate.tax_amount = 0;
      
    }
    if (this.activeEstimate.tax_rate && !this.includeTax) {
      if (isNaN(this.activeEstimate.tax_rate)) {
        this.activeEstimate.tax_rate = 0
      }else if(this.activeEstimate.tax_on_item === 1 && !this.includeTax ){
        this.activeEstimate.tax_amount = (this.activeEstimate.gross_amount - this.activeEstimate.discount) * this.activeEstimate.tax_rate / 100
      }
      additions += (this.activeEstimate.gross_amount - this.activeEstimate.discount) * this.activeEstimate.tax_rate / 100
    }else if(this.includeTax){

      if(this.activeEstimate.discount == undefined){
        this.activeEstimate.discount = 0;
      }
      this.activeEstimate.tax_amount = ((this.activeEstimate.gross_amount - this.activeEstimate.discount) * this.activeEstimate.tax_rate) / (100 + this.activeEstimate.tax_rate)
      //remove digits after two decimal
      var value = this.activeEstimate.tax_amount.toString().substring(0, this.activeEstimate.tax_amount.toString().indexOf(".") + 3);
      this.activeEstimate.tax_amount = parseFloat(value);
    }else{
      this.activeEstimate.tax_amount = 0;
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

    if(this.showBalPaidAmountFlag){
      user.setting.showBalPaidAmountFlag = true;
    }else{
      user.setting.showBalPaidAmountFlag = false;
    }

    // localStorage.setItem('user', JSON.stringify(user))
    // this.user = JSON.parse(localStorage.getItem('user'))
    // this.settings = this.user.setting

    var discountLevelFlag
    var taxLevelFlag
    //for discount
    if(this.activeEstimate.discount_on_item === 0){
      discountLevelFlag = 0;
      this.activeEstimate.percentage_flag = 1;
      this.discountLabel = "On Bill"
      this.noDiscountOnItem = false;
    }else if(this.activeEstimate.discount_on_item === 1){
      discountLevelFlag = 1;
      this.discountLabel = "On Item"
      this.noDiscountOnItem = true;
    }else{
      discountLevelFlag = 2;
      this.discountLabel = "Disabled"
      this.noDiscountOnItem = true;
    }
    //for tax
    if(this.activeEstimate.tax_on_item === 0){
      taxLevelFlag = 0;
      this.taxLabel = "On Item"
      this.noTaxOnItem = true;
    }else if(this.activeEstimate.tax_on_item === 1){
      taxLevelFlag = 1;
      this.taxLabel = "On Bill"
      this.noTaxOnItem = false;
    }else{
      taxLevelFlag = 2;
      this.taxLabel = "Disabled"
      this.noTaxOnItem = true;
    }
    user.setting.discountFlagLevel = discountLevelFlag;
    user.setting.taxFlagLevel = taxLevelFlag;

    var settings1 = {
      androidSettings: user.setting,
      android_donot_update_push_flag: 1
    }
    // settings1.androidSettings.estNo = this.tempEstNo

    this.settingService.add(settings1).subscribe((response: any) => { },err => this.openErrorModal(err)
    )
  }

  // error modal
  openErrorModal(err) {
    this.errorMessage = err
    $('#error-message').modal('show')
    $('#error-message').on('shown.bs.modal', (e) => {
    })
  }


  //todays estimates functionality

  fetchEstimates() {
    // Fetch estimates with given query

    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var  query = {
        startDate: start.getTime(),
        endDate: new Date().getTime(),
        serviceIdentifier: true
      }

    this.estListLoader = true
    this.estimateService.fetchTodaysData(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.estListLoader = false
        this.store.dispatch(new estimateActions.recentEstimate(response.list ? response.list.filter(rec => rec.enabled == 0) : []))
        // Set Active invoice whenever estimate list changes
        this.store.select('recentEstimates').subscribe(estimates => {
          this.recentEstimateList = estimates
        })
      }
    }, err => this.openErrorModal(err));
  }

  goEdit(estId) {
    this.router.navigate([`estimate/edit/${estId}`])
  }

  goView(invId){
    this.router.navigate([`viewtodaysestimate/${invId}`])
  }

  makeInvoice() {
    this.router.navigate([`invoice/edit/${this.activeEst.unique_identifier}`])
  }

  
  addNewEstimate(){
    this.estimateId = '';
    this.activeClient = <client>{}
    this.shippingAddress = null;
    this.router.navigate(['/estimate/add'])
  }
}