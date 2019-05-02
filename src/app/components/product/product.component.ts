import { Component, OnInit, Input } from '@angular/core'
import { ProductService } from '../../services/product.service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { product } from '../../interface'
import { Store } from '@ngrx/store'
import * as productActions from '../../actions/product.action'
import { AppState } from '../../app.state'
import {ToasterService} from 'angular2-toaster';
import { SettingService } from '../../services/setting.service'
import { Title }     from '@angular/platform-browser';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit { 
@Input()
multi: boolean
  private user: {
    user: {
      orgId: string
    },
    setting: any
  }
  productList: product[]
  public activeProduct = <product>{}
  productListLoading: boolean = false
  sortTerm: string
  searchTerm: string
  codeOrSym: string
  repeatativeProductName: string = ''
  emptyProduct: boolean;

  createMode: boolean = true
  editMode: boolean = false
  viewMode: boolean = false
  deleteproduct:boolean = false

  productDisplayLimit = 12
  settings: any;
  emptyRate: boolean;
  

  constructor(private productService: ProductService,
    public toasterService : ToasterService,
    private router: Router, private store : Store<AppState>,
    private titleService: Title
  ) {
    this.toasterService = toasterService;
    store.select('product').subscribe(products => this.productList = products.filter(prod => prod.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    this.codeOrSym = this.user.setting.currencyText ? 'code' : 'symbol'
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Product');
    this.productListLoading = true

    if(this.productList.length < 1) {
      this.productService.fetch().subscribe((response: any) => {
        this.productListLoading = false
        if(response.status === 200) {
          this.store.dispatch(new productActions.add(response.records.filter(prod => prod.enabled == 0)))
          this.productList = response.records.filter(prod => prod.enabled == 0)
        }
      },error => this.openErrorModal())
    } else {
      this.productListLoading = false
    }
  }

  save(status, edit) {
    var proStatus = true
    //prod & rate field validation
    if(this.activeProduct.prodName == undefined){
      this.emptyProduct = true
    }
    if(this.activeProduct.rate == undefined){
      this.emptyRate = true;
    }
    // If adding or editing product, make sure product with same name doesnt exist
    if(this.activeProduct.prodName) {                   //condition was !this.activeProduct.enabled changed by Vikrant
      var tempProName = this.activeProduct.prodName.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      for (var p = 0; p < this.productList.length; p++) {
        if(this.productList[p].prodName){
        tempCompare = this.productList[p].prodName.toLowerCase().replace(/ /g, '')
        }
        // If Name is same,
        if (tempCompare === tempProName) {
          // Case 1: Edit mode -> diff uniqueKey
          // Case 2: Add mode

          //edit=1: case of editing
          //edit=null: case of deleting
          //edit=0: case of adding duplicate
          if(edit == 1) {
            if(this.activeProduct.uniqueKeyProduct !== this.productList[p].uniqueKeyProduct && tempProName !== this.repeatativeProductName) {
              proStatus = false
              break
            }
          } 
          if(edit == null) {
              proStatus = true
              break
          } 
          if(edit == 0) {
            proStatus = false
            break
        } 
        }
      }
      this.repeatativeProductName = ''
    }

    if (status && proStatus) {
      var d = new Date()
      if (!this.activeProduct.uniqueKeyProduct) {
        this.activeProduct.uniqueKeyProduct = generateUUID(this.user.user.orgId)
      }
      this.activeProduct.modifiedDate = d.getTime()
      this.activeProduct.serverOrgId = parseInt(this.user.user.orgId)
      this.activeProduct.inventoryEnabled = this.activeProduct.inventoryEnabled ? 1 : 0
      this.productListLoading = true

      var self = this

      this.productService.add([this.productService.changeKeysForApi(this.activeProduct)]).subscribe((response: any) => {
        self.productListLoading = false

        if (response.status === 200) {
          // Update store and product list
          let index, storeIndex
          index = self.productList.findIndex(pro => pro.uniqueKeyProduct == response.productList[0].unique_identifier)
          self.store.select('product').subscribe(prods => {
            storeIndex = prods.findIndex(prs => prs.uniqueKeyProduct == response.productList[0].unique_identifier)
          })

          if (index == -1) {  // add
            self.store.dispatch(new productActions.add([self.productService.changeKeysForStore(response.productList[0])]))
            this.productList.push(self.productService.changeKeysForStore(response.productList[0]))
            this.viewThis(self.productService.changeKeysForStore(response.productList[0]), false)
            this.toasterService.pop('success', 'Product added successfully !!!');
            // this.ngOnInit();
          } else {
            if (self.activeProduct.enabled) {   // delete
              self.store.dispatch(new productActions.remove(storeIndex))
              this.productList.splice(index, 1)
              this.activeProduct = this.productList[0]
              this.addNew()
              this.toasterService.pop('success','Product deleted successfully !');
              // this.ngOnInit();
              // window.location.reload(true);
            } else {    //edit
              self.store.dispatch(new productActions.edit({index: storeIndex, value: self.productService.changeKeysForStore(response.productList[0])}))
              this.productList[index] = self.productService.changeKeysForStore(response.productList[0])
              this.viewThis(this.productList[index], false)
              this.toasterService.pop('success','Product Edited Successfully !!!');
              // this.ngOnInit();
            }
          }
        } else if (response.status != 200) {
          // notifications.showError({ message: result.error, hideDelay: 1500, hide: true })
        }
        // $('#saveProBtn').button('reset')
        // $('#saveProBtn1').button('reset')
        // $('#updateProBtn').button('reset')
        // $('#updateProBtn1').button('reset')
      },error => this.openErrorModal())
    } else {
      if(!proStatus) {
        this.toasterService.pop('failure','Product with this name already exists');
      }
      // else if(){}
      // $('#saveProBtn').button('reset')
      // $('#saveProBtn1').button('reset')
      // $('#updateProBtn').button('reset')
      // $('#updateProBtn1').button('reset')
      // notifications.showError({ message: 'Unable to Save, Product already exist.', hideDelay: 5000, hide: true })
    }
  }

  addNew() {
    this.activeProduct = <product>{}
    this.createMode = true
    this.editMode = false
    this.viewMode = false
    $('#prod_name').select()
  }

  openDeleteProductModal() {
    this.deleteproduct = true
    $('#delete-product').modal('show')
    $('#delete-product').on('shown.bs.modal', (e) => {
      // $('#delete-product input[type="text"]')[1].focus()
    })
  }


  deleteProduct() {
    this.activeProduct.enabled = 1
    this.save(true, null)
    this.deleteproduct = false
  }

  emptyField(input){
    if(input.target.value !== ''){
      this.emptyProduct = false
      this.emptyRate = false;
    }
  }

  editThis() {
    if(this.productList.filter((prod => prod.prodName === this.activeProduct.prodName)).length > 1) {
      this.repeatativeProductName = this.activeProduct.prodName.toLowerCase().replace(/ /g, '')
    }

    this.createMode = false
    this.editMode = true
    this.viewMode = false
  }

  viewThis(product, cancelFlag) {
    if (!cancelFlag) {
      this.activeProduct = {...product}
    }

    this.createMode = false
    this.editMode = false
    this.viewMode = true
  }

  cancelThis() {
    this.activeProduct = {...this.productList.filter(prod => prod.uniqueKeyProduct == this.activeProduct.uniqueKeyProduct)[0]}

    this.createMode = false
    this.editMode = false
    this.viewMode = true
  }

  clearThis() {
    this.activeProduct = <product>{}
  }

  batchUpload() {
    this.router.navigate(['/product/batch/'])
  }

  // error modal
  openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }
  addProductModal() {
    $('#add-product').modal('show')
    $('#add-product').on('shown.bs.modal', (e) => {
    })
  }
  closeItemModel() {
    $('#add-product').modal('hide')
  }
  editProductModal() {
    $('#edit-product').modal('show')
    $('#edit-product').on('shown.bs.modal', (e) => {
    })
  }
  closeEditProductModel() {
    $('#edit-product').modal('hide')
  }

  loadMore() {
    this.productDisplayLimit += 10
  }

  closeBatch() {
    $('#batchupload').modal('hide')
  }
}
