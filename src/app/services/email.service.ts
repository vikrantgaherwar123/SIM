import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

   constructor(private http: Http) { }

  sendEmail(name, email, message) {
    const uri = 'http://localhost:4200/support/';
    const obj = {
      name: name,
      email: email,
      message: message,
    };
    return this.http.post(uri, obj);
  }
}
