import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private fetchUrl = ''
  private addUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS) { 
    this.fetchUrl = `${CONST.BASE_URL}product/pull/product`
    this.addUrl = `${CONST.BASE_URL}product/add-products`
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  }

  fetch() {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token ? this.user.access_token : JSON.parse(localStorage.getItem('user')).access_token,
        "lastEpoch": '0'
      })
    }

    return this.http.get(this.fetchUrl, headers)
  }

  add(product) {
    //after login access token comes undefined so we've get it here
    if(this.user.access_token === undefined){
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
      }
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, product, headers)
  }

  changeKeysForApi(product) {
    return {
      buy_price: product.buyPrice,
      deleted_flag: product.enabled,
      device_modified_on: product.modifiedDate,
      discription: product.discription,
      inventory_enabled: product.inventoryEnabled,
      opening_stock: product.openingStock,
      organization_id: product.serverOrgId,
      prod_name: product.prodName,
      productCode: product.productCode,
      rate: product.rate,
      tax_rate: product.taxRate,
      unique_identifier: product.uniqueKeyProduct,
      unit: product.unit
    }
  }

  changeKeysForStore(product) {
    return {
      buyPrice: product.buy_price,
      deviceCreatedDate: product.device_modified_on,
      discription: product.discription,
      enabled: product.deleted_flag,
      inventoryEnabled: product.inventory_enabled,
      modifiedDate: product.device_modified_on,
      openingDate: product.opening_date,
      openingStock: product.opening_stock,
      prodLocalId: product._id,
      prodName: product.prod_name,
      productCode: product.productCode,
      rate: product.rate,
      remainingStock: product.remaining_stock,
      serverOrgId: product.organization_id,
      serverUpdateTime: product.serverUpdateTime,
      taxRate: product.tax_rate,
      uniqueKeyProduct: product.unique_identifier,
      unit: product.unit
    }
  }
}
