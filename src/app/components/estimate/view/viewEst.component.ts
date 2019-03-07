import { Component, OnInit } from '@angular/core'
import { EstimateService } from '../../../services/estimate.service'
import { ClientService } from '../../../services/client.service'
import { SettingService } from '../../../services/setting.service'

import { response, estimate, client } from '../../../interface'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'

import { Store } from '@ngrx/store'
import * as estimateActions from '../../../actions/estimate.action'
import * as clientActions from '../../../actions/client.action'
import * as globalActions from '../../../actions/globals.action'
import { AppState } from '../../../app.state'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-view',
  templateUrl: './viewEst.component.html',
  styleUrls: ['./viewEst.component.css']
})
export class ViewEstComponent implements OnInit {

  estimateList: estimate[]
  activeEst: estimate
  estListLoader: boolean = false
  estDispLimit: number = 20
  estSortTerm: string = 'createdDate'
  estSearchTerm: string
  clientListLoading: boolean = false
  estId: number
  dateDDMMYY: boolean
  dateMMDDYY: boolean

  public estimateQueryForm = {
    client: new FormControl(),
    dateRange: {
      start: new FormControl(),
      end: new FormControl(new Date())
    }
  }

  public selectedClientQuery = {
    selectedClient: new FormControl(),
  }

  // multiselect dropdown

  dropdownList
  lastSelectedClients
  itemSelected

  selectedItems = [];
  dropdownSettings = {};

  // multiselect dropdown ends
  changingQuery: boolean = false

  public clientList: client[]
  private activeClient: client
  filteredClients: Observable<string[] | client[]>

  public settings: any
  customEnableDate: boolean;
  estimateId: any;
  showBackground: boolean = false;
  hideTaxLabel: boolean;
  hideDiscountLabel: boolean;
  isDiscountPresent: boolean;
  isTaxPresent: boolean;

  constructor(private estimateService: EstimateService, private clientService: ClientService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    public router: Router,
    private settingService: SettingService
  ) {
    store.select('client').subscribe(clients => this.clientList = clients)
    this.settings = JSON.parse(localStorage.getItem('user')).setting
    // date and time dropdown
    jQuery(document).ready(function (e) {
      function t(t) {
        e(t).bind("click", function (t) {
          t.preventDefault();
          e(this).parent().fadeOut()
        })
      }
      e(".dropdown-toggle").click(function () {
        var t = e(this).parents(".button-dropdown").children(".dropdown-menu").is(":hidden");
        e(".button-dropdown .dropdown-menu").hide();
        e(".button-dropdown .dropdown-toggle").removeClass("active");
        if (t) {
          e(this).parents(".button-dropdown").children(".dropdown-menu").toggle().parents(".button-dropdown").children(".dropdown-toggle").addClass("active")
        }
      });
      e(document).bind("click", function (t) {
        var n = e(t.target);
        if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-menu").hide();
      });
      e(document).bind("click", function (t) {
        var n = e(t.target);
        if (!n.parents().hasClass("button-dropdown")) e(".button-dropdown .dropdown-toggle").removeClass("active");
      })
    });
    // date and time dropdown ends

  }

