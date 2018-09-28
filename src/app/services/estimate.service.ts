import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class EstimateService {

  private fetchUrl = ''
  private addUrl = ''
  private fetchByIdUrl = ''
  private fetchPdfUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) {
    this.fetchUrl = `${CONST.BASE_URL}estimate/pull/quotation`
    this.fetchByIdUrl = `${CONST.BASE_URL}estimate/pull/estimate/byId`
    this.fetchPdfUrl = `${CONST.BASE_URL}pdf/estimate/`
    this.addUrl = `${CONST.BASE_URL}estimate/add-estimate`
    
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

  add(estimate) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, estimate, headers)
  }

  fetchPdf(id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      })
    }

    return this.http.get(`${this.fetchUrl}${id}`, headers)
  }
}
