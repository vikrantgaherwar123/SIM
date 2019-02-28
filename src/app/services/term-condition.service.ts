import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class TermConditionService {

  private fetchUrl = ''
  private addUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS) {
    this.fetchUrl = `${CONST.BASE_URL}terms-and-condition/pull/terms`
    this.addUrl = `${CONST.BASE_URL}terms-and-condition/add`

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

  add(termCondition) {
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

    return this.http.post(this.addUrl, termCondition, headers)
  }

  changeKeysForInvoiceApi(terms) {
    return {
      organization_id: terms.orgId,
      terms_condition: terms.terms,
      unique_identifier: terms.uniqueKeyTerms,
      _id: terms._id
    }
  }

  changeKeysForApi(terms) {
    return {
      deleted_flag: terms.enabled == 1 ? 1 : undefined,
      device_modified_on: terms.modifiedOn,
      organization_id: terms.orgId,
      set_default: terms.setDefault ? 'DEFAULT' : undefined,
      terms: terms.terms,
      unique_identifier: terms.uniqueKeyTerms
    }
  }

  changeKeysForStore(terms) {
    return {
      createDate: terms.created_on,
      deviceCreateDate: terms.device_modified_on,
      enabled: terms.deleted_flag,
      modifiedDate: terms.modified_on,
      modifiedOn: terms.modified_on,
      orgId: terms.organization_id,
      serverTermCondId: terms._id,
      serverUpdateTime: terms.serverUpdateTime,
      setDefault: terms.set_default,
      terms: terms.terms,
      uniqueKeyTerms: terms.unique_identifier
    }
  }
}
