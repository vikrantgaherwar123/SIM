import { Injectable } from '@angular/core';
import { CONSTANTS } from '../constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private clienListUrl = ''

  constructor(private http: HttpClient, private CONST: CONSTANTS) { 
    this.clienListUrl = `${CONST.BASE_URL}client/pull/client`
  }

  fetchClients() {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.CONST.ACCESS_TOKEN,
        "lastEpoch": '0'
      })
    }
console.log(this.CONST);

    return this.http.get(this.clienListUrl, headers)
  }
}
