import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private fetchUrl = ''
  private addUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}settings/pull/settings`
    this.addUrl = `${CONST.BASE_URL}client/add-clients`

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

  add(setting) {
    var d = new Date()
    var currentTime = d.getTime()
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token,
        "Device-Time": String(currentTime)
      })
    }

    return this.http.post(this.addUrl, setting, headers)
  }

}
