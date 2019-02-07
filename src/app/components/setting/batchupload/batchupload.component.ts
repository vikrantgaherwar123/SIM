import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { generateUUID } from '../../../globalFunctions'
import { Router } from '@angular/router'

import { client, response, product } from '../../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'

import { AppState } from '../../../app.state'
import { ToasterService } from 'angular2-toaster';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-batchupload',
  templateUrl: './batchupload.component.html',
  styleUrls: ['./batchupload.component.css']
})
export class BatchuploadComponent implements OnInit {
  private user: {
    user: {
      orgId: string
    },
    setting: any
  }

  arrayBuffer: any;
  file: File;
  clientRecords: any;
  productRecords: any;
  errors: {};
  worksheet1: XLSX.WorkSheet;
  worksheet2: XLSX.WorkSheet;
  addressRecord: any;
  list: string;
  duplicateOrgName: boolean = true;
  settings: any;

  
  incomingfile(event) {
    this.file = event.target.files[0];
    var cheangedFile = this.file;
    if(cheangedFile !== event.target.files[0].name ){
      this.showClientsTable = false
      this.showProductsTable = false
    }
  }

  // client starts
  clientList: client[]
  productList: product[]
  //these flags are set here to do npm build otherwise we can use without initializing bt its gud way to initialize 
  showClientsOrProducts : boolean = false
  showProductsTable : boolean = false
  showClientsTable : boolean = false
  // client ends
  constructor(private productService: ProductService,
    public clientService: ClientService,
    public toasterService: ToasterService,
    private router: Router, private store: Store<AppState>) {

    store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
    store.select('product').subscribe(products => this.productList = products.filter(prod => prod.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
  }


  Upload() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      //for client csv
      if(workbook.Sheets.Sheet1 !== undefined){
      if(workbook.Sheets.Sheet1["!ref"]=="A1:J2"){
      this.worksheet1 = workbook.Sheets[first_sheet_name];
      this.showClientsTable = true;
      this.showProductsTable = false;
      //get address of header 
      this.worksheet1.A1.v = this.worksheet1.A1.h = this.worksheet1.A1.w = "name"
      this.worksheet1.B1.v = this.worksheet1.B1.h = this.worksheet1.B1.w = "contactPersonName"
      this.worksheet1.C1.v = this.worksheet1.C1.h = this.worksheet1.C1.w = "addressLine1"
      this.worksheet1.D1.v = this.worksheet1.D1.h = this.worksheet1.D1.w = "addressLine2"
      this.worksheet1.E1.v = this.worksheet1.E1.h = this.worksheet1.E1.w = "addressLine3"
      this.worksheet1.F1.v = this.worksheet1.F1.h = this.worksheet1.F1.w = "businessId"
      this.worksheet1.G1.v = this.worksheet1.G1.h = this.worksheet1.G1.w = "businessDetail"
      this.worksheet1.H1.v = this.worksheet1.H1.h = this.worksheet1.H1.w= "number"
      this.worksheet1.I1.v = this.worksheet1.I1.h = this.worksheet1.I1.w= "email"
      this.worksheet1.J1.v = this.worksheet1.J1.h = this.worksheet1.J1.w= "shippingAddress"
      this.clientRecords = XLSX.utils.sheet_to_json(this.worksheet1, { raw: true });
      this.productRecords = [];
      }
      //for product csv
      else {
        this.showClientsTable = false;
        this.showProductsTable = true;
      //header ends for clients
      this.worksheet2 = workbook.Sheets[first_sheet_name];
      this.worksheet2.A1.v = this.worksheet2.A1.h = this.worksheet2.A1.w = "prodName"
      this.worksheet2.B1.v = this.worksheet2.B1.h = this.worksheet2.B1.w = "unit"
      this.worksheet2.C1.v = this.worksheet2.C1.h = this.worksheet2.C1.w = "discription"
      this.worksheet2.D1.v = this.worksheet2.D1.h = this.worksheet2.D1.w = "rate"
      this.worksheet2.E1.v = this.worksheet2.E1.h = this.worksheet2.E1.w = "taxRate"
      this.worksheet2.F1.v = this.worksheet2.F1.h = this.worksheet2.F1.w= "productCode"
      //header ends Products
      this.productRecords = XLSX.utils.sheet_to_json(this.worksheet2, { raw: true });
      this.clientRecords = [];
      }
    }
      //for client xls & xlsx
      else if(workbook.Sheets.clients){
        this.worksheet1 = workbook.Sheets[first_sheet_name];
      this.showClientsTable = true;
      this.showProductsTable = false;
      //get address of header 
      this.worksheet1.A1.v = this.worksheet1.A1.h = this.worksheet1.A1.w = "name"
      this.worksheet1.B1.v = this.worksheet1.B1.h = this.worksheet1.B1.w = "contactPersonName"
      this.worksheet1.C1.v = this.worksheet1.C1.h = this.worksheet1.C1.w = "addressLine1"
      this.worksheet1.D1.v = this.worksheet1.D1.h = this.worksheet1.D1.w = "addressLine2"
      this.worksheet1.E1.v = this.worksheet1.E1.h = this.worksheet1.E1.w = "addressLine3"
      this.worksheet1.F1.v = this.worksheet1.F1.h = this.worksheet1.F1.w = "businessId"
      this.worksheet1.G1.v = this.worksheet1.G1.h = this.worksheet1.G1.w = "businessDetail"
      this.worksheet1.H1.v = this.worksheet1.H1.h = this.worksheet1.H1.w= "number"
      this.worksheet1.I1.v = this.worksheet1.I1.h = this.worksheet1.I1.w= "email"
      this.worksheet1.J1.v = this.worksheet1.J1.h = this.worksheet1.J1.w= "shippingAddress"
      this.clientRecords = XLSX.utils.sheet_to_json(this.worksheet1, { raw: true });
      this.productRecords = [];
      }
      
      //for product xls & xlsx
      else if(workbook.Sheets.products) {
        this.showClientsTable = false;
        this.showProductsTable = true;
      //header ends for clients
      this.worksheet2 = workbook.Sheets[first_sheet_name];
      this.worksheet2.A1.v = this.worksheet2.A1.h = this.worksheet2.A1.w = "prodName"
      this.worksheet2.B1.v = this.worksheet2.B1.h = this.worksheet2.B1.w = "unit"
      this.worksheet2.C1.v = this.worksheet2.C1.h = this.worksheet2.C1.w = "discription"
      this.worksheet2.D1.v = this.worksheet2.D1.h = this.worksheet2.D1.w = "rate"
      this.worksheet2.E1.v = this.worksheet2.E1.h = this.worksheet2.E1.w = "taxRate"
      this.worksheet2.F1.v = this.worksheet2.F1.h = this.worksheet2.F1.w= "productCode"
      //header ends Products
      this.productRecords = XLSX.utils.sheet_to_json(this.worksheet2, { raw: true });
      this.clientRecords = [];
      }
    }
    fileReader.readAsArrayBuffer(this.file); // readAsArrayBuffer represents the FILES DATA
  }


