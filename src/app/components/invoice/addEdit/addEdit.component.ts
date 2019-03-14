import { Component, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store'
import {ToasterService} from 'angular2-toaster';
import { Title }     from '@angular/platform-browser';
import { DateAdapter } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators'
import { CONSTANTS } from '../../../constants'
import { response, client, invoice, terms, setting, product, addEditEstimate } from '../../../interface'
import { generateUUID, setStorage } from '../../../globalFunctions'

import { InvoiceService } from '../../../services/invoice.service'
import { EstimateService } from '../../../services/estimate.service'

import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { TermConditionService } from '../../../services/term-condition.service'
import { SettingService } from '../../../services/setting.service'
import * as invoiceActions from '../../../actions/invoice.action'

import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'
import * as termActions from '../../../actions/terms.action'
import { AppState } from '../../../app.state'

@Component({
  selector: 'app-invoice',
  templateUrl: './addEdit.component.html',
  styleUrls: ['./addEdit.component.css'],
  providers: [DatePipe]
  
})
export class AddEditComponent implements OnInit {

  invoiceId

  activeInvoice: invoice = <invoice>{}
  activeInv: invoice
  estimateDate = new FormControl()
  invoiceDate = new FormControl()
  private dueDate = new FormControl()
  private tempInvNo: number
  private showMultipleTax: boolean
  private tempflagTaxList: any
  private taxtext: string
  edit: boolean = false
  editTerm: boolean = true
  modalDescription: boolean = true
  shippingChange: boolean = true
  disableProductText: boolean = true
  ifProductEmpty:boolean = false
  openClientModal: boolean = false
  shippingAdressChanged: boolean = false
  invoiceFlag : boolean = false
  currencyCode: string
  last
  index
  mysymbols
  formatedDate
  shippingAddress


  invoiceList: invoice[]
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
  paymentDate = new FormControl()

  settings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  shippingAddressEditMode: boolean = false;
  activeEstimate: addEditEstimate;
  incrementInvNo: boolean;
  noClientSelected: boolean;
  showTaxRate: any;
  showDiscountRate: any;
  showProduct: any;
  showDescription: any;
  showQuantity: any;
  showPrice: any;
  showDiscountedRate: any;
  showTaxRateFlag: boolean = true;
  showDiscountRateFlag: boolean = true;
  invoiceListLoading: boolean;
  estimateListLoading: boolean;
  tncLoading: boolean;
  productListLoading: boolean;
  settingsLoading: boolean;
  InvoiceId: any;
  InvoiceNumber: string;
  recentInvoiceList: any = [];
  disabledDescription: boolean = false;
  viewTodaysInvoice: boolean = false;
  viewNextInvoice: boolean;
  invListLoader: boolean;
  
  constructor(private CONST: CONSTANTS,public router: Router,
    private adapter: DateAdapter<any>,
    private route: ActivatedRoute,
    public toasterService: ToasterService,
    private invoiceService: InvoiceService,
    private estimateService: EstimateService,
    private clientService: ClientService,
    private termConditionService: TermConditionService,
    private settingService: SettingService,
    private productService: ProductService,
    private store: Store<AppState>,
    private datePipe: DatePipe,
    private titleService: Title
  ) {
    this.toasterService = toasterService; 
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    store.select('client').subscribe(clients => this.allClientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)


   /*Scroll to top when arrow up clicked BEGIN*/
    $(window).scroll(function () {
      var height = $(window).scrollTop();
      if (height > 100) {
        $('#back2Top').fadeIn();
      } else {
        $('#back2Top').fadeOut();
      }
    });
    $(document).ready(function () {
      $("#back2Top").click(function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
      });
    });
/*Scroll to top when arrow up clicked END*/
    // save button processing script
    $(document).ready(function () {
      $('.save').on('click', function () {
        var $this = $(this);
        var loadingText = 'Saving...<i class="fa fa-circle-o-notch fa-spin"></i>';
        if ($(this).html() !== loadingText) {
          $this.data('original-text', $(this).html());
          $this.html(loadingText);
        }
        setTimeout(function () {
          $this.html($this.data('original-text'));
        }, 800);
      });
    })
    // save button processing script ends

   
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
    $('#navbar').show()
    // this.settings();
    this.titleService.setTitle('Simple Invoice | Invoice');
    this.route.params.subscribe(params => {
      if (params && params.invId) {
        this.InvoiceId = params.invId;
        this.edit = true
        this.editTerm = false
        this.editInit(params.invId)
        this.fetchCommonData()
      } else {
        this.fetchCommonData()
        this.addInit()
      }
    })
    this.fetchInvoices();
}
  //restrict user to write more than 100 value in pecrentage of discount   
  dataChanged(input){
    if(input > 100){
      alert("Percentage amount must be under 100");
      this.activeInvoice.percentage_value = 0;
      this.activeInvoice.amount = this.activeInvoice.gross_amount;
      this.activeInvoice.balance = this.activeInvoice.gross_amount;
    }
  }
  invoiceNoChanged(input){
    if(input.target.value.length >= 16){
      this.invoiceFlag = true
      this.toasterService.pop('failure', 'Invoice number should contains 15 characters only !');
    }else{
      this.invoiceFlag = false
    }
  }
  changeTax(input){
    if(input > 100){
      alert("Tax amount must be under 100");
      this.activeInvoice.tax_rate = 0;
      this.activeInvoice.amount = this.activeInvoice.gross_amount;
      this.activeInvoice.balance = this.activeInvoice.gross_amount;
    }
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
      this.showDiscountRate = 0;
    }
    // condition for disable discount 
    else if(this.settings.discountFlagLevel === 2){
      this.showDiscountRateFlag = false;
    }
    
    this.commonSettingsInit()
    var date = new Date()
    this.invoiceDate.reset(date)
    this.activeInvoice.created_date = (date.getFullYear() + '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('0' + date.getDate()).slice(-2)
    )
    if(!this.activeInvoice.listItems) {
      this.activeInvoice.listItems = []
    }
  }


  editInit(invId) {
    //to view updated or viewed invoice in view page
    // localStorage.setItem('invoiceId', invId )
    this.commonSettingsInit()
    this.shippingChange = false;
    // Fetch selected invoice
    this.invoiceListLoading = true;
    this.invoiceService.fetchById([invId]).pipe(retryWhen(_ => {
      return interval(2000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((invoice: any) => {
      this.invoiceListLoading = false;
      if(invoice.records !== null) {
        //deleted these objects bcz input was mismatcing for adding while deleting
        delete invoice.records[0].client
        delete invoice.records[0].client_id
        this.activeInvoice = {...this.activeInvoice, ...invoice.records[0]}
        this.shippingAddress = this.activeInvoice.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
        // Change list item keys compatible
        if (this.activeInvoice.listItems) {
          var temp = []
          for (let i = 0; i < this.activeInvoice.listItems.length; i++) {
            temp.push({
              description: this.activeInvoice.listItems[i].description,
              discount: this.activeInvoice.listItems[i].discountRate,
              product_name: this.activeInvoice.listItems[i].productName,
              quantity: this.activeInvoice.listItems[i].qty,
              rate: this.activeInvoice.listItems[i].rate,
              tax_rate: this.activeInvoice.listItems[i].tax_rate,
              total: this.activeInvoice.listItems[i].price,
              unique_identifier: this.activeInvoice.listItems[i].uniqueKeyListItem,
              unit: this.activeInvoice.listItems[i].unit,
            })
          }
          this.activeInvoice.listItems = temp
          //show discount and tax fields when item settings is selected
          for (let i = 0; i < this.activeInvoice.listItems.length; i++) {
            this.showTaxRate = this.activeInvoice.listItems[i].tax_rate;
            if (this.showTaxRate !== 0) {
              this.settings.taxFlagLevel = 0;
            }
            this.showDiscountRate = this.activeInvoice.listItems[i].discount;
            if (this.showDiscountRate !== 0) {
              this.settings.discountFlagLevel = 1;
            }
          }
        }
        //tax and discount position according to settings changed
        // if (this.settings.taxFlagLevel === 0 && this.showTaxRate !== 0) {
        //   this.showTaxRateFlag = false;
        // } else {
        //   // tax on bill
        //   this.showTaxRateFlag = true;
        // }
        // if (this.settings.discountFlagLevel === 1 && this.showDiscountRate !== 0) {
        //   this.showDiscountRateFlag = false;
        // } else {
        //   //discount on bill
        //   this.activeInvoice.discount_on_item = 2
        //   this.showDiscountRateFlag = true;
        // }
        //hide discount and tax fields when bill settings is selected
        if (this.activeInvoice.discount !== 0) {
          this.settings.discountFlagLevel = 0;
          this.activeInvoice.discount_on_item = 0;
        }
        if (this.activeInvoice.tax_rate !== 0) {
          this.settings.taxFlagLevel = 1;
          this.showTaxRate=0;
        }
       // Change payment keys compatible
        if(this.activeInvoice.payments){
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
          this.activeInvoice.shipping_charges = undefined
        }
        if(this.activeInvoice.adjustment == 0) {
          this.activeInvoice.adjustment = null
        }
        //to show when editing if value exists
        if(this.activeInvoice.tax_amount ==0 || this.activeInvoice.tax_rate ===0){
          this.activeInvoice.tax_on_item = 0;
        }else{
          this.activeInvoice.tax_on_item = 1;
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
        this.incrementInvNo = true;
        //make edit flag false so that it will work as adding new invoice as addInit fun is doing
        this.edit = false;
        this.estimateListLoading = true;
        this.estimateService.fetchById([invId]).subscribe((estimate: any) => {
          this.estimateListLoading = false;
          if (estimate.records !== null) {
            this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(estimate.records[0])
            this.shippingAddressEditMode = true
            this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
            if (this.activeEstimate.taxList){
              this.activeInvoice.taxList = this.activeEstimate.taxList;
            }
            //validate discount and tax field while makeInvoice if values are there when tax/discount on bills are selected
            if(this.activeEstimate.tax_rate!==0){
              this.activeInvoice.tax_rate = this.activeEstimate.tax_rate;
              this.activeInvoice.tax_on_item=1;
            }
            if(this.activeEstimate.discount!==0){
              this.activeInvoice.discount_on_item=0;
            }
    
            // Change list item keys compatible
            if (this.activeEstimate.listItems) {
              var temp = []
              for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
                temp.push({
                  description: this.activeEstimate.listItems[i].description,
                  discount: this.activeEstimate.listItems[i].discountRate,
                  product_name: this.activeEstimate.listItems[i].productName,
                  quantity: this.activeEstimate.listItems[i].qty,
                  rate: this.activeEstimate.listItems[i].rate,
                  tax_rate: this.activeEstimate.listItems[i].taxRate,
                  total: this.activeEstimate.listItems[i].price,
                  unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
                  unit: this.activeEstimate.listItems[i].unit
                })
              }
              this.activeEstimate.listItems = temp
              this.activeInvoice.listItems = this.activeEstimate.listItems;
              for(let i=0;i<this.activeInvoice.listItems.length;i++){
                this.showTaxRate = this.activeInvoice.listItems[i].tax_rate;
                if(this.showTaxRate!==0){
                  this.settings.taxFlagLevel=0;
                  this.activeInvoice.tax_on_item = 0;
                }
                this.showDiscountRate = this.activeInvoice.listItems[i].discount;
                if(this.showDiscountRate!==0){
                  this.settings.discountFlagLevel=1;
                }
              }
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
              this.activeInvoice.termsAndConditions = this.activeEstimate.termsAndConditions;
            } else if (this.termList.length < 1) {
              this.tncLoading = true;
              this.termConditionService.fetch().subscribe((response: response) => {
                this.tncLoading = false;
                if (response.termsAndConditionList) {
                  this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
                }
                this.activeEstimate.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
                this.activeInvoice.termsAndConditions = this.activeEstimate.termsAndConditions;
              })
            } else {
              this.activeEstimate.termsAndConditions = this.editTerm ? this.termList.filter(trm => trm.setDefault == 'DEFAULT') : [];
              this.activeInvoice.termsAndConditions = this.activeEstimate.termsAndConditions;
            }

            //set reference no of estimate
            this.activeInvoice.reference =  this.activeEstimate.estimate_number;
            this.activeInvoice.gross_amount = this.activeEstimate.gross_amount;
            this.activeInvoice.amount = this.activeEstimate.amount;
            this.activeInvoice.percentage_value =  this.activeEstimate.percentage_value;
            this.activeInvoice.discount = this.activeEstimate.discount;
            
            
            this.activeInvoice.percentage_flag = this.activeEstimate.percentage_flag;
            this.activeInvoice.tax_rate = this.activeEstimate.tax_rate;
            this.activeInvoice.tax_amount = this.activeEstimate.tax_amount;

            this.activeInvoice.shipping_charges = this.activeEstimate.shipping_charges;
            this.activeInvoice.adjustment = this.activeEstimate.adjustment;
            this.activeInvoice.unique_identifier = generateUUID(this.user.user.orgId)
            var currentDate = Date.now();
            this.formatedDate = currentDate;
            // // //to show when editing if value exists
            // if (this.activeInvoice.tax_amount == 0 || this.activeInvoice.tax_rate === 0) {
            //   this.activeInvoice.tax_on_item = 0;
            //   this.activeInvoice.tax_rate = null;
            // } else {
            //   this.activeInvoice.tax_on_item = 1;
            // }
            // Set Dates
            this.activeInvoice.created_date = new Date().toISOString().slice(0,10).toString();
            var [y, m, d] = this.activeInvoice.created_date.split('-').map(x => parseInt(x))
            this.invoiceDate.reset(new Date(y, (m - 1), d))

            
            // Tax and discounts show or hide
            if (this.activeEstimate.discount == 0) {
              this.activeInvoice.percentage_flag = null
            }
            if (this.activeEstimate.shipping_charges == 0) {
              this.activeInvoice.shipping_charges = undefined
            }
            if (this.activeEstimate.adjustment == 0) {
              this.activeInvoice.adjustment = null
            }
            if (this.activeEstimate.tax_amount == 0) {
              this.activeInvoice.tax_rate = null
            }
    
            
            // Wait for clients to be loaded before setting active client
            var ref = setInterval(() => {
              if (this.allClientList.length > 0) {
                //here we set unique_key_fk_client of invoice from estimate unique_key_fk_client to view and edit what we added newly created invoice from estimate
                this.activeInvoice.unique_key_fk_client = this.activeEstimate.unique_key_fk_client;
                let uid = this.activeInvoice.unique_key_fk_client
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
        // this.toasterService.pop('failure', 'Invalid invoice id!');
        // this.router.navigate(['/invoice/view'])
      }
      return false
    },
    err => console.log(err));
  }

  commonSettingsInit() {
    this.invoiceDate.valueChanges.subscribe(value => {
      this.activeInvoice.created_date = (value.getFullYear() + '-' +
        ('0' + (value.getMonth() + 1)).slice(-2) + '-' +
        ('0' + value.getDate()).slice(-2)
      )
      if(this.activeInvoice.due_date_flag) {
        this.changeDueDate(this.activeInvoice.due_date_flag.toString())
      }
    })

    this.dueDate.valueChanges.subscribe(value => {
      if(value !== null) {
        this.activeInvoice.due_date = (value.getFullYear() + '-' +
          ('0' + (value.getMonth() + 1)).slice(-2) + '-' +
          ('0' + value.getDate()).slice(-2)
        )
      } else {
        this.activeInvoice.due_date = ''
      }
    })

    var settings = this.settings

    // Multiple Tax
    if (settings.alstTaxName && settings.alstTaxName.length > 0) {
      this.activeInvoice.taxList = []
    }

    if (settings.dateDDMMYY === false) {
      // this.settings.date_format = 'mm-dd-yy'
      this.settings.date_format = this.adapter.setLocale('en-US');
    } else if (settings.dateDDMMYY === true) {
      if (!this.settings) {
        this.settings = { date_format: '' }
      }
      // this.settings.date_format = 'dd-mm-yy'
      this.settings.date_format = this.adapter.setLocale('en-GB');
      this.formatedDate = new Date;
      this.formatedDate = this.datePipe.transform(this.formatedDate,'dd/MM/yyyy')
    }

    if (this.settings.currencyInText != "" && typeof this.settings.currencyInText !== 'undefined') {
    }
    //  this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.currencyName == this.settings.currencyInText)[0].currencyCode;

    // Currency Dropdown
    if (settings.currencyText) {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyName;
    }
    else {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyCode;
    }
    if (settings) {
      this.activeInvoice.tax_on_item = 2
      this.activeInvoice.discount_on_item = 2

      if (settings.taxFlagLevel == 0) {
        this.taxtext = "Tax (on Item)"
        this.activeInvoice.tax_on_item = 0
      }
      if (settings.discountFlagLevel == 1) {
        this.activeInvoice.discount_on_item = 1
      }
    } else {
      this.taxtext = "Tax (Disabled)"
      this.activeInvoice.tax_on_item = 2
      this.activeInvoice.discount_on_item = 2
    }
  }

  fetchCommonData() {
    var self = this
    // Fetch Products if not in store
    if(this.productList.length < 1) {
      this.productListLoading = true;
      this.productService.fetch().pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: response) => {
        this.removeEmptyProducts();
        this.productListLoading = false;
        if (response.records != null) {
          self.store.dispatch(new productActions.add(response.records.filter((prod: any) =>
            (prod.enabled == 0 && prod.prodName !== undefined)
          )))
          this.setProductFilter()
        } 
      },
      err => this.openErrorModal())
    } else {
      this.setProductFilter()
    }

    // Fetch Clients if not in store
    if(this.allClientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: response) => {
        this.clientListLoading = false
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          this.removeEmptyNameClients();
          var obj = {};
          //You can filter based on Id or Name based on the requirement
          var uniqueClients = this.clientList.filter(function (item) {
            if (obj.hasOwnProperty(item.name)) {
              return false;
            } else {
              obj[item.name] = true;
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
    if(this.termList.length < 1 && !this.edit) {
      this.tncLoading = true;
      this.termConditionService.fetch().pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: response) => {
        this.tncLoading = false;
        if (response.termsAndConditionList) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        self.activeInvoice.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
      },err => this.openErrorModal())
    } else {
      this.activeInvoice.termsAndConditions = this.editTerm ? this.termList.filter(trm => trm.setDefault == 'DEFAULT') : []
    }

    // Fetch Settings every time
    this.settingsLoading = true;
    this.settingService.fetch().pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((response: any) => {
      this.settingsLoading = false;
      if (response.settings !== null) {
        setStorage(response.settings)
        this.user = JSON.parse(localStorage.getItem('user'))
        this.settings = this.user.setting
      }

      // Invoice Number
    //   if(!this.edit){
    //     this.tempInvNo = JSON.parse(localStorage.getItem('invNo'));
    //     if (this.tempInvNo) {
    //     //regex code to find no. from string
    //     // var r = /\d+/;
    //     // var m = r.exec(this.tempInvNo.toString())[0]
    //     // var s =parseInt(m);
    //     // console.log(s);


    //     // this regex code separates string and no.
    //     var text = this.tempInvNo.toString().split(/(\d+)/)
    //     var t = text[0] //text
    //     var n = parseInt(text[1]) //number
    //     if( isNaN(n)){
    //       n = 0; 
    //     }
    //     // var x = t+(n+1);
    //     this.tempInvNo = n + 1 ;

    //   } else {
    //     this.tempInvNo = 1
    //     t = this.settings.setInvoiceFormat;
    //   }
    //   if (this.settings.setInvoiceFormat) {
    //     this.activeInvoice.invoice_number = t + this.tempInvNo
    //   } else {
    //     this.activeInvoice.invoice_number = this.tempInvNo.toString();
    //   }
    // }
    if (!isNaN(parseInt(this.settings.invNo))) {
      // console.log(this.InvoiceNumber);
      this.tempInvNo = parseInt(this.settings.invNo) + 1
    } else {
      this.tempInvNo = 1
    }
    if (this.settings.setInvoiceFormat) {
      this.activeInvoice.invoice_number = this.settings.setInvoiceFormat + this.tempInvNo
    } else {
      this.activeInvoice.invoice_number = this.tempInvNo.toString();
    }
    },err => this.openErrorModal())
    
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
      this.clientService.fetch().pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: response) => {
        
        this.clientListLoading = false
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
          this.removeEmptyNameClients();
        }
        this.setClientFilter()
        
      },err => this.openErrorModal())
  }
}

   private _filterCli(value: string): client[] {
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()));
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
    this.noClientSelected = false; // to remove red box

    if (client.name) { //while adding and showing client invoice page modal
      var temp
      temp = this.clientList.filter(cli => cli.name == client.name)[0]
    } else if(client.option){
      var temp
      temp = this.clientList.filter(cli => cli.name == client.option.value.name)[0]
    }

    if (temp !== undefined) {
      this.shippingAdressChanged = true;               //this flag is used to show shipping adrress of main client
      this.activeClient = temp
      this.activeInvoice.unique_key_fk_client = temp.uniqueKeyClient
    } else {
      if(this.activeClient) {
        this.activeClient = {}
      }

      this.openAddClientModal(client.option.value)
    }
    $('#invoiceNumber').select()
  }

  openAddClientModal(name) {
    this.addClientModal = {}
    this.addClientModal.name = this.billingTo.value;
    this.openClientModal = true
    
    // this.addClientModal.name = name
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
      $('#add-client input[type="text"]')[1].focus()
    })
  }

  saveClient(status) {
    // If empty spaces
    if(!this.addClientModal.name.toLowerCase().replace(/ /g, '')) {
      this.toasterService.pop('failure', 'Organisation name required!');
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

      $('#saveClientButton').attr("disabled", 'true')
      this.clientListLoading = true
      this.clientService.add([this.clientService.changeKeysForApi(this.addClientModal)]).pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: any) => {
        if (response.status === 200) {
          let tempClient = this.clientService.changeKeysForStore(response.clientList[0])
          this.store.dispatch(new clientActions.add([tempClient]))
          this.clientList.push(tempClient)
          this.activeClient = tempClient
          this.billingTo.setValue(this.activeClient)
          this.toasterService.pop('success', 'Client Added Successfully');
          this.clientListLoading = false
          $('#add-client').modal('hide')
          // match a key to select and save a client in a textbox after adding client successfully
          this.activeInvoice.unique_key_fk_client = this.activeClient.uniqueKeyClient;
          this.selectedClientChange(this.activeClient); //this function shows added recent client
        }
        else {
          //notifications.showError({message:'Some error occurred, please try again!', hideDelay: 1500,hide: true})
        }
      },err => console.log(err))
    }else {
      if (!proStatus) {
        this.toasterService.pop('failure', 'Client name already exists.');
      }
    }
  }

  closeAddClientModal() {
    this.openClientModal = false
    $('#add-client').modal('hide')
    this.addClientModal = {}
    this.activeClient = {}
    this.activeInvoice.unique_key_fk_client = null
    this.billingTo.reset('')
  }

  removeEmptyProducts(){
    //remove whitespaces from productlist
    for (let i = 0; i < this.productList.length; i++) {
      if (!this.productList[i].prodName) {
        this.productList.splice(i,1);
      }
      var tempProduct = this.productList[i].prodName.toLowerCase().replace(/\s/g, "")
      if (tempProduct === "") {
        this.productList.splice(i,1);
      }
    }
  }

  // Product Functions
  setProductFilter() {
    var obj = {};
    for (var i = 0, len = this.productList.length; i < len; i++)
      obj[this.productList[i]['prodName']] = this.productList[i];
    this.productList = new Array();
    for (var key in obj)
      this.productList.push(obj[key]);
    this.filteredProducts = this.addItem.valueChanges.pipe(
      startWith<string | product>(''),
      map(value => typeof value === 'string' ? value : value.prodName),
      map(name => name ? this._filterProd(name) : this.productList.slice())
    )
  }
  

  private _filterProd(value: string): product[] {
    this.removeEmptyProducts();
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

    this.productService.add([product]).pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((result: any) => {
      if (result.status === 200) {
        var temp = this.productService.changeKeysForStore(result.productList[0])
        this.store.dispatch(new productActions.add([temp]))

        if(callback !== null) {
          callback(temp)
        }
        this.toasterService.pop('success', 'Product has been added!');
        this.store.select('product').subscribe(products => this.productList = products)
        // window will refresh when product added successfully to see that product in a list
        // window.location.reload(true);
        // this.setProductFilter();
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    },err => console.log(err))
  }

  editInvoiceItem(index) {
    this.modalDescription = false;
    $('#edit-item').modal('show')
    this.activeItem = {...this.activeInvoice.listItems[index]}
  }

  fillItemDetails(prod = null) {
    this.ifProductEmpty = false;
    var product = (prod == null) ? this.addItem.value : prod
    // console.log(product)
    this.activeItem = {
      unique_identifier: product.uniqueKeyProduct,
      description: product.discription == null ? '' : product.discription,
      product_name: product.prodName,
      quantity: product.quantity ? product.quantity : 1,
      unit: product.unit,
      rate: product.rate,
      tax_rate: product.taxRate,
      discount: 0.00
    }
    this.calculateTotal()
  }

  addEditInvoiceItem(uid = null) {
    // If product is in product list directly add to invoice else save product and then add to invoice
    // console.log(this.addItem, uid)
    
    if(this.activeItem.product_name === undefined || this.activeItem.product_name ===""){
      this.ifProductEmpty = true;
    }else if(this.activeItem.quantity ===null || this.activeItem.quantity === 0){
      this.toasterService.pop('failure', 'Quantity can not be 0 or empty');
    }
    else if( this.activeItem.rate ===null || this.activeItem.rate === 0){
      this.toasterService.pop('failure', 'rate can not be 0 or empty');
    }

    if(this.activeItem.quantity !==null && this.activeItem.rate !== 0 && this.activeItem.unique_identifier &&
      this.activeItem.rate !==null ){
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
      this.calculateInvoice()
    }
    else  {

    if(this.activeItem.quantity !== 0 && this.activeItem.rate !== 0 && this.addItem.value !=="" ) {
      // this.activeItem.product_name = this.addItem.value;
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
      this.ifProductEmpty = false;
      this.saveProduct({...this.activeItem, prodName: this.addItem.value}, (product) => {
        this.fillItemDetails({...this.activeItem, ...product})
        // this.addEditInvoiceItem({...this.activeItem, ...product})
        this.activeInvoice.listItems.push(this.activeItem)
        this.addItem.reset('')
        this.activeItem = {
          quantity: 1,
          rate: 0.00
        }
        this.calculateInvoice()
      })
    }else{
      this.toasterService.pop('failure', 'Duplicate name or field is empty!!!');
    }
    }
  }
  }

  closeItemModel() {
    this.modalDescription = true;
    this.activeItem = {
      quantity: 1,
      rate: 0.00,
      total: 0.00
    }
    $('#edit-item').modal('hide')
  }

 

  calculateTotal() {
    if (Object.keys(this.activeItem).length > 0) {
      var rateParse = parseFloat(this.activeItem.rate)
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
      } else if(this.settings.taxFlagLevel === 0){ //when tax on item selected from settings
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

  // Term Functions
  openAddTermModal() {
    this.addTermModal = {}
    $('#add-terms').modal('show')
  }
  

  saveTerm(status) {
    if(this.addTermModal.terms.replace(/ /g, '') == '') {
      this.toasterService.pop('failure', 'Term text is mandatory!');
      return false
    }

    $('#addtermbtn').attr('disabled', 'disabled')
    if (status) {
      this.addTermModal.orgId = this.user.user.orgId
      this.addTermModal.uniqueKeyTerms = generateUUID(this.user.user.orgId)
      this.addTermModal.modifiedOn = new Date().getTime()

      this.termConditionService.add([
        this.termConditionService.changeKeysForApi(this.addTermModal)
      ]).pipe(retryWhen(_ => {
        return interval(5000).pipe(
          flatMap(count => count == 3 ? throwError("Giving up") : of(count))
        )
      })).subscribe((response: any) => {
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
          //alert(response.message)
          this.toasterService.pop('failure', 'Network error');
        }
      },err => this.openErrorModal())
    }
  }

  closeAddTermModal() {
    $('#add-terms').modal('hide')
  }

  addRemoveTermsFromInvoice(term) {
    var index = this.activeInvoice.termsAndConditions.findIndex(trms => trms.terms == term.terms)//trms =>trms.uniqueKeyTerms == term.uniqueKeyTerms
    if(index == -1) {
      this.activeInvoice.termsAndConditions.push(term)
    } else {
      this.activeInvoice.termsAndConditions.splice(index, 1)
    }
  }

  isTermInInvoice(term) {
    if(this.activeInvoice.termsAndConditions) {
      return this.activeInvoice.termsAndConditions.findIndex(trm => trm.uniqueKeyTerms == term.uniqueKeyTerms) !== -1
    } else {
      return false
    }
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

  calculateInvoice() {
    var gross_amount = 0
    var deductions = 0
    var additions = 0

    if (this.activeInvoice.listItems) {
      for (var i = 0; i < this.activeInvoice.listItems.length; i++) {
        gross_amount += parseFloat(this.activeInvoice.listItems[i].total)
      }
    }
    this.activeInvoice.gross_amount = gross_amount

    // Discount
    if (this.activeInvoice.percentage_flag == 1) {
      var discountFactor = this.activeInvoice.percentage_value / 100
      if (isNaN(discountFactor)) {
        discountFactor = 0
      }
      

      this.activeInvoice.discount = gross_amount * discountFactor
      deductions += this.activeInvoice.discount
    } else {
      if(!isNaN(this.activeInvoice.discount)) {
        deductions += this.activeInvoice.discount
        this.activeInvoice.percentage_value = this.activeInvoice.discount / this.activeInvoice.gross_amount * 100
      }
    }

    // Tax
    if (this.activeInvoice.tax_rate != null) {
      if(isNaN(this.activeInvoice.tax_rate)) {
        this.activeInvoice.tax_rate = 0
      }
      additions += (this.activeInvoice.gross_amount - deductions) * (
        this.activeInvoice.tax_rate / 100
      )
      this.activeInvoice.tax_amount = additions
    }

    // Multiple Taxes
    if (this.activeInvoice.taxList && this.activeInvoice.taxList.length > 0) {
      var temp_tax_amount = 0
      for (var i = 0; i < this.activeInvoice.taxList.length; i++) {
        if (this.activeInvoice.taxList[i]) {
          this.activeInvoice.taxList[i].selected = true
          if (isNaN(this.activeInvoice.taxList[i].percentage)) {
            this.activeInvoice.taxList[i].percentage = 0
          }
          this.activeInvoice.taxList[i].calculateValue = (this.activeInvoice.gross_amount - deductions) / 100 * this.activeInvoice.taxList[i].percentage
          //remove digits after two decimal
          var b = this.activeInvoice.taxList[i].calculateValue.toString().substring(0, this.activeInvoice.taxList[i].toString().indexOf(".") + 6)
          this.activeInvoice.taxList[i].calculateValue = parseFloat(b);
          temp_tax_amount += this.activeInvoice.taxList[i].calculateValue
        } 
      }
      additions += temp_tax_amount
    }
    // this.activeInvoice.tax_amount = additions

    // Shipping
    if (isNaN(this.activeInvoice.shipping_charges)) {
      this.activeInvoice.shipping_charges = undefined
    } else {
      additions += this.activeInvoice.shipping_charges
    }

    // Adjustment
    if (isNaN(this.activeInvoice.adjustment)) {
      this.activeInvoice.adjustment = undefined
    } else {
      deductions += this.activeInvoice.adjustment
    }

    this.activeInvoice.amount = parseFloat((this.activeInvoice.gross_amount - deductions + additions).toFixed(2))
    this.activeInvoice.balance = parseFloat(this.activeInvoice.amount.toFixed(2)) - (
      this.activeInvoice.payments ? this.activeInvoice.payments.reduce((a, b) => a + b.paid_amount, 0) : 0
    )
  }

  removeItem(index) {
    this.activeInvoice.listItems.splice(index, 1)
    this.calculateInvoice()
  }

  save(status) {
    if(!this.activeInvoice.unique_key_fk_client) {
      this.toasterService.pop('Failure', 'Client Not Selected');
      this.noClientSelected = true;
      // $('#bill-to-input').select()
      return false
    }

    if (this.activeInvoice.listItems.length == 0 || !status) {
      this.toasterService.pop('failure', 'You haven\'t added item');
      return false
    }

    if(this.activeInvoice.balance < 0) {
      if(confirm('It seems like you have invoice with negative balance, should we adjust it for you?')) {
        this.activeInvoice.adjustment = this.activeInvoice.balance
        this.calculateInvoice()
      }
      return false
    }

    // $('#invSubmitBtn').attr('disabled', 'disabled')
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
      // this.activeInvoice.termsAndConditions[j].terms = this.activeInvoice.termsAndConditions[j].terms_
    }

    if(this.activeInvoice.taxList) {
      for (var t = 0; t < this.activeInvoice.taxList.length; t++) {
        if (this.activeInvoice.taxList[t] == null) {
          this.activeInvoice.taxList.splice(t, 1)
        }
      }
    }

    if(this.activeInvoice.payments) {
      for (var k = 0; k < this.activeInvoice.payments.length; k++) {
        this.activeInvoice.payments[k].unique_key_fk_invoice = this.activeInvoice.unique_identifier
        this.activeInvoice.payments[k].unique_key_fk_client = this.activeInvoice.unique_key_fk_client
      }
    }

    this.activeInvoice.device_modified_on = new Date().getTime()
    //add shipping address 
    if(this.shippingChange === false){
      this.activeInvoice.shipping_address = this.shippingAddress;
      }else{
        this.activeInvoice.shipping_address = this.activeClient.shippingAddress
      }

    var self = this
    //make tax & discount 0 when disable button selecetd from primary settings
    for (var i = 0; i < this.activeInvoice.listItems.length; i++) {
      if(this.settings.taxFlagLevel === 2){
        this.activeInvoice.listItems[i].tax_rate = 0;
      }
  
      if(this.settings.discountFlagLevel === 2){
        this.activeInvoice.listItems[i].discount = 0;
      }
    }
    if(this.activeInvoice.invoice_number !=="" && this.invoiceFlag == false){
  
    this.invoiceService.add([this.activeInvoice]).pipe(retryWhen(_ => {
      // for (var j = 0; j < this.activeInvoice.termsAndConditions.length; j++) {
      //   this.activeInvoice.termsAndConditions[j].terms = this.activeInvoice.termsAndConditions[j].terms_condition
      // }
      return interval(2000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((result: any) => {
      if (result.status !== 200) {
        this.toasterService.pop('failure', 'Couldnt save invoice');
      } else if (result.status === 200) {
        // Update store
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
          
        // Reset Create Invoice page for new invoice creation or redirect to view page if edited
        if(this.edit) {
          this.toasterService.pop('success', 'invoice Updated successfully');
          this.router.navigate([`invoice/view/${this.InvoiceId}`])
        }else if(this.incrementInvNo === true) {

          self.store.dispatch(new invoiceActions.recentInvoice([this.invoiceService.changeKeysForStore(result.invoiceList[0])]))
          this.toasterService.pop('success', 'Invoice saved successfully');
          this.updateSettings();
          self.resetCreateInvoice()
          self.addInit()
          // this.router.navigate(['/invoice/add'])
        }
         else {
          //set recently added invoice list in store
          this.fetchInvoices();
          this.toasterService.pop('success', 'Invoice saved successfully');
          this.updateSettings();
          self.resetCreateInvoice()
          self.addInit()
        }
      }
      //  $('#invSubmitBtn').removeAttr('disabled')
    }
    , err => this.openErrorModal()
    )
  }
  // validate user if he removes invoice number and try to save invoice 
  else {                    
    this.toasterService.pop('failure', 'Couldnt save invoice Please add Invoice Number');
    this.activeInvoice.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT');
    $('#invSubmitBtn').removeAttr('disabled')
  }
  }

  getClientName(id) {
    if(this.clientList){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  
  deleteInvoice() {
    this.activeInvoice.deleted_flag = 1
    // localStorage.setItem('deleteinvoiceId', "1" )
    // this.edit = false;
    this.save(true)
    this.toasterService.pop('success', 'Invoice Deleted successfully');
    
    this.router.navigate(['/invoice/add'])
  }

  deleteInstallment(index){
    this.activeInvoice.payments.splice(index, 1);
    // this.addPaymentModal.payments.pop(index, 1);
  }
  // deleteInstallmentModal(index){
  //   this.addPaymentModal.payments.splice(index, 1);
  // }

  resetCreateInvoice() {
    this.billingTo.reset('')
    this.addItem.reset('')
    this.dueDate.reset()
    this.activeInvoice = <invoice>{}
    // this.activeClient = <client>{}

    // Invoice Number
    if (!isNaN(parseInt(this.settings.invNo))) {
      this.tempInvNo = parseInt(this.settings.invNo) + 1
    } else {
      this.tempInvNo = 1
    }
    if (this.settings.setInvoiceFormat) {
      this.activeInvoice.invoice_number = this.settings.setInvoiceFormat + this.tempInvNo
    } else {
      this.activeInvoice.invoice_number =  this.tempInvNo.toString();
      // this.InvoiceNumber = this.activeInvoice.invoice_number;
    }

    this.activeInvoice.termsAndConditions = this.termList.filter(term => term.setDefault == 'DEFAULT')
    this.tempflagTaxList = []
    this.activeClient = {}

    if (this.settings.alstTaxName && this.settings.alstTaxName.length > 0) {
      this.showMultipleTax = true
    } else {
      this.showMultipleTax = false
    }
  }

  updateSettings() {    
    var user = JSON.parse(localStorage.getItem('user'))

    let matches = this.activeInvoice.invoice_number.match(/\d+$/)
    if (matches) {
      user.setting.invNo = matches[0]
      user.setting.setInvoiceFormat = this.activeInvoice.invoice_number.split(user.setting.invNo)[0]
    } else {
      user.setting.invNo = 0
      user.setting.setInvoiceFormat = this.activeInvoice.invoice_number
    }

    localStorage.setItem('user', JSON.stringify(user))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

    var settings1 = {
      androidSettings: user.setting,
      android_donot_update_push_flag: 1
    }
    // settings1.androidSettings.invNo = this.tempInvNo

    this.settingService.add(settings1).pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((response: any) => {},err => console.log(err))
  }

  // Payment Functions
  openAddPaymentModal() {
    if(!this.activeInvoice.amount || this.activeInvoice.amount == 0 || this.activeInvoice.balance == 0) {
      return false
    }
    this.addPaymentModal = {
      amount: this.activeInvoice.amount,
      balance: this.activeInvoice.amount,
      date_of_payment: this.activeInvoice.created_date,
      paid_amount: 0.00,
      payments: (this.activeInvoice.payments ? [...this.activeInvoice.payments] : []),
    }
    this.paymentDate.reset(this.invoiceDate.value)
    this.paymentDate.valueChanges.subscribe(value => {
      this.addPaymentModal.date_of_payment = (value.getFullYear() + '-' +
        ('0' + (value.getMonth() + 1)).slice(-2) + '-' +
        ('0' + value.getDate()).slice(-2)
      )
    })
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
    this.calculateInvoice()
    this.closeAddPaymentModal()
  }

  closeAddPaymentModal() {
    this.addPaymentModal = {}
    $('#addPaymentAddInvoice').modal('hide')
  }
  // error modal
  openErrorModal() {
    $('#error-message').modal('show')
    $('#error-message').on('shown.bs.modal', (e) => {
    })
  }

  // CURRENTLY USELESS FUNCTIONS
  log(a) {
    console.log(a)
  }

  //todays invoices functionality

  fetchInvoices() {
    // Fetch invoices with given query
    this.store.select('invoice').subscribe(invoices => {
      this.invoiceList = invoices
    })
    if(this.invoiceList.length < 1){
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var  query = {
        clientIdList: null,
        startTime: start.getTime(),
        endTime: new Date().getTime()
      }

    this.invListLoader = true
    this.invoiceService.fetchByQuery(query).pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((response: any) => {
      if (response.status === 200) {
        this.invListLoader = false
        this.store.dispatch(new invoiceActions.reset(response.records ? response.records.filter(rec => rec.deleted_flag == 0) : []))
        this.store.select('invoice').subscribe(invoices => {
          this.invoiceList = invoices
        })
      }
      
    },err => this.openErrorModal())
  }
  }

  setActiveInv(invId: string = '') {
    this.viewTodaysInvoice = true;
    this.invoiceId = invId;
    this.activeInv = this.invoiceList.filter(inv => inv.unique_identifier == invId)[0]
    
    this.setActiveClient()
  }


  paidAmount() {
    var temp = 0
    if (this.activeInv.payments) {
      this.activeInv.payments.forEach((payment: any) => {
        temp += parseFloat(payment.paidAmount)
      })
    }

    return temp
  }

  removeEmptySpaces(){
    //remove whitespaces from clientlist
    for (let i = 0; i < this.clientList.length; i++) {
      if(!this.clientList[i].name){
        this.clientList.splice(i,1);
      }
      var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "");
      if (tempClient === "") {
        this.clientList.splice(i,1);
      }
    }
    
  }

  setActiveClient() {
      if (this.clientList.length < 1) {
        this.clientListLoading = true
        this.clientService.fetch().pipe(retryWhen(_ => {
          return interval(5000).pipe(
            flatMap(count => count == 3 ? throwError("Giving up") : of(count))
          )
        })).subscribe((response: response) => {
          this.clientListLoading = false
          this.clientList = response.records;
          this.removeEmptySpaces();
        },err => this.openErrorModal()
        )
      }

    if (this.activeInv) {
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeInv.unique_key_fk_client)[0]
      if (client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
  }

  goEdit(invId) {
    this.router.navigate([`invoice/edit/${invId}`])
  }

  downloadInvoice(type) {
    if (type == "download") {
      $('#downloadBtn').attr('disabled', 'disabled')
    } else if (type == "preview") {
      $('#previewBtn').attr('disabled', 'disabled')
    }

    this.invoiceService.fetchPdf(this.activeInv.unique_identifier).pipe(retryWhen(_ => {
      return interval(5000).pipe(
        flatMap(count => count == 3 ? throwError("Giving up") : of(count))
      )
    })).subscribe((response: any) => {
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
    },err => console.log(err))
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

    var invoiceNumber = this.activeInv.invoice_number.replace('/', '')
    return 'INVPDF_' + invoiceNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
  }
}
