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
hideToggle: boolean = false
  private user: {
    user: {
      orgId: string
    },
    setting: any
  }
  hideme = []
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
 
  deleteproduct:boolean = true

  productDisplayLimit = 12
  settings: any;
  emptyRate: boolean;
  addProduct: any;
  productOff: string;
  productOn: string;
  

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

    // show more-less button condition depending on height
    jQuery('.expandClicker').each(function(){
      if (jQuery(this).parent().height() < 0) {
        jQuery(this).fadeOut();
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Product');
    this.productListLoading = true

    if(this.productList.length < 1) {
      this.productService.fetch().subscribe((response: any) => {
        this.productListLoading = false
        if(response.status === 200) {
          this.productList = this.removeEmptySpaces(response.records.filter(prod => prod.enabled == 0))
          this.store.dispatch(new productActions.add(this.productList))
          
          //sort in ascending
          this.sortByNameRate(this.productList);
        }
      },error => this.openErrorModal())
    } else {
      this.removeEmptySpaces(this.productList)
      //sort in ascending
      this.sortByNameRate(this.productList);
      this.productListLoading = false
    }
  }

  sortByNameRate(value){
    if(value == 'prodName'){
      this.productList.sort(function (a, b) {
        var textA = a.prodName.toUpperCase();
        var textB = b.prodName.toUpperCase();
        return textA.localeCompare(textB);
      });
    }
    else if(value == 'rate'){
      this.productList.sort(function (a, b) {
        var textA = a.prodName.toUpperCase();
        var textB = b.prodName.toUpperCase();
        if(a.rate > b.rate){
          return textA.localeCompare(textB);
        }
      });
    }
    this.productList.sort(function (a, b) {
      var textA = a.prodName.toUpperCase();
      var textB = b.prodName.toUpperCase();
      return textA.localeCompare(textB);
    });
  }

  removeEmptySpaces(data){
    //remove whitespaces from clientlist
    for (let i = 0; i < data.length; i++) {
      if (data[i].prodName === undefined) {
        data.splice(i, 1);
      }
      if (data[i].prodName) {
        var tempClient = data[i].prodName.toLowerCase().replace(/\s/g, "");
        if (tempClient === "") {
          data.splice(i, 1);
        }
      }else if(!data[i].prodName){
        data.splice(i, 1);
      }
    }
    return data
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
    if(this.activeProduct.prodName && !this.addProduct) {                   //condition was !this.activeProduct.enabled changed by Vikrant
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
          this.emptyProduct = true;
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
            this.toasterService.pop('success', 'Product added successfully !!!');
            this.closeItemModel()
          } else {
            if (self.activeProduct.enabled) {   // delete
              self.store.dispatch(new productActions.remove(storeIndex))
              this.productList.splice(index, 1)
              this.activeProduct = this.productList[0]
              this.toasterService.pop('success','Product deleted successfully !');
              this.closeItemModel()
             
            } else {    //edit
              self.store.dispatch(new productActions.edit({index: storeIndex, value: self.productService.changeKeysForStore(response.productList[0])}))
              this.productList[index] = self.productService.changeKeysForStore(response.productList[0])
              this.toasterService.pop('success','Product Edited Successfully !!!');
              this.closeItemModel()
              // this.ngOnInit();
            }
          }
        } else if (response.status != 200) {
        }
       
      },error => this.openErrorModal())
    } else {
      if(!proStatus) {
        this.toasterService.pop('failure','Product with this name already exists');
      }
      
    }
  }

  productOnHover(){
    this.productOn = "assets/images/product_box_grey.png";
  }
  productOffHover(){
    this.productOff = "assets/images/product_box_blue.png";
  }

  addNew() {
    this.addProduct = true;
    this.activeProduct = <product>{}
    $('#prod_name').select()
  }

  openDeleteProductModal(product) {
    this.activeProduct = product
    $('#delete-product').modal('show')
    $('#delete-product').on('shown.bs.modal', (e) => {
      // $('#delete-product input[type="text"]')[1].focus()
    })
  }


  deleteProduct() {
    this.addProduct = true
    this.activeProduct.enabled = 1
    this.save(true, null)
  }

  emptyField(input){
    if(input.target.value !== ''){
      this.emptyProduct = false
      this.emptyRate = false;
    }
  }

  editThis(product) {
    this.addProduct = true;
    this.activeProduct = product;
    if(this.productList.filter((prod => prod.prodName === this.activeProduct.prodName)).length > 1) {
      this.repeatativeProductName = this.activeProduct.prodName.toLowerCase().replace(/ /g, '')
    }
    this.editProductModal();
  }

  cancelThis() {
    this.activeProduct = {...this.productList.filter(prod => prod.uniqueKeyProduct == this.activeProduct.uniqueKeyProduct)[0]}
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
    this.editMode = false;
    this.createMode = true;
    this.activeProduct = <product>{}
    $('#add-product').modal('show')
    $('#add-product').on('shown.bs.modal', (e) => {
    })
  }
  closeItemModel() {
    $('#add-product').modal('hide')
  }
  editProductModal() {
    this.editMode = true;
    this.createMode = false;
    $('#add-product').modal('show')
    $('#add-product').on('shown.bs.modal', (e) => {
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
