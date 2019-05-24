import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private fetchUrl = ''
  private fetchByIdUrl = ''
  private addUrl = ''
  private user: {
    access_token: string,
    user: {
      orgId: number
    }
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS) { 
    this.fetchUrl = `${CONST.BASE_URL}client/pull/client`
    this.fetchByIdUrl = `${CONST.BASE_URL}client/pull/client`
    this.addUrl = `${CONST.BASE_URL}client/add-clients`
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

    return this.http.post(this.addUrl, client, headers)
  }

  changeKeysForApi(client) {
    return {
      address_line1: client.addressLine1,
      business_detail: client.businessDetail,
      business_id: client.businessId,
      contact_person_name: client.contactPersonName,
      deleted_flag: client.enabled,
      device_modified_on: client.modifiedDate,
      email: client.email,
      epoch : 0,
      name: client.name,
      organization_id: client.organizationId,
      number: client.number,
      shipping_address: client.shippingAddress,
      unique_identifier: client.uniqueKeyClient,
    }
  }

  changeKeysForStore(client) {
    return {
      addressLine1: client.address_line1,
      addressLine2: client.address_line2,
      addressLine3: client.address_line3,
      businessDetail: client.business_detail,
      businessId: client.business_id,
      contactPersonName: client.contact_person_name,
      deviceCreatedDate: 0,
      epoch : 0,
      email: client.email,
      enabled: client.deleted_flag,
      localClientid: client._id,
      modifiedDate: client.device_modified_on,
      name: client.name,
      number: client.number,
      organizationId: client.organization_id,
      serverUpdateTime: client.serverUpdateTime,
      shippingAddress: client.shipping_address,
      uniqueKeyClient: client.unique_identifier
    }
  }
}
