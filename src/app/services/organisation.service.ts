import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  private fetchUrl = ''
  private addUrl = ''
  private imgUploadUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS) { 
    this.fetchUrl = `${CONST.BASE_URL}pull/organization`
    this.addUrl = `${CONST.BASE_URL}add/org`
    this.imgUploadUrl = `${CONST.BASE_URL}images/upload/`

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

  add(org) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token,
        "lastEpoch": '0'
      })
    }

    return this.http.post(this.addUrl, org, headers)
  }

  imgUpload(type, formData) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(`${this.imgUploadUrl}${type}`, formData, headers)
  }

}
