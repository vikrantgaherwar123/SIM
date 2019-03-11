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
    
    // const formData = new FormData();
    // formData.append('email', email);
    // formData.append('name', name);
    // formData.append('subject', subject);
    // formData.append('message', message);


    var obj ={
      email:email,
      name:name,
      subject: subject,
      message: message
    }

    
    this.http.post(uri,obj,httpOptions)
                        .subscribe(
                            (res) => {
                                console.log(res);
                            },
                            err => console.log(err)
                        );
    // return this.http.post(uri, formData);
  }
}
