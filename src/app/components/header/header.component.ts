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
  showVar: boolean;

  constructor(public router: Router) {
    var user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')
    this.email = (user && user.registered_email) ? user.registered_email : 'user'
    // var $buttons = jQuery('button');
    // $buttons.on('click', function () {
    //   jQuery(this).toggleClass('active').siblings('button').removeClass('active');
    // })
    
  }

  ngOnInit() {
    this.toggleSideNavBar();
    // Add active class to the current button (highlight it)
    var header = document.getElementById("navbar");
    var btns = header.getElementsByClassName("navbtn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
      });
    }
  }

  toggleSideNavBar() {
    this.showVar = !this.showVar;
    this.instance._toggleSidebar()
  }
  toggle(location) {
    if (!(window.location.pathname).includes('/login')) {
      $('#sidebar, #content').toggleClass('active')
    }
    this.router.navigate([location])
  }
  logout() {
    localStorage.clear()
    window.location.reload()
    // this.router.navigate(['/login'])
  }
}
