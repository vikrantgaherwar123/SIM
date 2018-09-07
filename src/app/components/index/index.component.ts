import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class AppComponent {
  private _opened: boolean = false;
  public self = this
  private _toggleSidebar() {
    this._opened = !this._opened;
  }
  title = 'simpleInvoiceManagerWeb';
}
