import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private fetchUrl = ''
  private addUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}pdf/estimate/`
    this.addUrl = `${CONST.BASE_URL}client/add-clients`

    this.user = this.cookie.get('user') ? JSON.parse(this.cookie.get('user')) : {}
  }

  fetch(id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      })
    }

    return this.http.get(`${this.fetchUrl}${id}`, headers)
  }
}
