import { Component, OnInit, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store'
import {ToasterService} from 'angular2-toaster';
import { Title }     from '@angular/platform-browser';
import { DateAdapter, MatAutocomplete } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators'
import { CONSTANTS } from '../../../constants'
import { response, client, invoice, terms, setting, product, addEditEstimate, recentInvoices, estimate, recentEstimates } from '../../../interface'
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
import { recentInvoice } from '../../../actions/invoice.action';


@Component({
  selector: 'app-invoice',
  templateUrl: './addEdit.component.html',
  styleUrls: ['./addEdit.component.css'],
  providers: [DatePipe]
  
})
export class AddEditComponent implements OnInit {
  @ViewChild(MatAutocomplete) matAutocomplete: MatAutocomplete;
  invoiceId

  invSortTerm: string = 'createdDate'

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
  estimateList: estimate[]
  public clientList: client[]
  activeClient: any = {}
  clientListLoading: boolean
  billingTo = new FormControl()
  filteredClients: Observable<string[] | client[]>
  addClientModal: any = {}
  hideme = []

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

  appSettings: any
  activeSettings: setting

  settings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  noAdjustment:boolean = true;
  noShippingCharges : boolean = true;
  shippingAddressEditMode: boolean = false;
  activeEstimate: addEditEstimate;
  incrementInvNo: boolean;
  noClientSelected: boolean = false;
  invoiceListLoading: boolean;
  estimateListLoading: boolean;
  tncLoading: boolean;
  productListLoading: boolean;
  settingsLoading: boolean;
  InvoiceId: any;
  InvoiceNumber: string;
  recentInvoiceList: recentInvoices[];
  recentEstimateList: recentEstimates[];
  disabledDescription: boolean = false;
  invListLoader: boolean;
  hideDiscountLabel: boolean = false;
  hideTaxLabel: boolean = false;
  noProductSelected: boolean = false;
  show: false;
  defaultChecked: boolean;
  amountPaid: number = 0;
  noDiscountOnItem: boolean = true;
  noTaxOnItem: boolean = true;
  multipleTax: boolean = false;
  currentUrl: string;
  taxLabel: string;
  discountLabel: string;
  includeTax: boolean;
  
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

    store.select('client').subscribe(clients => this.clientList = clients)
    store.select('product').subscribe(products => this.productList = products)
    store.select('terms').subscribe(terms => this.termList = terms)
    store.select('invoice').subscribe(invoices => this.invoiceList = invoices)
    store.select('recentInvoices').subscribe(recentInvoices => this.recentInvoiceList = recentInvoices)
    store.select('estimate').subscribe(estimates => this.estimateList = estimates);
    store.select('recentEstimates').subscribe(estimates => this.recentEstimateList = estimates);

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
    // show more-less button condition depending on height
    jQuery('.expandClicker').each(function(){
      if (jQuery(this).parent().height() < 50) {
        jQuery(this).fadeOut();
      }
    });
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
    //fetch settings when user comes to this component
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    this.addTermModal.setDefault = true; //set term initially default
    $('#navbar').show()
    this.titleService.setTitle('Simple Invoice | Invoice');
    this.route.params.subscribe(params => {
      if (params && params.invId) {
        this.InvoiceId = params.invId;
        this.edit = true
        this.editTerm = false
        this.fetchCommonData()
        this.editInit(params.invId)

      } else {
        this.fetchCommonData();
        this.addInit()
      }
    })
    if (this.recentInvoiceList.length < 1) {
      this.fetchInvoices();
    }

  }
  //restrict user to write more than 100 value in pecrentage of discount   
  dataChanged(input){
    if(input > 100){
      alert("Percentage amount must be under 100");
      this.activeInvoice.percentage_value = 0;
      this.activeInvoice.discount = 0;
      this.activeInvoice.tax_rate = 0;
      this.activeInvoice.tax_amount = 0;
      this.activeInvoice.amount = this.activeInvoice.gross_amount;
      this.activeInvoice.balance = this.activeInvoice.gross_amount;
    }
  }

  taxListChanged(input){
    if(input > 100){
      alert("Percentage amount must be under 100");
      this.activeInvoice.tax_rate = 0;
      this.activeInvoice.tax_amount = 0;
    }
  }
  //entering proper invoice number 
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
    // this.commonSettingsInit()
    this.shippingChange = false;
    this.invoiceListLoading = true;
    // Fetch selected invoice
     //invoice from view page
    
    this.activeInvoice = this.invoiceList.find(x => x.unique_identifier === invId); //when came from view component
    
    
    if(this.recentInvoiceList.length > 0 && !this.activeInvoice){ //invoice from view today's page
    this.invoiceList = [];
    this.activeInvoice = this.recentInvoiceList.find(inv => inv.unique_identifier == invId); //when came from todays component
    }

    if(this.activeInvoice){
      this.invoiceListLoading = false;

      //set settingFlags according to edit i.e invoice saved previously
      if(this.activeInvoice.discount_on_item == 0 || this.activeInvoice.discount ){
        this.activeInvoice.percentage_flag = 1;
        this.settings.discountFlagLevel = 0;
        this.noDiscountOnItem = false;
        this.discountLabel = "On Bill"
      }else if(this.activeInvoice.discount_on_item == 1){
        this.settings.discountFlagLevel = 1;
        this.noDiscountOnItem = true;
        this.discountLabel = "On Item"
      }

      if(this.activeInvoice.tax_on_item == 1){
        this.settings.taxFlagLevel = 1;
        this.noTaxOnItem = true;
        this.taxLabel = "On Bill"

      }else if(this.activeInvoice.tax_on_item == 0){
        this.settings.taxFlagLevel = 0;
        this.taxtext = "Tax (on Item)"
        this.noTaxOnItem = true;
        this.taxLabel = "On Item"
      }


      

        //if item and Disabled condition  
        if(this.activeInvoice.discount_on_item == 1 || this.activeInvoice.discount_on_item == 2){
          this.noDiscountOnItem = true;
        }

        if(this.activeInvoice.tax_on_item == 0 || this.activeInvoice.tax_on_item == 2){
          this.noTaxOnItem = true;
        }

        //if Bill setting
        if(this.activeInvoice.discount_on_item == 0){
          this.noDiscountOnItem = false;
        }

        if(this.activeInvoice.tax_on_item == 1){
          this.noTaxOnItem = false;
        }

        //shipping & adjustment
        if(this.activeInvoice.shipping_charges){
          this.noShippingCharges = false
        }
        if(this.activeInvoice.adjustment){
          this.noAdjustment = false
        }

        //if setting of bill but no value added
        if(this.activeInvoice.discount == 0){
          this.noDiscountOnItem = true;
        }
        if(this.activeInvoice.tax_rate == 0){
          this.noTaxOnItem = true;
        }


      
        this.shippingAddress = this.activeInvoice.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
        
        
        // Change list item keys compatible
        if (this.activeInvoice.listItems) {
          var temp = []
          for (let i = 0; i < this.activeInvoice.listItems.length; i++) {
            //set variables according to data comes from API and store 
            if(this.activeInvoice.listItems[i].discount || this.activeInvoice.listItems[i].discount == 0){
          
              this.activeInvoice.listItems[i].discountRate = this.activeInvoice.listItems[i].discount;
            }
            if(this.activeInvoice.listItems[i].discount_amount || this.activeInvoice.listItems[i].discount_amount ==0){
              this.activeInvoice.listItems[i].discountAmount = this.activeInvoice.listItems[i].discount_amount;
            }
            if(this.activeInvoice.listItems[i].tax_amount || this.activeInvoice.listItems[i].tax_amount == 0){
              this.activeInvoice.listItems[i].taxAmount = this.activeInvoice.listItems[i].tax_amount;
            }
            
            if(this.activeInvoice.listItems[i].product_name){
              this.activeInvoice.listItems[i].productName = this.activeInvoice.listItems[i].product_name;
            }
            if(this.activeInvoice.listItems[i].quantity){
              this.activeInvoice.listItems[i].qty = this.activeInvoice.listItems[i].quantity;
            }
            if(this.activeInvoice.listItems[i].total){
              this.activeInvoice.listItems[i].price = this.activeInvoice.listItems[i].total;
            }
            if(this.activeInvoice.listItems[i].unique_identifier){
              this.activeInvoice.listItems[i].uniqueKeyListItem = this.activeInvoice.listItems[i].unique_identifier;
            }
            
            temp.push({
              description: this.activeInvoice.listItems[i].description,
              discount: this.activeInvoice.listItems[i].discountRate,
              discount_amount: this.activeInvoice.listItems[i].discountAmount,
              tax_amount: this.activeInvoice.listItems[i].taxAmount,
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
          for(let i = 0; i < this.activeInvoice.payments.length; i++){
            this.amountPaid += this.activeInvoice.payments[i].paid_amount;
          }
      }

        // Set Dates
        var [y, m, d] = this.activeInvoice.created_date.split('-').map(x => parseInt(x))
        this.invoiceDate.reset(new Date(y, (m - 1), d))

        this.changeDueDate(this.activeInvoice.due_date_flag.toString())
        // Wait for clients to be loaded before setting active client
        var ref = setInterval(() => {
          if (this.clientList.length > 0) {
            let uid = this.activeInvoice.unique_key_fk_client
            this.activeClient = this.clientList.filter(cli => cli.uniqueKeyClient == uid)[0]
            this.billingTo.reset(this.activeClient)
            clearInterval(ref)
          }
        }, 50)
      } else if(this.invoiceListLoading && this.estimateList.length < 1 && this.recentEstimateList.length < 1){

       
        this.invoiceService.fetchById([invId]).subscribe((invoice: any) => {
          if(invoice.records !== null) {
            //deleted these objects bcz input was mismatcing for adding while deleting
            delete invoice.records[0].client
            delete invoice.records[0].client_id
            this.activeInvoice = {...invoice.records[0]}

            //set settingFlags according to edit i.e invoice saved previously
            if(this.activeInvoice.discount_on_item == 0 || this.activeInvoice.discount ){
              this.activeInvoice.percentage_flag = 1;
              this.appSettings.androidSettings.discountFlagLevel = 0;
              this.noDiscountOnItem = false;
              this.discountLabel = "On Bill"
            }else if(this.activeInvoice.discount_on_item == 1){
              this.settings.discountFlagLevel = 1;
              this.noDiscountOnItem = true;
              this.discountLabel = "On Item"
            }
      
            if(this.activeInvoice.tax_on_item == 0 || this.activeInvoice.tax_rate ){
              this.appSettings.androidSettings.taxFlagLevel = 0;
              this.taxtext = "Tax (on Item)"
              this.noTaxOnItem = true;
              this.taxLabel = "On Item"
            }

              //if item and Disabled condition  
              if(this.activeInvoice.discount_on_item == 1 || this.activeInvoice.discount_on_item == 2){
                this.noDiscountOnItem = true;
              }
        
              if(this.activeInvoice.tax_on_item == 0 || this.activeInvoice.tax_on_item == 2){
                this.noTaxOnItem = true;
              }
              //if Bill setting
              if(this.activeInvoice.discount_on_item == 0){
                this.noDiscountOnItem = false;
              }
      
              if(this.activeInvoice.tax_on_item == 1){
                this.noTaxOnItem = false;
              }

              //shipping & adjustment
              if(this.activeInvoice.shipping_charges){
                this.noShippingCharges = false
              }
              if(this.activeInvoice.adjustment){
                this.noAdjustment = false
              }

              //if setting of bill but no value added
              if(this.activeInvoice.discount == 0){
                this.noDiscountOnItem = true;
              }
              if(this.activeInvoice.tax_rate == 0){
                this.noTaxOnItem = true;
              }
          
            
            this.shippingAddress = this.activeInvoice.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
            
            
            // Change list item keys compatible
            if (this.activeInvoice.listItems) {
              var temp = []
              for (let i = 0; i < this.activeInvoice.listItems.length; i++) {
                  if (this.activeInvoice.listItems[i].discountAmount || this.activeInvoice.listItems[i].discountAmount == 0) {
                    this.activeInvoice.listItems[i].discount_amount = this.activeInvoice.listItems[i].discountAmount
                  }
                  if (this.activeInvoice.listItems[i].taxAmount || this.activeInvoice.listItems[i].taxAmount == 0 ) {
                    this.activeInvoice.listItems[i].tax_amount = this.activeInvoice.listItems[i].taxAmount
                  }
                temp.push({
                  description: this.activeInvoice.listItems[i].description,
                  discount: this.activeInvoice.listItems[i].discountRate,
                  discount_amount: this.activeInvoice.listItems[i].discount_amount,
                  tax_amount: this.activeInvoice.listItems[i].tax_amount,
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
              for(let i = 0; i < this.activeInvoice.payments.length; i++){
                this.amountPaid += this.activeInvoice.payments[i].paid_amount;
              }
          }
    
            // Set Dates
            var [y, m, d] = this.activeInvoice.created_date.split('-').map(x => parseInt(x))
            this.invoiceDate.reset(new Date(y, (m - 1), d))
    
            
    
            this.changeDueDate(this.activeInvoice.due_date_flag.toString())
            // Wait for clients to be loaded before setting active client
            var ref = setInterval(() => {
              if (this.clientList.length > 0) {
                let uid = this.activeInvoice.unique_key_fk_client
                if(this.clientList){
                  this.activeClient = this.clientList.filter(cli => cli.uniqueKeyClient == uid)[0]
                }
                this.billingTo.reset(this.activeClient)
                clearInterval(ref)
              }
            }, 50)
          }else {
            // this.toasterService.pop('failure', 'Invalid estimate id');
            this.router.navigate(['/estimate/view'])
          }
          
          
          return false
        },
        err => this.openErrorModal());

      } 
      //MAKE INVOICE
      else {
        this.activeInvoice = <invoice>{}
        this.incrementInvNo = true;
        //make edit flag false so that it will work as adding new invoice as addInit fun is doing i.e make invoice
        this.edit = false;
        this.activeEstimate = this.estimateList.find(x => x.unique_identifier === invId); //when came from view component

        if(this.recentEstimateList.length > 0 && !this.activeEstimate){ //invoice from view today's page
        this.estimateList = [];
        this.activeEstimate = this.recentEstimateList.find(inv => inv.unique_identifier == invId); //when came from todays component
        }
        
          if (this.activeEstimate) {
            this.activeEstimate = <addEditEstimate>this.estimateService.changeKeysForApi(this.activeEstimate)
            this.shippingAddressEditMode = true
            this.shippingAddress = this.activeEstimate.shipping_address;     //this shippingAddress is used to show updated shipping adrress from device
            if (this.activeEstimate.taxList){
              this.activeInvoice.taxList = this.activeEstimate.taxList;
            }
            //validate discount and tax field while makeInvoice if values are there when tax/discount on bills are selected
            if(this.activeEstimate.tax_rate!==0){
              this.activeInvoice.tax_rate = this.activeEstimate.tax_rate;
            }

            //settings flagLevels as per estimate was saved
            this.activeInvoice.discount_on_item = this.activeEstimate.discount_on_item
            this.activeInvoice.tax_on_item = this.activeEstimate.tax_on_item

            //set settingFlags according to edit i.e invoice saved previously
            if(this.activeInvoice.discount_on_item == 0 || this.activeInvoice.discount ){
              this.activeInvoice.percentage_flag = 1;
              this.appSettings.androidSettings.discountFlagLevel = 0;
              this.noDiscountOnItem = false;
              this.discountLabel = "On Bill"
            }
      
            if(this.activeInvoice.tax_on_item == 0 || this.activeInvoice.tax_rate ){
              this.appSettings.androidSettings.taxFlagLevel = 0;
              this.taxtext = "Tax (on Item)"
              this.noTaxOnItem = true;
              this.taxLabel = "On Item"
            }


              //if item and Disabled condition  
              if(this.activeEstimate.discount_on_item == 1 || this.activeEstimate.discount_on_item == 2){
                this.noDiscountOnItem = true;
              }
        
              if(this.activeEstimate.tax_on_item == 0 || this.activeEstimate.tax_on_item == 2){
                this.noTaxOnItem = true;
              }
              
              //if Bill setting
              if(this.activeEstimate.discount_on_item == 0){
                this.noDiscountOnItem = false;
              }
      
              if(this.activeEstimate.tax_on_item == 1){
                this.noTaxOnItem = false;
              }

              //shipping & adjustment
              if(this.activeEstimate.shipping_charges){
                this.noShippingCharges = false
              }
              if(this.activeEstimate.adjustment){
                this.noAdjustment = false
              }

              //if setting of bill but no value added
              if(this.activeEstimate.discount == 0){
                this.noDiscountOnItem = true;
              }
              if(this.activeEstimate.tax_rate == 0){
                this.noTaxOnItem = true;
              }

            

            //set invoice number for making invoice

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
    
            // Change list item keys compatible
            if (this.activeEstimate.listItems) {
              var temp = []
              for (let i = 0; i < this.activeEstimate.listItems.length; i++) {
                
                temp.push({
                  description: this.activeEstimate.listItems[i].description,
                  discount: this.activeEstimate.listItems[i].discountRate,
                  discount_amount: this.activeEstimate.listItems[i].discountAmt,
                  tax_amount: this.activeEstimate.listItems[i].taxAmount,
                  product_name: this.activeEstimate.listItems[i].productName,
                  quantity: this.activeEstimate.listItems[i].qty,
                  rate: this.activeEstimate.listItems[i].rate,
                  tax_rate: this.activeEstimate.listItems[i].taxRate,
                  total: this.activeEstimate.listItems[i].price,
                  unique_identifier: this.activeEstimate.listItems[i].uniqueKeyFKProduct,
                  unit: this.activeEstimate.listItems[i].unit
                })
              }
              this.activeInvoice.listItems = temp
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
              this.activeInvoice.termsAndConditions = temp
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
              if (this.clientList.length > 0) {
                //here we set unique_key_fk_client of invoice from estimate unique_key_fk_client to view and edit what we added newly created invoice from estimate
                this.activeInvoice.unique_key_fk_client = this.activeEstimate.unique_key_fk_client;
                let uid = this.activeInvoice.unique_key_fk_client
                this.activeClient = this.clientList.filter(cli => cli.uniqueKeyClient == uid)[0]
                this.billingTo.reset(this.activeClient)
                clearInterval(ref)
              }
            }, 50)
          } else {
            // this.toasterService.pop('failure', 'Invalid estimate id');
            this.router.navigate(['/estimate/view'])
          }
      } 
       
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
      this.settings.date_format = this.adapter.setLocale('en-GB');
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
        this.noTaxOnItem = true;
        this.taxLabel = "On Item"
      }

      //keep open tax field when tax on bill
      if (settings.taxFlagLevel == 1) {
        this.activeInvoice.tax_on_item = 1
        // this.activeInvoice.tax_rate = 0;
        this.noTaxOnItem = false;
        this.taxLabel = "On Bill"
      }

      //keep open discount field when discount on bill && make default % choice as selected for discount
      if(this.settings.discountFlagLevel == 0){
        this.activeInvoice.discount_on_item = 0;
        this.activeInvoice.percentage_flag=1;
        // this.activeInvoice.percentage_value=0;
        this.noDiscountOnItem = false;
        this.discountLabel = "On Bill"
      }
      if (settings.discountFlagLevel == 1) {
        this.activeInvoice.discount_on_item = 1
        this.noDiscountOnItem = true;
        this.discountLabel = "On Item"
      }
      //set label if for disabled condition
      if(settings.discountFlagLevel == 2){
        this.discountLabel = "Disabled"
      }
      if(settings.taxFlagLevel == 2){
        this.taxLabel = "Disabled"
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
      this.productService.fetch().subscribe((response: response) => {
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
    if(this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
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
        }else{
          this.clientList = response.records.filter(recs => recs.enabled == 0)
        }
        
        this.removeEmptyNameClients();
        this.setClientFilter()
        
      },err => this.openErrorModal())
      
    } else {
      this.clientList = this.clientList.filter(recs => recs.enabled == 0)
      this.setClientFilter()
    }

    // Fetch Terms if not in store
    if(this.termList.length < 1) {
      this.tncLoading = true;
      this.termConditionService.fetch().subscribe((response: response) => {
        this.tncLoading = false;
        if (response.termsAndConditionList) {
          this.store.dispatch(new termActions.add(response.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
        }
        if(this.activeInvoice){
          self.activeInvoice.termsAndConditions = this.termList.filter(trm => trm.setDefault == 'DEFAULT')
        }
        
      },err => this.openErrorModal())
    } else {
      this.activeInvoice.termsAndConditions = this.editTerm ? this.termList.filter(trm => trm.setDefault == 'DEFAULT') : []
    }

    // Fetch Settings every time
    this.settingsLoading = true;
    this.settingService.fetch().subscribe((response: any) => {
      this.settingsLoading = false;
      if (response.settings !== null) {
        this.appSettings =  response.settings.appSettings
        this.activeSettings = response.settings.appSettings.androidSettings
        setStorage(response.settings)
        this.user = JSON.parse(localStorage.getItem('user'))
        this.settings = this.user.setting
      }
    
    },err => this.openErrorModal())

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
    
  }

  // Client Functions
  
  setClientFilter() {
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
    // Filter for client autocomplete
    if(this.clientList){
      this.filteredClients = this.billingTo.valueChanges.pipe(
        startWith<string | client>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterCli(name) : this.clientList.slice())
      )
  }
  
}

   private _filterCli(value: string): client[] {
    if (!value) return this.clientList;
    return this.clientList.filter(cli => cli.name.toLowerCase().includes(value.toLowerCase()));
  }

  removeEmptyNameClients(){
    //remove whitespaces from clientlist
    for (let i = 0; i < this.clientList.length; i++) {
      if(!this.clientList[i].name){
        this.clientList.splice(i,1);
      }else{
      var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "");
      if (tempClient === "") {
        this.clientList.splice(i);
      }
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
      this.clientService.add([this.clientService.changeKeysForApi(this.addClientModal)]).subscribe((response: any) => {
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
      },err => this.openErrorModal())
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
    this.removeEmptyProducts();
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
        this.toasterService.pop('success', 'Product has been added!');
        this.store.select('product').subscribe(products => this.productList = products)
        // window will refresh when product added successfully to see that product in a list
        // window.location.reload(true);
        // this.setProductFilter();
      } else {
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true })
      }
    },err =>this.openErrorModal())
  }

  editInvoiceItem(index) {
    this.modalDescription = false;
    $('#edit-item').modal('show')
    this.activeItem = {...this.activeInvoice.listItems[index]}
  }

  fillItemDetails(prod = null) {
    this.noProductSelected = false;   //dont show red box
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
      discount: 0.00,
    }
    this.calculateTotal()
  }

  addEditInvoiceItem(uid = null) {
    // If product is in product list directly add to invoice else save product and then add to invoice
    // console.log(this.addItem, uid)

    //reduce paid amount when clicked on cross icon of paid label  
    this.amountPaid = (this.activeInvoice.amount - this.activeInvoice.balance)
    if(isNaN(this.amountPaid)){
      this.amountPaid = 0;
    }
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
        if(this.activeItem.tax_rate == 0){
          this.activeItem.tax_amount = 0;
        }
        if(this.activeItem.discount == 0){
          this.activeItem.discount_amount = 0;
        }
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

      //inclusive tax
      if(this.includeTax){
        if(isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0) {
          this.activeItem.tax_rate = 0
        } else if(this.settings.taxFlagLevel === 0 || this.activeInvoice.tax_on_item === 0){ //when tax on item selected from settings
          if(this.activeItem.discount_amount){
            this.activeItem.tax_amount = ((this.activeItem.rate - (this.activeItem.rate * this.activeItem.discount/100) * this.activeItem.quantity) * this.activeItem.tax_rate) / (100 + this.activeItem.tax_rate)
            this.activeItem.total = (this.activeItem.rate * this.activeItem.quantity) - this.activeItem.discount_amount
          }
        }
      }
      //exclusive tax
      else if(isNaN(this.activeItem.tax_rate) || this.activeItem.tax_rate == 0 && !this.includeTax) {
        this.activeItem.tax_rate = 0
      } else if(this.settings.taxFlagLevel === 0 || this.activeInvoice.tax_on_item === 0){ //when tax on item selected from settings
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
          // $('#add-terms').modal('hide')
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
    if(this.activeInvoice && this.activeInvoice.termsAndConditions ) {
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

  inclTax(event){
    if(event.target.checked === true){
      this.includeTax = true
      this.calculateInvoice();
    }
    //exclusive tax
    else{
      this.includeTax = false;
      this.calculateInvoice();
      
    }
  }

  calculateInvoice() {
    var gross_amount = 0
    var deductions = 0
    var additions = 0
    
    if (this.activeInvoice.listItems) {
      for (var i = 0; i < this.activeInvoice.listItems.length; i++) {
        //when user changes from discount on Item to discount on Bill
        if(this.activeSettings.discountFlagLevel === 0 && this.noDiscountOnItem){         //on bill
          this.activeInvoice.listItems[i].discount = 0;
          this.activeInvoice.listItems[i].discount_amount = 0;
          this.activeInvoice.listItems[i].tax_amount = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity)* this.activeInvoice.listItems[i].tax_rate/100;
          this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount +  this.activeInvoice.listItems[i].tax_amount;
        }
        //when user changes from tax on Item to tax on Bill
        if(this.activeSettings.taxFlagLevel === 1 && this.noTaxOnItem){         //on bill
          this.activeInvoice.listItems[i].tax_rate = 0;
          this.activeInvoice.listItems[i].tax_amount = 0;
          if (this.activeInvoice.listItems[i].discount_amount) {
            this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount;
          }else{
            this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity);
          }
        }

        //when user changes to disabled
        if(this.activeSettings.discountFlagLevel === 2){         
          this.activeInvoice.listItems[i].discount = 0;
          this.activeInvoice.listItems[i].discount_amount = 0;
          this.activeInvoice.listItems[i].tax_amount = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity)* this.activeInvoice.listItems[i].tax_rate/100;
          this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount +  this.activeInvoice.listItems[i].tax_amount;
        }
        //when user changes to disabled
        if(this.activeSettings.taxFlagLevel === 2){         
          this.activeInvoice.listItems[i].tax_rate = 0;
          this.activeInvoice.listItems[i].tax_amount = 0;
          if (this.activeInvoice.listItems[i].discount_amount) {
            this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount;
          }else{
            this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity);
          }
        }
        
        //inclusive tax
        if (this.includeTax) {
          
          if (isNaN(this.activeInvoice.listItems[i].tax_rate) || this.activeInvoice.listItems[i].tax_rate == 0) {
            this.activeInvoice.listItems[i].tax_rate = 0
          } else if (this.settings.taxFlagLevel === 0 || this.activeInvoice.tax_on_item === 0) { //when tax on item selected from settings
            this.activeInvoice.listItems[i].tax_amount = ((this.activeInvoice.listItems[i].rate - (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].discount / 100) * this.activeInvoice.listItems[i].quantity) * this.activeInvoice.listItems[i].tax_rate) / (100 + this.activeInvoice.listItems[i].tax_rate)
            if (this.activeInvoice.listItems[i].discount_amount) {
              this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount
            }else{
              this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity)
            }
          }
        }else{
          if (isNaN(this.activeInvoice.listItems[i].tax_rate) || this.activeInvoice.listItems[i].tax_rate == 0) {
            this.activeInvoice.listItems[i].tax_rate = 0
          } else if (this.settings.taxFlagLevel === 0 || this.activeInvoice.tax_on_item === 0) { //when tax on item selected from settings
            if (this.activeInvoice.listItems[i].discount_amount) {
              this.activeInvoice.listItems[i].tax_amount = ((this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount) * this.activeInvoice.listItems[i].tax_rate/100;
              this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) - this.activeInvoice.listItems[i].discount_amount +  this.activeInvoice.listItems[i].tax_amount;
            }else{
              this.activeInvoice.listItems[i].tax_amount = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) * this.activeInvoice.listItems[i].tax_rate/100;
              this.activeInvoice.listItems[i].total = (this.activeInvoice.listItems[i].rate * this.activeInvoice.listItems[i].quantity) +  this.activeInvoice.listItems[i].tax_amount;
            }
          }
        }
        gross_amount += parseFloat(this.activeInvoice.listItems[i].total)
      }
    }
    this.activeInvoice.gross_amount = gross_amount

    // Discount
    if(this.activeSettings.discountFlagLevel === 1){
      this.activeInvoice.percentage_value = 0;
      this.activeInvoice.discount = 0;
    }

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

    if(this.activeSettings.taxFlagLevel === 0){
      this.activeInvoice.tax_rate = 0;
      this.activeInvoice.tax_amount = 0;
    }
    
    if (this.activeInvoice.tax_rate != null && !this.includeTax) {
      if(isNaN(this.activeInvoice.tax_rate)) {
        this.activeInvoice.tax_rate = 0
      }
      additions += (this.activeInvoice.gross_amount - deductions) * (
        this.activeInvoice.tax_rate / 100
      )
      
      this.activeInvoice.tax_amount = additions
    }else if(this.includeTax){
      this.activeInvoice.tax_amount = ((this.activeInvoice.gross_amount - (this.activeInvoice.gross_amount * this.activeInvoice.discount / 100)) * this.activeInvoice.tax_rate) / (100 + this.activeInvoice.tax_rate)
      //remove digits after two decimal
      var value = this.activeInvoice.tax_amount.toString().substring(0, this.activeInvoice.tax_amount.toString().indexOf(".") + 3);
      this.activeInvoice.tax_amount = parseFloat(value);
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
          var b = this.activeInvoice.taxList[i].calculateValue.toString().substring(0, this.activeInvoice.taxList[i].toString().indexOf(".") + 5)
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
      this.noProductSelected = true; //show red box
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

    if(this.includeTax){
      this.activeInvoice.taxableFlag = 1;
    }
    
    if(this.activeInvoice.invoice_number !=="" && this.invoiceFlag == false){
    this.invListLoader = true;
    this.invoiceService.add([this.activeInvoice]).subscribe((result: any) => {
      if (result.status !== 200) {
        this.toasterService.pop('failure', 'Couldnt save invoice');
      } else if (result.status === 200) {
        this.invListLoader = false;
        // Update store
        if(this.edit) {
          this.store.select('recentInvoices').subscribe(invs => {
            let index = invs.findIndex(inv => inv.unique_identifier == result.invoiceList[0].unique_identifier)
            //after delete store getting udated here so we already updating in fetchInvoice fun so simply delete only, from store
            if (result.invoiceList[0].deleted_flag == 1) {
              self.store.dispatch(new invoiceActions.removeRecentInvoice(index))
              this.toasterService.pop('success', 'Invoice Deleted successfully');
              this.router.navigate(['/invoice/add'])
            }
            else if(this.activeInvoice.deleted_flag !== 1 ) {
              self.store.dispatch(new invoiceActions.editRecentInvoice({index, value: result.invoiceList[0]}))
              this.toasterService.pop('success', 'invoice Updated successfully');
              this.router.navigate([`viewtodaysinvoice/${this.InvoiceId}`])
            }
          })
        } else {
          self.store.dispatch(new invoiceActions.recentInvoice([this.invoiceService.changeKeysForStore(result.invoiceList[0])]))
        }
          
        // save make invoice
        if(this.incrementInvNo === true) {
          self.store.dispatch(new invoiceActions.recentInvoice((result.invoiceList[0])))
          this.toasterService.pop('success', 'Invoice saved successfully');
          this.updateSettings();
          self.resetCreateInvoice()
          this.router.navigate([`viewtodaysinvoice/${result.invoiceList[0].unique_identifier}`])
        }
         else if(!this.edit) {
          //set recently added invoice list in store
          this.toasterService.pop('success', 'Invoice saved successfully');
          this.updateSettings();
          self.resetCreateInvoice()
          this.router.navigate([`viewtodaysinvoice/${result.invoiceList[0].unique_identifier}`])
        }
      }
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
    if(this.clientList.length !== 0){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  
  deleteInvoice() {
    this.activeInvoice.deleted_flag = 1
    this.save(true)
    this.router.navigate(['/invoice/add'])
  }

  deleteInstallment(index){
    this.amountPaid = this.amountPaid - this.addPaymentModal.payments[index].paid_amount;
    this.activeInvoice.balance = this.activeInvoice.balance + this.addPaymentModal.payments[index].paid_amount;
    
    this.activeInvoice.payments.splice(index,1);
  }
  

  resetCreateInvoice() {
    this.billingTo.reset('')
    this.addItem.reset('')
    this.dueDate.reset()
    this.activeInvoice = <invoice>{}
    this.activeClient = <client>{}
    this.amountPaid = undefined;

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

    this.settingService.add(settings1).subscribe((response: any) => {},err => console.log(err))
  }

  // Payment Functions
  openAddPaymentModal() {
    // if(!this.activeInvoice.amount || this.activeInvoice.amount == 0 || this.activeInvoice.balance == 0) {
    //   return false
    // } //commented due to not to open a modal
    
    this.addPaymentModal = {
      amount: this.activeInvoice.amount,
      balance: this.activeInvoice.amount,
      date_of_payment: this.activeInvoice.created_date,
      paid_amount: this.activeInvoice.balance,
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
    // this.amountPaid = 0;
    // $('#addPaymentAddInvoice').modal('show')
  }

  addPaymentInModalPaymentList() {
    this.amountPaid += this.addPaymentModal.paid_amount;
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
    this.addPaymentsInInvoice();
    
  }

  addPaymentsInInvoice() {
    this.activeInvoice.payments = this.addPaymentModal.payments
    this.calculateInvoice()
    // this.closeAddPaymentModal()    comment due to modal is removed as this was called done button clicked from modal
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
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var  query = {
        startDate: start.getTime(),
        endDate: new Date().getTime(),
        serviceIdentifier: false
      }

    this.invListLoader = true
    this.invoiceService.fetchTodaysData(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.invListLoader = false
        this.store.dispatch(new invoiceActions.recentInvoice(response.list ? response.list.filter(rec => rec.deleted_flag == 0) : []))
        this.store.select('recentInvoices').subscribe(invoices => {
          this.recentInvoiceList = invoices
        })
      }

    }, err => this.openErrorModal())
  }

  setActiveInv(invId: string = '') {
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
        this.clientService.fetch().subscribe((response: response) => {
          this.clientListLoading = false
          this.clientList = response.records;
          this.removeEmptySpaces();
        })
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

  goView(invId){
    this.router.navigate([`viewtodaysinvoice/${invId}`])
  }

  addNewInvoice(){
    this.invoiceId = '';
    this.activeClient = {};
    this.shippingAddress = null;
    this.router.navigate(['/invoice/add'])
  }


  saveSettings() {
    var setting = this.appSettings
    setting.androidSettings = this.activeSettings

    // if(this.activeInvoice.discount_on_item == 0 || this.activeInvoice.discount ){
    //   this.appSettings.androidSettings.discountFlagLevel = 0;
    // }

    // if(this.activeInvoice.tax_on_item == 0 || this.activeInvoice.tax_rate ){
    //   setting.androidSettings.taxFlagLevel = 0;
    // }

    

    this.settingService.add(setting).subscribe((response: any) => {
      if (response.status == 200) {
        this.calculateInvoice()
        
        this.toasterService.pop('success','Updated Successfully')
        setStorage(response.settings)
        this.user = JSON.parse(localStorage.getItem('user'))
        this.settings = this.user.setting
        this.commonSettingsInit();
        
      } else {
        alert (response.message)
        // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
      }
    },error => this.openErrorModal())
  }
}
