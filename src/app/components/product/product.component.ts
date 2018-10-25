import { Component, OnInit } from '@angular/core'
import { ProductService } from '../../services/product.service'
import { CookieService } from 'ngx-cookie-service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { product, response } from '../../interface'
import { Observable } from 'rxjs'
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
    }
  }
  private productList: Observable<product[]>
  private activeProduct = {
    "prod_name": "",
    "unit": "",
    "discription": "",
    "rate": 0.01,
    "tax_rate": 0,
    "device_modified_on": 112,
    "unique_identifier": ""
  }
  private openingDate: string = ""

  private checked: boolean = false
  private selectedProduct = null
  private isCreate: boolean
  private clearBtn: boolean
  private isEdit: boolean = false
  private rightDivBtns: boolean = false
  private isEditBtn: boolean = true
  private cancle: boolean = true
  private deleteBtn: boolean = true
  private isBatchBtn: boolean = false

  private productListLoading: boolean = false

  private tempProduct = null
  private tempIndex = null

  private productDisplayLimit = 12

  private inputDisabled: boolean
  private inputReadonly: boolean

  constructor(private productService: ProductService, private cookie: CookieService,
    private router: Router, private store : Store<AppState>
  ) {
    this.productList = store.select('product')
    this.user = JSON.parse(this.cookie.get('user'))
  }

  ngOnInit() {
    this.productListLoading = true

    this.productList.subscribe(products => {
      if(products.length < 1) {
        this.productService.fetch().subscribe((response: response) => {
          this.productListLoading = false
          if(response.status === 200) {
            this.store.dispatch(new productActions.add(response.records.filter(prod => prod.enabled == 0)))
          }
        })
      } else {
        this.productListLoading = false
      }
    })
  }

  toggle() {
    this.checked = !this.checked
  }

  // init() {
  //   var data = [
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //     ["", "", "", "", "", ""],
  //   ]

  //   var container = document.getElementById('example')
  //   var hot = new Handsontable(container, {
  //     data: data,
  //     width: 537,
  //     height: 200,
  //     stretchH: 'all',
  //     rowHeaders: true,
  //     colHeaders: true
  //   })
  //   hot.updateSettings({
  //     colHeaders: ['Product Name', 'Product Code', 'unit', 'Description', 'Rate', 'Tax Rate']
  //   })
  //   var X = XLSX
  //   var XW = {
  //     /* worker message */
  //     msg: 'xlsx',
  //     /* worker scripts */
  //     worker: '/assets/js/batch-upload/xlsxworker.js'
  //   }

  //   var global_wb

  //   var process_wb = (function () {
  //     var OUT = document.getElementById('out')
  //     var HTMLOUT = document.getElementById('htmlout')

  //     var get_format = (function () {
  //       var radios = document.getElementsByName("format")
  //       return function () {
  //         for (var i = 0; i < radios.length; ++i) if (radios[i].checked || radios.length === 1) return radios[i].value
  //       }
  //     })()

  //     var to_json  = (workbook)=>{
  //       var result = {}
  //       workbook.SheetNames.forEach(function (sheetName) {
  //         var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
  //         if (roa.length) result[sheetName] = roa
  //       })
  //       data = result.Sheet1
  //       hot.loadData(data)
  //       return JSON.stringify(result, 2, 2)
  //     }

  //     var to_csv = (workbook)=>{
  //       var result = []
  //       workbook.SheetNames.forEach(function (sheetName) {
  //         var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName])
  //         if (csv.length) {
  //           result.push("SHEET: " + sheetName)
  //           result.push("")
  //           result.push(csv)
  //         }
  //       })
  //       return result.join("\n")
  //     }

  //     var to_fmla = (workbook)=>{
  //       var result = []
  //       workbook.SheetNames.forEach(function (sheetName) {
  //         var formulae = X.utils.get_formulae(workbook.Sheets[sheetName])
  //         if (formulae.length) {
  //           result.push("SHEET: " + sheetName)
  //           result.push("")
  //           result.push(formulae.join("\n"))
  //         }
  //       })
  //       return result.join("\n")
  //     }

  //     var to_html = (workbook)=>{
  //       HTMLOUT.innerHTML = ""
  //       workbook.SheetNames.forEach(function (sheetName) {
  //         var htmlstr = X.write(workbook, { sheet: sheetName, type: 'string', bookType: 'html' })
  //         HTMLOUT.innerHTML += htmlstr
  //       })
  //       return ""
  //     }

  //     return function process_wb(wb) {
  //       global_wb = wb
  //       var output = ""
  //       switch ('json') {
  //         case "form": output = to_fmla(wb) break
  //         case "html": output = to_html(wb) break
  //         case "json": output = to_json(wb) break
  //         default: output = to_csv(wb)
  //       }
  //     }
  //   })()

  //   var setfmt = window.setfmt = function setfmt() { if (global_wb) process_wb(global_wb) }

  //   var b64it = window.b64it = (function () {
  //     var tarea = document.getElementById('b64data')
  //     return function b64it() {
  //       if (typeof console !== 'undefined') console.log("onload", new Date())
  //       var wb = X.read(tarea.value, { type: 'base64', WTF: false })
  //       process_wb(wb)
  //     }
  //   })()

  //   var do_file = (function () {
  //     var rABS = typeof FileReader !== "undefined" && (FileReader.prototype || {}).readAsBinaryString
  //     var domrabs = { 'checked': true }
  //     if (!rABS) domrabs.disabled = !(domrabs.checked = false)

  //     var use_worker = typeof Worker !== 'undefined'
  //     var domwork = { 'checked': true }
  //     if (!use_worker) domwork.disabled = !(domwork.checked = false)

  //     var xw = function xw(data, cb) {
  //       var worker = new Worker(XW.worker)
  //       worker.onmessage = function (e) {
  //         switch (e.data.t) {
  //           case 'ready': break
  //           case 'e': console.error(e.data.d) break
  //           case XW.msg: cb(JSON.parse(e.data.d)) break
  //         }
  //       }
  //       worker.postMessage({ d: data, b: rABS ? 'binary' : 'array' })
  //     }

  //     return function do_file(files) {
  //       rABS = domrabs.checked
  //       use_worker = domwork.checked
  //       var f = files[0]
  //       var reader = new FileReader()
  //       reader.onload = function (e) {
  //         if (typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker)
  //         var data = e.target.result
  //         if (!rABS) data = new Uint8Array(data)
  //         if (use_worker) xw(data, process_wb)
  //         else process_wb(X.read(data, { type: rABS ? 'binary' : 'array' }))
  //       }
  //       if (rABS) reader.readAsBinaryString(f)
  //       else reader.readAsArrayBuffer(f)
  //     }
  //   })()

  //   (function () {
  //     var drop = document.getElementById('drop')
  //     if (!drop.addEventListener) return

  //     function handleDrop(e) {
  //       e.stopPropagation()
  //       e.preventDefault()
  //       do_file(e.dataTransfer.files)
  //     }

  //     function handleDragover(e) {
  //       e.stopPropagation()
  //       e.preventDefault()
  //       e.dataTransfer.dropEffect = 'copy'
  //     }

  //     drop.addEventListener('dragenter', handleDragover, false)
  //     drop.addEventListener('dragover', handleDragover, false)
  //     drop.addEventListener('drop', handleDrop, false)
  //   })()

  //   (function () {
  //     var xlf = document.getElementById('xlf')
  //     if (!xlf.addEventListener) return
  //     function handleFile(e) { do_file(e.target.files) }
  //     xlf.addEventListener('change', handleFile, false)
  //   })()
  //   var _gaq = _gaq || []
  //   _gaq.push(['_setAccount', 'UA-36810333-1'])
  //   _gaq.push(['_trackPageview'])

  //   (function () {
  //     var ga = document.createElement('script') ga.type = 'text/javascript' ga.async = true
  //     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'
  //     var s = document.getElementsByTagName('script')[0] s.parentNode.insertBefore(ga, s)
  //   })()

  //   $rootScope.pro_bar_load = false
  //   this.productListsLoader = false
  //   var baseURL = Data.getBaseUrl()
  //   var date = new Date()
  //   this.activeProduct.opening_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)


  //   ValidateInventoryField() {
  //     if (this.activeProduct.inventory_enabled == 0) {
  //       this.minInput = 0
  //       // this.activeProduct.buy_price = 0
  //       // notifications.showError({message:"Opening Date , stock and buy price must Be required"})
  //       // this.form.$setUntouched()

  //     } else {
  //       this.minInput = 0.01
  //       this.activeProduct.opening_stock = 0.01
  //       this.activeProduct.buy_price = 0.01
  //       this.activeProduct.opening_date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)

  //     }
  //   }


  // }

  save(data, status, edit) {
    var proStatus = true
    if (edit == 1) {
      // $('#updateProBtn').button('loading')
      // $('#updateProBtn1').button('loading')
      var tempProName = this.activeProduct.prod_name.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      this.productList.subscribe(products => {
        for (var p = 0; p < products.length; p++) {
          tempCompare = products[p].prodName.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempProName) {
            proStatus = false
            break
          }
        }
      })
    } else if (edit == 2) {
      var tempProName = this.activeProduct.prod_name.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      this.productList.subscribe(products => {
        for (var p = 0; p < products.length; p++) {
          tempCompare = products[p].prodName.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempProName) {
            proStatus = false
            break
          }
        }
      })
    } else {
      proStatus = true
    }
    if (status && proStatus) {
      var d = new Date()
      if (this.activeProduct.unique_identifier == "") {
        this.activeProduct.unique_identifier = generateUUID(this.user.user.orgId)
      }
      this.activeProduct.device_modified_on = d.getTime()
      // this.activeProduct.organization_id = this.user.user.orgId
      // this.activeProduct.inventory_enabled = this.activeProduct.inventory_enabled ? 1 : 0
      // this.productListsLoader = false

      var self = this
      this.productService.add([this.activeProduct]).subscribe(function (result: response) {
        if (result.status === 200) {

          self.activeProduct.unique_identifier = "",
          self.activeProduct.prod_name = "",
          self.activeProduct.unit = "",
          self.activeProduct.discription = "",
          self.activeProduct.rate = 0.01,
          self.activeProduct.tax_rate = 0

          // notifications.showSuccess({ message: result.data.message, hideDelay: 1500, hide: true })
          // this.form.$setUntouched()
          self.selectedProduct = null
          self.isEditBtn = true
          self.isCreate = false
          self.isEdit = false
          self.cancle = true
          self.clearBtn = false
          self.rightDivBtns = false
          self.deleteBtn = true

          // Implement SMS add, edit or delete depending on edit flag
          // self.productService.fetch().subscribe(function (response: response) {
          //   // self.productListsLoader = true
          //   // self.productList = response.records

          //   self.productList = self.productList.filter(function (pro) {
          //     return (pro.enabled == 0)
          //   })
          // })
          self.selectedProduct = 'none'
        } else if (result.status != 200) {
          this.selectedProduct = 'none'
          // notifications.showError({ message: result.error, hideDelay: 1500, hide: true })
        }
        // $('#saveProBtn').button('reset')
        // $('#saveProBtn1').button('reset')
        // $('#updateProBtn').button('reset')
        // $('#updateProBtn1').button('reset')
      })
    } else {
      // $('#saveProBtn').button('reset')
      // $('#saveProBtn1').button('reset')
      // $('#updateProBtn').button('reset')
      // $('#updateProBtn1').button('reset')
      // notifications.showError({ message: 'Unable to Save, Product already exist.', hideDelay: 5000, hide: true })
    }
  }

  addNew() {
    this.isBatchBtn = false
    this.activeProduct.unique_identifier = "",
    this.activeProduct.rate = 0.01,
    this.activeProduct.tax_rate = 0

    this.isEdit = false
    this.selectedProduct = null
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

  // deleteProduct(product) {
  //   this.filterProduct = {prodName: ''}

  //   this.activeProduct.deleted_flag = 1
  //   this.save(this.data, true, null)
  //   this.addNew()

  //   // SweetAlert.swal({
  //   //   title: "Are you sure want to delete Product ?", //Bold text
  //   //   type: "warning", //type -- adds appropiriate icon
  //   //   showCancelButton: true, // displays cancel btton
  //   //   confirmButtonColor: "#DD6B55",
  //   //   confirmButtonText: "Yes, delete it!",
  //   //   closeOnConfirm: true, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
  //   //   closeOnCancel: true
  //   // })
  // }

  editThis(product) {
    this.isBatchBtn = false
    this.inputReadonly = false
    this.isEditBtn = true
    this.rightDivBtns = false
    this.deleteBtn = true
  }

  // viewThis(product, index, cancelFlag) {
  //   this.isBatchBtn = false
  //   this.filterProduct = {prodName: ''}
  //   if (!cancelFlag) {
  //     this.activeProduct.id = product.id,
  //     this.activeProduct.prod_name = product.prodName,
  //     this.activeProduct.unit = product.unit,
  //     this.activeProduct.discription = product.discription,
  //     this.activeProduct.rate = product.rate,
  //     this.activeProduct.tax_rate = product.taxRate,
  //     this.activeProduct.organization_id = product.serverOrgId,
  //     this.activeProduct.inventory_enabled = product.inventoryEnabled,
  //     this.activeProduct.opening_stock = product.openingStock,
  //     this.activeProduct.opening_date = product.openingDate,
  //     this.activeProduct.buy_price = product.buyPrice,
  //     this.activeProduct.productCode = product.productCode,
  //     this.activeProduct.unique_identifier = product.uniqueKeyProduct
  //   }
  //   this.selectedProduct = index

  //   if (!cancelFlag) {
  //     this.tempProduct = {
  //       "id": product.id,
  //       "prod_name": product.prod_name,
  //       "unit": product.unit,
  //       "discription": product.discription,
  //       "rate": product.rate,
  //       "tax_rate": product.tax_rate,
  //       "organization_id": product.serverOrgId,
  //       "inventory_enabled": product.inventoryEnabled,
  //       "opening_stock": product.openingStock,
  //       "opening_date": product.openingDate,
  //       "buy_price": product.buyPrice,
  //       "productCode": product.productCode,
  //       "unique_identifier": product.uniqueKeyProduct
  //     }
  //     this.tempProduct = this.activeProduct
  //   } else {
  //     this.activeProduct = this.tempProduct
  //   }
  //   this.tempIndex = index
  //   this.isEditBtn = false
  //   this.inputReadonly = true
  //   this.isEdit = true
  //   this.isCreate = true
  //   this.cancle = false
  //   this.clearBtn = true
  //   this.rightDivBtns = true
  //   this.deleteBtn = false
  // }

  cancelThis() {
    this.isEditBtn = false
    this.inputReadonly = true
    this.rightDivBtns = true
    this.deleteBtn = false
    // this.viewThis(this.tempProduct, this.tempIndex, true)
  }

  // clearThis() {
  //   this.activeProduct.prod_name = ""
  //   this.activeProduct.productCode = ""
  //   this.activeProduct.unit = ""
  //   this.activeProduct.discription = ""
  //   this.activeProduct.rate = 0.01
  //   this.activeProduct.tax_rate = 0
  //   this.activeProduct.inventory_enabled = 0
  //   this.activeProduct.opening_stock = 0
  //   this.activeProduct.opening_date = 0
  //   this.activeProduct.buy_price = 0

  //   $('#prod_name').val("")
  // }

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
