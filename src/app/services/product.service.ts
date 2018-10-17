import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

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

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}product/pull/product`
    this.addUrl = `${CONST.BASE_URL}product/add-products`
    this.user = this.cookie.get('user') ? JSON.parse(this.cookie.get('user')) : {}
  }

  fetch() {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token ? this.user.access_token : JSON.parse(this.cookie.get('user')).access_token,
        "lastEpoch": '0'
      })
    }

    return this.http.get(this.fetchUrl, headers)
  }

  add(product) {
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
      prod_name: product.prodName,
      unit: product.unit,
      discription: product.discription,
      rate: product.rate,
      tax_rate: product.taxRate,
      device_modified_on: product.modifiedDate,
      unique_identifier: product.productuniqueKeyProduct
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
