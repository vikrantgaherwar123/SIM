import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

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

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) {
    this.fetchUrl = `${CONST.BASE_URL}terms-and-condition/pull/terms`
    this.addUrl = `${CONST.BASE_URL}terms-and-condition/add`

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

  add(termCondition) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, termCondition, headers)
  }

  changeKeysForApi(terms) {
    return {
      unique_identifier: terms.uniqueKeyTerms,
      organization_id: terms.orgId,
      terms: terms.terms,
      device_modified_on: terms.deviceModifiedOn,
      set_default: terms.setDefault ? 'DEFAULT' : undefined
    }
  }

  changeKeysForStore(terms) {
    return {
      createDate: terms.created_on,
      enabled: terms.deleted_flag,
      deviceCreateDate: terms.device_modified_on,
      modifiedOn: terms.modified_on,
      modifiedDate: terms.modified_on,
      orgId: terms.organization_id,
      serverTermCondId: terms._id,
      serverUpdateTime: terms.serverUpdateTime,
      setDefault: terms.set_default,
      terms: terms.terms,
      uniqueKeyTerms: terms.unique_identifier
    }
  }
}
