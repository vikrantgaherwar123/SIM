import { Component, OnInit, Input } from '@angular/core'
import { CookieService } from 'ngx-cookie-service'
import { Router } from "@angular/router"
import { CONSTANTS } from '../../constants'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() instance
  private email

  constructor(private cookie: CookieService, private router: Router, private CONST: CONSTANTS) {
    var user = JSON.parse(this.cookie.get('user'))
    this.email = (user && user.registered_email) ? user.registered_email : 'user'
  }

  ngOnInit() {
  }

  toggleSideNavBar() {
    this.instance._toggleSidebar()
  }

  logout() {
    this.cookie.delete('user')
    this.router.navigate(['/login'])
  }
}
