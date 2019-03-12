import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

   constructor(private http: Http) { }

  sendEmail(email,name, subject, message) {
    const uri = 'http://206.189.130.217/invoice_backend/rest/v1/support/sendemail';
    const httpOptions = {
      headers: new Headers({
        'Content-Type':  'application/x-www-form-urlencoded'
      })};
    var body = "email=" + email + "&name=" + name + "&subject=" + subject + "&message=" + message;
    return this.http.post(uri,body,httpOptions)
  }
}
