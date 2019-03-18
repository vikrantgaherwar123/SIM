import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service'
import { ProductService } from '../../../services/product.service'
import { generateUUID } from '../../../globalFunctions'
import { Router } from '@angular/router'

import { client, product, response } from '../../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../../actions/client.action'
import * as productActions from '../../../actions/product.action'

import { AppState } from '../../../app.state'
import { ToasterService } from 'angular2-toaster';
import * as XLSX from 'xlsx';
import { empty } from 'rxjs';
import { IfStmt } from '@angular/compiler';
import { Title }     from '@angular/platform-browser';

@Component({
  selector: 'app-batchupload',
  templateUrl: './batchupload.component.html',
  styleUrls: ['./batchupload.component.css']
})
export class BatchuploadComponent implements OnInit {
  arrayBuffer: any;
  file: File;
  clientRecords: any;
  productRecords: any;
  errors: {};
  worksheet1: XLSX.WorkSheet;
  private activeClient = <client>{}
  private activeProduct = <product>{}
  repeatativeClientName: string = ''
  addressRecord: any;
  list: string;
  duplicateOrgName: boolean = true;
  OrgName: string;
  prodName: any;
  clientListLoading: boolean;
  productListLoading: boolean;
  repeatativeProductName: string;
  showClientDiv: boolean = false;
  showProductDiv: boolean = false;
  make_blur_disable : boolean = false;
  incomingfile(event) {
    if (event.target.files[0]) {
      this.file = event.target.files[0];
      var cheangedFile = this.file;
      if (cheangedFile !== event.target.files[0].name) {
        this.showClientsTable = false
        this.showProductsTable = false
      }
    }
    this.Upload();
  }

  // client starts
  clientList: client[]
  productList: product[]
  //these flags are set here to do npm build otherwise we can use without initializing bt its gud way to initialize 
  showClientsOrProducts: boolean = false
  showProductsTable: boolean = false
  showClientsTable: boolean = false
  private user: {
    user: {
      orgId: string
    }
  }
  // client ends
  constructor(private productService: ProductService,
    public clientService: ClientService,
    public toasterService: ToasterService,
    private titleService: Title,
    private router: Router, private store: Store<AppState>) {

    store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
    store.select('product').subscribe(products => this.productList = products.filter(prod => prod.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Batch Upload');
    this.showClient();
    this.clientListLoading = true
    if (this.clientList) {
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        if (response.status === 200) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(cli => cli.enabled == 0)

        }
      })
    } else {
      this.clientListLoading = false
    }

    //fetching products
    this.productListLoading = true