  ngOnInit() {

  }

  save() {
    // client start

    for (let i = 0; i < this.clientRecords.length; i++) {
      //add required input params for api call
      this.clientRecords[i].enabled = 0;
      this.clientRecords[i].organizationId = parseInt(this.user.user.orgId);
      this.clientRecords[i].uniqueKeyClient = generateUUID(this.user.user.orgId);
      var d = new Date()
      this.clientRecords[i].deviceCreatedDate = d.getTime()
      this.clientRecords[i].modifiedDate = d.getTime()
      //add all addresses in a single object and send it to api to show those all addr in client ciew mode
      this.clientRecords[i].addressLine1 = this.clientRecords[i].addressLine1 + ' ' +this.clientRecords[i].addressLine2 + ' ' + this.clientRecords[i].addressLine3
      this.clientService.add([this.clientService.changeKeysForApi(this.clientRecords[i])]).subscribe((response: any) => {
        if (response.status === 200) {
          // Update store and client list
          let index, storeIndex
          index = this.clientList.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          // storeIndex is used if user want to delete some record right now we havent used it
          this.store.select('client').subscribe(clients => {
            storeIndex = clients.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          })

          if (index == -1) {  // add
            // this if condn and for loop is used to not add existing org name but right nw its not working
            var OrgName = response.clientList[0].name.toLowerCase();
            if(this.clientList){
            for(let i=0;i<this.clientList.length;i++){
             this.list =this.clientList[i].name.toLowerCase();
             if(this.list[i] == OrgName){
              this.toasterService.pop('failure', 'Client Already Exists !!!');
              this.duplicateOrgName = false;
             }
            }
            if(this.duplicateOrgName == true){
            this.store.dispatch(new clientActions.add([this.clientService.changeKeysForStore(response.clientList[0])]))
            this.clientList.push(this.clientService.changeKeysForStore(response.clientList[0]))
            this.toasterService.pop('success', 'Clients Saved Successfully !!!');
            }
          }
          }
          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
        } else if (response.status === 414) {
          this.toasterService.pop('failure', 'Sorry Your Subscription Expired ');
        }
        else {
          // self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          //console.log(response.error)
          this.toasterService.pop('failure', 'Some error occurred, please try again!');
        }
      })
    }
    //product starts

    for (let i = 0; i < this.productRecords.length; i++) {
      //add required input params for api call
      this.productRecords[i].serverOrgId = parseInt(this.user.user.orgId);
      this.productRecords[i].uniqueKeyProduct = generateUUID(this.user.user.orgId);
      var d = new Date()
      this.productRecords[i].modifiedDate = d.getTime()
      this.productRecords[i].inventoryEnabled = this.productRecords[i].inventoryEnabled ? 1 : 0;

      this.productService.add([this.productService.changeKeysForApi(this.productRecords[i])]).subscribe((response: any) => {
        if (response.status === 200) {
          // Update store and client list
          let index, storeIndex
          index = this.productList.findIndex(pro => pro.uniqueKeyProduct == response.productList[0].unique_identifier)
          this.store.select('product').subscribe(prods => {
            storeIndex = prods.findIndex(prs => prs.uniqueKeyProduct == response.productList[0].unique_identifier)
          })

          if (index == -1) {  // add
            this.store.dispatch(new productActions.add([this.productService.changeKeysForStore(response.productList[0])]))
            this.productList.push(this.productService.changeKeysForStore(response.productList[0]))
            this.toasterService.pop('success', 'Product added successfully !!!');
          }
          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
        } else if (response.status === 414) {
          this.toasterService.pop('failure', 'Sorry Your Subscription Expired ');
        }
        else {
          // self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          //console.log(response.error)
          this.toasterService.pop('failure', 'Some error occurred, please try again!');
        }
      })
    }
  }
  remove(index) {
    this.clientRecords.splice(index, 1);
  }

  productRemove(index) {
    this.productRecords.splice(index, 1);
  }

}
