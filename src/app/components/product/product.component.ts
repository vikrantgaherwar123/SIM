import { Component, OnInit } from '@angular/core'
import { ProductService } from '../../services/product.service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { product } from '../../interface'
import { Store } from '@ngrx/store'
import * as productActions from '../../actions/product.action'
import { AppState } from '../../app.state'

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  private user: {
    user: {
      orgId: string
    },
    setting: any
  }
  productList: product[]
  private activeProduct = <product>{}
  productListLoading: boolean = false
  sortTerm: string
  searchTerm: string
  codeOrSym: string

  isCreate: boolean
  private clearBtn: boolean
  private isEdit: boolean = false
  rightDivBtns: boolean = false
  isEditBtn: boolean = true
  cancle: boolean = true
  deleteBtn: boolean = true
  isBatchBtn: boolean = false

  private tempProduct = null

  productDisplayLimit = 12

  private inputDisabled: boolean
  private inputReadonly: boolean

  constructor(private productService: ProductService,
    private router: Router, private store : Store<AppState>
  ) {
    store.select('product').subscribe(products => this.productList = products.filter(prod => prod.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.codeOrSym = this.user.setting.currencyText ? 'code' : 'symbol'
  }

  ngOnInit() {
    this.productListLoading = true

    if(this.productList.length < 1) {
      this.productService.fetch().subscribe((response: any) => {
        this.productListLoading = false
        if(response.status === 200) {
          this.store.dispatch(new productActions.add(response.records.filter(prod => prod.enabled == 0)))
          this.productList = response.records.filter(prod => prod.enabled == 0)
        }
      })
    } else {
      this.productListLoading = false
    }
  }

  save(status, edit) {
    var proStatus = true

    // If adding or editing product, make sure product with same name doesnt exist
    if(!this.activeProduct.enabled) {
      var tempProName = this.activeProduct.prodName.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      for (var p = 0; p < this.productList.length; p++) {
        tempCompare = this.productList[p].prodName.toLowerCase().replace(/ /g, '')
        // If Name is same,
        if (tempCompare === tempProName) {
          // Case 1: Edit mode -> diff uniqueKey
          // Case 2: Add mode
          if(edit == 1) {
            if(this.activeProduct.uniqueKeyProduct !== this.productList[p].uniqueKeyProduct) {
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

    if (status && proStatus) {
      var d = new Date()
      if (this.activeProduct.uniqueKeyProduct == "") {
        this.activeProduct.uniqueKeyProduct = generateUUID(this.user.user.orgId)
      }
      this.activeProduct.modifiedDate = d.getTime()
      this.activeProduct.serverOrgId = parseInt(this.user.user.orgId)
      this.activeProduct.inventoryEnabled = this.activeProduct.inventoryEnabled ? 1 : 0
      this.productListLoading = true

      var self = this
      this.productService.add([self.productService.changeKeysForApi(this.activeProduct)]).subscribe((response: any) => {
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
          } else {
            if (self.activeProduct.enabled) {   // delete
              self.store.dispatch(new productActions.remove(storeIndex))
              this.productList.splice(index, 1)
            } else {    //edit
              self.store.dispatch(new productActions.edit({storeIndex, value: self.productService.changeKeysForStore(response.productList[0])}))
              this.productList[index] = self.productService.changeKeysForStore(response.productList[0])
            }
          }

          self.activeProduct = <product>{}

          // notifications.showSuccess({ message: result.data.message, hideDelay: 1500, hide: true })
          // this.form.$setUntouched()
          self.isEditBtn = true
          self.isCreate = false
          self.isEdit = false
          self.cancle = true
          self.clearBtn = false
          self.rightDivBtns = false
          self.deleteBtn = true
        } else if (response.status != 200) {
          // notifications.showError({ message: result.error, hideDelay: 1500, hide: true })
        }
        // $('#saveProBtn').button('reset')
        // $('#saveProBtn1').button('reset')
        // $('#updateProBtn').button('reset')
        // $('#updateProBtn1').button('reset')
      })
    } else {
      if(!proStatus) {
        alert('Product with this name already exist!')
      }
      // $('#saveProBtn').button('reset')
      // $('#saveProBtn1').button('reset')
      // $('#updateProBtn').button('reset')
      // $('#updateProBtn1').button('reset')
      // notifications.showError({ message: 'Unable to Save, Product already exist.', hideDelay: 5000, hide: true })
    }
  }

  addNew() {
    this.isBatchBtn = false
    this.activeProduct = <product>{}

    this.isEdit = false
    this.inputDisabled = false
    this.isEditBtn = true
    this.isCreate = false
    this.inputReadonly = false
    this.cancle = true
    this.clearBtn = false
    this.rightDivBtns = false
    this.deleteBtn = true
    $('#prod_name').select()
  }

  deleteProduct() {
    this.activeProduct.enabled = 1
    this.save(true, null)
  }

  editThis() {
    this.isBatchBtn = false
    this.inputReadonly = false
    this.isEditBtn = true
    this.rightDivBtns = false
    this.deleteBtn = true
  }

  viewThis(product, index, cancelFlag) {
    this.isBatchBtn = false

    if (!cancelFlag) {
      this.activeProduct = {...product}
    }

    if (!cancelFlag) {
      this.tempProduct = {
        "id": product.id,
        "prod_name": product.prodName,
        "unit": product.unit,
        "discription": product.discription,
        "rate": product.rate,
        "tax_rate": product.tax_rate,
        "organization_id": product.serverOrgId,
        "inventory_enabled": product.inventoryEnabled,
        "opening_stock": product.openingStock,
        "opening_date": product.openingDate,
        "buy_price": product.buyPrice,
        "productCode": product.productCode,
        "unique_identifier": product.uniqueKeyProduct
      }
      this.tempProduct = this.activeProduct
    } else {
      this.activeProduct = this.tempProduct
    }

    this.isEditBtn = false
    this.inputReadonly = true
    this.isEdit = true
    this.isCreate = true
    this.cancle = false
    this.clearBtn = true
    this.rightDivBtns = true
    this.deleteBtn = false
  }

  cancelThis() {
    this.isEditBtn = false
    this.inputReadonly = true
    this.rightDivBtns = true
    this.deleteBtn = false
    // this.viewThis(this.tempProduct, this.tempIndex, true)
  }

  clearThis() {
    this.activeProduct = <product>{}
  }

  batchUpload() {
    this.router.navigate(['/product/batch/'])
  }

  loadMore() {
    this.productDisplayLimit += 10
  }

  openBatch() {
    this.isBatchBtn = true
    this.isEdit = false
    this.inputDisabled = false
    this.isEditBtn = true
    this.isCreate = true
    this.inputReadonly = false
    this.cancle = true
    this.clearBtn = true
    this.rightDivBtns = true
    this.deleteBtn = true
  }

  closeBatch() {
    $('#batchupload').modal('hide')
  }
}
