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

  @Input() instance;

  constructor(private cookie: CookieService, private router: Router, private CONST: CONSTANTS) { }

  ngOnInit() {
  }

  toggleSideNavBar() {
    this.instance._toggleSidebar()
  }

  logout() {
    this.cookie.delete('user');
    this.CONST.AUTHENTICATED = false
    this.router.navigate(['/login']);
  }
}
