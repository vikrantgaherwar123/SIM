import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private fetchUrl = ''
  private fetchByIdUrl = ''
  private addUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}client/pull/client`
    this.fetchByIdUrl = `${CONST.BASE_URL}client/pull/client`
    this.addUrl = `${CONST.BASE_URL}client/add-clients`

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

  fetchById(id) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.fetchByIdUrl, id, headers)
  }

  add(client) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, client, headers)
  }

  changeKeys(client) {
    var tempClient = {
      name: client.name,
      contact_person_name: client.contactPersonName,
      email: client.email,
      number: client.number,
      address_line1: client.addressLine1,
      shipping_address: client.shippingAddress,
      business_detail: client.businessDetail,
      business_id: client.businessId,
      unique_identifier: client.uniqueKeyClient,
      deleted_flag: client.enabled
    }

    return tempClient
  }
}