    if (this.productList) {
      this.productService.fetch().subscribe((response: any) => {
        this.productListLoading = false
        if (response.status === 200) {
          this.store.dispatch(new productActions.add(response.records.filter(prod => prod.enabled == 0)))
          this.productList = response.records.filter(prod => prod.enabled == 0)
        }
      })
    } else {
      this.productListLoading = false
    }
  }

  showClient()
  {
    this.showClientDiv = true
    this.showProductDiv = false
  }
  showProduct()
  {
    this.showProductDiv = true
    this.showClientDiv = false
  }

  Upload() {
    this.make_blur_disable = true;
    // if(this.worksheet1.A1.v === ' '){
    //   console.log('remove spaces');
    // }
    // else{
      
    // }
    this.showClientsOrProducts = true;
    this.showClientsTable = true;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var second_sheet_name = workbook.SheetNames[1];
      var temp = [];
      temp.push(workbook.Sheets.Sheet1);
      console.log(temp);
      
      this.worksheet1 = workbook.Sheets[first_sheet_name];

      //get name of client
      this.OrgName = this.worksheet1.A1.v;
      if(this.OrgName === undefined){
        this.toasterService.pop('Failure', 'Org Name Required !!!');
      }
      var clientName = this.OrgName.replace(/\s/g, "").toLowerCase();
      //get name of product
      this.prodName = this.worksheet1.A1.v;
      var productName = this.prodName.replace(/\s/g, "").toLowerCase();
      

      if (clientName === "organizationname*") {
        this.showClientsTable = true;
        this.showProductsTable = false;
        //get address of header
        if(this.worksheet1.A1 === undefined){
          this.worksheet1.A1 = "name";
        }
        else{
          this.worksheet1.A1.v = this.worksheet1.A1.h = this.worksheet1.A1.w = "name"
        }

        if(this.worksheet1.B1 === undefined){
          this.worksheet1.B1 = "contactPersonName";
        }
        else{
          this.worksheet1.B1.v = this.worksheet1.B1.h = this.worksheet1.B1.w = "contactPersonName"
        }
        if(this.worksheet1.C1 === undefined){
          this.worksheet1.C1 = "addressLine1";
        }
        else{
          this.worksheet1.C1.v = this.worksheet1.C1.h = this.worksheet1.C1.w = "addressLine1"
        }
        if(this.worksheet1.D1 === undefined){
          this.worksheet1.D1 = "addressLine2";
        }
        else{
          this.worksheet1.D1.v = this.worksheet1.D1.h = this.worksheet1.D1.w = "addressLine2"
        }
        if(this.worksheet1.E1 === undefined){
          this.worksheet1.E1 = "addressLine3";
        }
        else{
          this.worksheet1.E1.v = this.worksheet1.E1.h = this.worksheet1.E1.w = "addressLine3"
        }
        if(this.worksheet1.F1 === undefined){
          this.worksheet1.F1 = "businessId";
        }
        else{
          this.worksheet1.F1.v = this.worksheet1.F1.h = this.worksheet1.F1.w = "businessId"
        }
        if(this.worksheet1.G1 === undefined){
          this.worksheet1.G1 = "businessDetail";
        }
        else{
          this.worksheet1.G1.v = this.worksheet1.G1.h = this.worksheet1.G1.w = "businessDetail"
        }
        if(this.worksheet1.H1 === undefined){
          this.worksheet1.H1 = "number";
        }
        else{
          this.worksheet1.H1.v = this.worksheet1.H1.h = this.worksheet1.H1.w = "number"
        }
        if(this.worksheet1.I1 === undefined){
          this.worksheet1.I1 = "email";
        }
        else{
          this.worksheet1.I1.v = this.worksheet1.I1.h = this.worksheet1.I1.w = "email"
        }
        if(this.worksheet1.J1 === undefined){
          this.worksheet1.J1 = "shippingAddress";
        }
        else{
          this.worksheet1.J1.v = this.worksheet1.J1.h = this.worksheet1.J1.w = "shippingAddress"
        }
        this.clientRecords = XLSX.utils.sheet_to_json(this.worksheet1, { raw: true });
        
        //header ends for clients
      }
      if (productName === "productname*") {

        this.showClientsTable = false;
        this.showProductsTable = true;

        if(this.worksheet1.A1 === undefined){
          this.worksheet1.A1 = "prodName";
        }
        else{
          this.worksheet1.A1.v = this.worksheet1.A1.h = this.worksheet1.A1.w = "prodName"
        }

        if(this.worksheet1.B1 === undefined){
          this.worksheet1.B1 = "unit";
        }
        else{
          this.worksheet1.B1.v = this.worksheet1.B1.h = this.worksheet1.B1.w = "unit"
        }

        if(this.worksheet1.C1 === undefined){
          this.worksheet1.C1 = "discription";
        }
        else{
          this.worksheet1.C1.v = this.worksheet1.C1.h = this.worksheet1.C1.w = "discription"
        }
        if(this.worksheet1.D1 === undefined){
          this.worksheet1.D1 = "rate";
        }
        else{
          this.worksheet1.D1.v = this.worksheet1.D1.h = this.worksheet1.D1.w = "rate"
        }
        if(this.worksheet1.E1 === undefined){
          this.worksheet1.E1 = "taxRate";
        }
        else{
          this.worksheet1.E1.v = this.worksheet1.E1.h = this.worksheet1.E1.w = "taxRate"
        }
        if(this.worksheet1.F1 === undefined){
          this.worksheet1.F1 = "productCode";
        }
        else{
          this.worksheet1.F1.v = this.worksheet1.F1.h = this.worksheet1.F1.w = "productCode"
        }

        //header ends Products
        this.productRecords = XLSX.utils.sheet_to_json(this.worksheet1, { raw: true });
      }
    }
    fileReader.readAsArrayBuffer(this.file); // readAsArrayBuffer represents the FILES DATA
  }

  clearData(){
    this.make_blur_disable = false;
    this.showClientsTable = false;
    this.showProductsTable = false;
    this.clientRecords = [];
    this.productRecords = []
  }


  save(status, edit) {
    // client start
    if (this.clientRecords) {
      for (let i = 0; i < this.clientRecords.length; i++) {
        this.activeClient = this.clientRecords[i];

        var proStatus = true

        // If adding or editing client, make sure client with same name doesnt already exist
        if (!this.activeClient.enabled) {
          var tempClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')

          // If empty spaces
          if (!tempClientName) {
            this.activeClient.name = ''
            this.toasterService.pop('failure', 'Organization name required');
            return false
          }

          var tempCompare = ''
          if (this.clientList.length > 0) {
            for (var p = 0; p < this.clientList.length; p++) {
              // client will be removed if he has no name
              if (!this.clientList[p].name) {
                this.clientList.splice(p, 1);
              }
              tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
              if (tempCompare === tempClientName) {
                if (edit == 1) {
                  if (this.activeClient.uniqueKeyClient !== this.clientList[p].uniqueKeyClient && tempClientName !== this.repeatativeClientName) {
                    proStatus = false
                    break
                  }
                } else {
                  proStatus = false
                  break
                }
              }
            }
          }
          this.repeatativeClientName = ''
        }


        if (status && proStatus) {
          //add required input params for api call
          this.clientRecords[i].enabled = 0;
          this.clientRecords[i].organizationId = parseInt(this.user.user.orgId);
          this.clientRecords[i].uniqueKeyClient = generateUUID(this.user.user.orgId);
          var d = new Date()
          this.clientRecords[i].deviceCreatedDate = d.getTime()
          this.clientRecords[i].modifiedDate = d.getTime()
          //add all addresses in a single object and send it to api to show those all addr in client view mode
          this.clientRecords[i].addressLine1 = this.clientRecords[i].addressLine1 + ' ' + this.clientRecords[i].addressLine2 + ' ' + this.clientRecords[i].addressLine3;
          this.clientRecords[i].name = this.clientRecords[i].name.replace(/ +(?= )/g, '');
          if (this.clientRecords[i].name !== ' ') {
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
                  if (this.clientList) {
                    for (let i = 0; i < this.clientList.length; i++) {
                      this.list = this.clientList[i].name.toLowerCase();
                      if (this.list[i] == OrgName) {
                        this.toasterService.pop('failure', 'Client Already Exists !!!');
                        this.duplicateOrgName = false;
                      }
                    }
                    if (this.duplicateOrgName == true) {
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

          } else {
            this.toasterService.pop('failure', 'Organization name required!');
          }
        } else {
          if (!proStatus) {
            this.toasterService.pop('failure', 'Client name already exists.');
          }
        }
      }
    }

    //product starts  
    if (this.productRecords) {
      for (let i = 0; i < this.productRecords.length; i++) {
        this.activeProduct = this.productRecords[i];
        var proStatus = true
        // If adding or editing product, make sure product with same name doesnt exist
        if (this.activeProduct.prodName) {    
          var tempProName = this.activeProduct.prodName.toLowerCase().replace(/ /g, '')
          var tempCompare = ''
          for (var p = 0; p < this.productList.length; p++) {
            // for (let i = 0; i < this.productList.length; i++) {
            //   if (!this.productList[i].prodName) {
            //     this.productList.splice(i,1);
            //   }
            //   var tempProduct = this.productList[i].prodName.toLowerCase().replace(/\s/g, "")
            //   if (tempProduct === "") {
            //     this.productList.splice(i,1);
            //   }
            // }
            if(this.productList[p].prodName){
            tempCompare = this.productList[p].prodName.toLowerCase().replace(/ /g, '')
            }
            // If Name is same,
            if (tempCompare === tempProName) {
              // Case 1: Edit mode -> diff uniqueKey
              // Case 2: Add mode
              if (edit == 1) {
                if (this.activeProduct.uniqueKeyProduct !== this.productList[p].uniqueKeyProduct && tempProName !== this.repeatativeProductName) {
                  proStatus = false
                  break
                }
              } else {
                proStatus = false
                break
              }
            }else{
              var proStatus = true
            }
          }
          this.repeatativeProductName = ''
        }
        else{
          
          status = false
        }

        if (status && proStatus) {
          //add required input params for api call
          this.productRecords[i].serverOrgId = parseInt(this.user.user.orgId);
          this.productRecords[i].uniqueKeyProduct = generateUUID(this.user.user.orgId);
          var d = new Date()
          this.productRecords[i].modifiedDate = d.getTime()
          this.productRecords[i].inventoryEnabled = this.productRecords[i].inventoryEnabled ? 1 : 0;
          if(this.productRecords[i].prodName){
          this.productRecords[i].prodName = this.productRecords[i].prodName.replace(/ /g, '');
          }
          if (this.productRecords[i].prodName !== ' ') {
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
          } else {
            this.toasterService.pop('failure', 'Product name required!');
          }
        } else {
          if (!proStatus) {
            this.toasterService.pop('failure', 'Product name already exists.');
          }
          else if(!status){
            this.toasterService.pop('failure', 'Product Name Required');
          }
        }
      }
    }
  }
  remove(index) {
    this.clientRecords.splice(index, 1);
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

  productRemove(index) {
    this.productRecords.splice(index, 1);
  }

}
