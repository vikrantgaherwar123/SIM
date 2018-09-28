import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private fetchUrl = ''
  private fetchByIdUrl = ''
  private addUrl = ''
  private fetchPdfUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}invoice_data/pull/invoice`
    this.fetchByIdUrl = `${CONST.BASE_URL}invoice_data/pull/invoice/byId`
    this.addUrl = `${CONST.BASE_URL}invoice_data/add/invoice`
    this.fetchPdfUrl = `${CONST.BASE_URL}pdf/invoice/`

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

  fetchById(idList) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.fetchByIdUrl, {"idList": idList}, headers)
  }

  add(invoice) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, invoice, headers)
  }

  fetchPdf(id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      })
    }

    return this.http.get(`${this.fetchPdfUrl}${id}`, headers)
  }
}
