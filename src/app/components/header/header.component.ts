import { Component, OnInit, Input } from '@angular/core'
import { Router } from "@angular/router"

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() instance
  email

  constructor(private router: Router) {
    var user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')
    this.email = (user && user.registered_email) ? user.registered_email : 'user'
  }

  ngOnInit() {
  }

  toggleSideNavBar() {
    this.instance._toggleSidebar()
  }

  logout() {
    localStorage.clear()
    this.router.navigate(['/login'])
  }
}
