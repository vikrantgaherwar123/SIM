import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private fetchClientUrl = ''
  private addClientUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchClientUrl = `${CONST.BASE_URL}client/pull/client`
    this.addClientUrl = `${CONST.BASE_URL}client/add-clients`

    this.user = this.cookie.get('user') ? JSON.parse(this.cookie.get('user')) : {}
  }

  fetchClients() {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token,
        "lastEpoch": '0'
      })
    }

    return this.http.get(this.fetchClientUrl, headers)
  }

  addClient(client) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addClientUrl, client, headers)
  }
}