  ngOnInit() {
    // Fetch clients if not in store
    // this.clientList = [];
    this.dropdownList = [];
    if (this.clientList.length < 1) {
      this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        this.clientList = response.records;
        //remove whitespaces from clientlist
        for (let i = 0; i < this.clientList.length; i++) {
          if(!this.clientList[i].name){
            this.clientList.splice(i, 1);
          }
          var tempClient = this.clientList[i].name.toLowerCase().replace(/\s/g, "")
          if (tempClient === "") {
            this.clientList.splice(i, 1);
          }
        }
        this.dropdownList = this.clientList;
        this.store.dispatch(new clientActions.add(response.records))
      })
    } else {
      this.dropdownList = this.clientList;
    }
    this.route.params.subscribe(params => {
      if(params.estId){
        this.estimateId = params.estId;
      }else{
        this.showBackground = true;
        this.openSearchClientModal()
      }
    })
  
    // show date as per format changed
    this.settingService.fetch().subscribe((response: any) => {
      this.dateDDMMYY = response.settings.appSettings.androidSettings.dateDDMMYY;
      this.dateMMDDYY = response.settings.appSettings.androidSettings.dateMMDDYY;
    })

    // dropdown settings
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'uniqueKeyClient',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };
   // keep first item selected in madal
   var date = new Date()
   this.itemSelected = 'This Month'
   this.estimateQueryForm.dateRange.start.reset(new Date(date.getFullYear(), date.getMonth(), 1))
   this.estimateQueryForm.dateRange.end.reset(new Date(date.getFullYear(), date.getMonth() + 1, 0))

  //  // Set Active invoice whenever invoice list changes
  //  this.store.select('estimate').subscribe(estimates => {
  //   this.estimateList = estimates
  //   this.setActiveEst();
  //   // if(this.InvoiceId){
  //   //   this.setActiveInv(this.InvoiceId)
  //   //   this.closeSearchModel();
  //   // }
  // })
   
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
  }

  duration = ['All Time', 'This Week', 'This Month', 'Last Week', 'Last Month', 'Custom']


  //to make custom as selsected item when user changes date from calender
  public onDate(event): void {
    if (this.estimateQueryForm.dateRange.start.value || this.estimateQueryForm.dateRange.end.value !== event.value) {
      this.itemSelected = 'Custom'
    }
  }
  showItem(item) {
    var curr = new Date; 
    var firstday = curr.getDate() - curr.getDay();
    // var lastday = firstday + 6;
    var lastWeekFirstDay = firstday - 7;
    var lastWeekLastsDay = firstday - 1;
    var lastdayoflastmonth = new Date();
    lastdayoflastmonth.setMonth(lastdayoflastmonth.getMonth(), 0);
    var firstdayoflastmonth = new Date();
    firstdayoflastmonth.setDate(1);
    firstdayoflastmonth.setMonth(firstdayoflastmonth.getMonth() - 1);
    
    this.itemSelected = item
    if(this.itemSelected === 'All Time'){
      this.estimateQueryForm.dateRange.start.reset()
      this.estimateQueryForm.dateRange.end.reset()
    }
    if(this.itemSelected === 'This Week'){
      this.estimateQueryForm.dateRange.start.reset(new Date(curr.setDate(firstday)))
      this.estimateQueryForm.dateRange.end.reset(new Date(curr.setDate(curr.getDate() - curr.getDay()+6))) //lastday
    }
    if(this.itemSelected === 'Last Week'){
      this.estimateQueryForm.dateRange.start.reset(new Date(curr.setDate(lastWeekFirstDay)))
      this.estimateQueryForm.dateRange.end.reset(new Date(curr.setDate(lastWeekLastsDay)))
    }
    if(this.itemSelected === 'This Month'){
      this.estimateQueryForm.dateRange.start.reset(new Date(curr.getFullYear(), curr.getMonth(), 1))
      this.estimateQueryForm.dateRange.end.reset(new Date(curr.getFullYear(), curr.getMonth() + 1, 0))
    }
    if(this.itemSelected === 'Last Month'){
      this.estimateQueryForm.dateRange.start.reset(new Date(firstdayoflastmonth))
      this.estimateQueryForm.dateRange.end.reset(new Date(lastdayoflastmonth))
    }
  }

  loadMore() {
    this.estDispLimit += 10
  }

  goEdit(estId) {
    this.router.navigate([`estimate/edit/${estId}`])
  }

  makeInvoice() {
    this.router.navigate([`invoice/edit/${this.activeEst.unique_identifier}`])
  }

  showSelectedEstimate(client) {
    
    this.estimateQueryForm.client = client
    this.SearchEstimate()
    $('#search-client').modal('hide')
  }

  openSearchClientModal() {
    $('#search-client').modal('show')
  }

  closeEstSearchModel() {
    $('#search-client').modal('hide')
  }


  // Search Estimate Functions
  SearchEstimate() {
    var query = {
      clientIdList: [],
      startTime: 0,
      endTime: 0
    }
    // this.estimateQueryForm.client = this.searchService.getUserData()
    if (this.estimateQueryForm.client.value && this.estimateQueryForm.client.value.length > 0) {
      query.clientIdList = this.estimateQueryForm.client.value.map(cli => cli.uniqueKeyClient)
      if (query.clientIdList[0] == null) {
        query.clientIdList = null
        this.estimateQueryForm.client.reset([{ name: 'All' }])
      }
    } else {
      query.clientIdList = null
      // this.estimateQueryForm.client.reset([{ name: 'All' }])
    }
    if (this.estimateQueryForm.dateRange.start.value) {
      query.startTime = this.estimateQueryForm.dateRange.start.value.getTime()
    }
    if (this.estimateQueryForm.dateRange.end.value) {
      query.endTime = this.estimateQueryForm.dateRange.end.value.getTime()
    } else {
      query.endTime = new Date().getTime()
    }
    this.store.dispatch(new globalActions.add({ estimateQueryForm: this.estimateQueryForm }))
    this.fetchEstimates(query)
  }

  getNames() {
    return this.estimateQueryForm.client.value.reduce((a, b) => a + b.name + ', ', '')
  }

  getClientName(id) {
    if(this.clientList){
    return this.clientList.filter(client => client.uniqueKeyClient == id)[0].name
    }
  }

  fetchEstimates(query = null) {
    // Fetch estimates with given query
    if (query == null) {
      query = {
        clientIdList: null,
        startTime: 0,
        endTime: new Date().getTime()
      }
    }

    this.estListLoader = true
    this.estimateService.fetchByQuery(query).subscribe((response: any) => {
      if (response.status === 200) {
        this.estListLoader = false
        this.store.dispatch(new estimateActions.reset(response.records ? response.records.filter(rec => rec.enabled == 0) : []))
        // Set Active invoice whenever invoice list changes
        this.store.select('estimate').subscribe(estimates => {
          this.estimateList = estimates
          this.setActiveEst();
          // if(this.InvoiceId){
          //   this.setActiveInv(this.InvoiceId)
          //   this.closeSearchModel();
          // }
        })
      }
      
    })
  }

  setActiveEst(estId: string = '') {
    // this.closeEstSearchModel();
    if (!estId || estId === "null") {
      this.activeEst = this.estimateList[0];
      //console.log(this.activeEst)
    } else {
      this.activeEst = this.estimateList.filter(est => est.unique_identifier == estId)[0]
    }
    if(this.activeEst !== undefined){
      for(let i = 0;i<this.activeEst.alstQuotProduct.length; i++){
        // if(this.activeEst.alstQuotProduct[i].discount !== undefined || 
        //   this.activeEst.alstQuotProduct[i].tax_rate !== undefined || 
        //   this.activeEst.alstQuotProduct[i].total !== undefined ||
        //   this.activeEst.alstQuotProduct[i].product_name !== undefined ){
        //   this.activeEst.alstQuotProduct[i].discountRate = this.activeEst.alstQuotProduct[i].discount;
        //   this.activeEst.alstQuotProduct[i].taxRate = this.activeEst.alstQuotProduct[i].tax_rate;
        //   this.activeEst.alstQuotProduct[i].productName = this.activeEst.alstQuotProduct[i].product_name;
        // }
        if(this.activeEst.alstQuotProduct[i].discountRate === 0){
          this.hideTaxLabel = true;
        }else{
          this.isDiscountPresent = true;
          this.hideTaxLabel = false;
        }
        if(this.activeEst.alstQuotProduct[i].taxRate === 0){
          this.hideDiscountLabel = true;
        }else{
          this.isTaxPresent = true;
          this.hideDiscountLabel = false;
        }
      }
      for(let i = 0;i<this.activeEst.alstQuotTermsCondition.length; i++){
        if(this.activeEst.alstQuotTermsCondition[i].terms_condition !== undefined){
          this.activeEst.alstQuotTermsCondition[i].termsConditionText = this.activeEst.alstQuotTermsCondition[i].terms_condition;
        }
      }
    }
    this.setActiveClient()
  }

  setActiveClient() {
    if (this.activeEst) {
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEst.unique_key_fk_client)[0]
      if (client) {
        //if shipping Address isn't coming from estimateList then get it from clientList
        if(!this.activeEst.shippingAddress){
          this.activeEst.shippingAddress = client.shippingAddress;
        }
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
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
    })
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
}
