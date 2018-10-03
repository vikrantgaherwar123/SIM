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
        "accessToken": this.user.access_token,
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
    var tempProduct = {
      prod_name: product.prodName,
      unit: product.unit,
      discription: product.discription,
      rate: product.rate,
      tax_rate: product.taxRate,
      device_modified_on: product.modifiedDate,
      unique_identifier: product.productuniqueKeyProduct
    }

    return tempProduct
  }

  changeKeysForStore(product) {
    var tempProduct = {
      prodName: product.prod_name,
      unit: product.unit,
      discription: product.discription,
      rate: product.rate,
      taxRate: product.tax_rate,
      modifiedDate: product.device_modified_on,
      productuniqueKeyProduct: product.unique_identifier
    }

    return tempProduct
  }
}
