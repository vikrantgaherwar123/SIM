import { Component } from '@angular/core'
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client'

@Component({
  selector: 'app-root',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class AppComponent {
  public self = this
  private _toggleSidebar() {
    if (!(window.location.pathname).includes('/login')) {
      $('#sidebar, #content').toggleClass('active')
    }
  }
  title = 'simpleInvoiceManagerWeb';
}
