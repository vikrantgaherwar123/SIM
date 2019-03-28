import { Component } from '@angular/core'
import { Router } from "@angular/router"


@Component({
  selector: 'app-root',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class AppComponent {

  constructor(public router: Router) {
  }
  public self = this
  private _toggleSidebar() {
    if (!(window.location.pathname).includes('/login')) {
      $('#sidebar, #content').toggleClass('active')
    }
  }
  title = 'simpleInvoiceManagerWeb';
}
