import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class AppComponent {
  public self = this
  private _toggleSidebar() {
    if (window.location.pathname !== '/login') {
      $('#sidebar, #content').toggleClass('active');
      // $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    }
  }
  title = 'simpleInvoiceManagerWeb';
}
