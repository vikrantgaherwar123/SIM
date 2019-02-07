import { Component, OnInit, OnDestroy } from '@angular/core';
// const CircularJSON = require('circular-json');
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit,OnDestroy{
  public subscribeForm: FormGroup;
  public email: FormControl;
  private unsubscribe = new Subject<void>();
   
    constructor(private http: HttpClient) {}

       ngOnInit() {
        this.createFormControls();
        this.createForm();
    }

    createFormControls() {
      this.email = new FormControl('', [
          Validators.required
      ]);
  }

  createForm() {
      this.subscribeForm = new FormGroup({
          email: this.email
      });
  }

  sendMail() {
      if (this.subscribeForm.valid) {
          this.http.post('http://localhost/assets/email.php', this.email.value.email).subscribe();
      }
  }

  ngOnDestroy(): void {
      this.unsubscribe.next();
      this.unsubscribe.complete();
  }

}