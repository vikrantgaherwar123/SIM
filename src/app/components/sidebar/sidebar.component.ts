import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { setting } from '../../interface'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit {
  
  constructor(private router: Router) { 
   
  }

  ngOnInit() {
  }

  toggle(location) {
    if (!(window.location.pathname).includes('/login')) {
      $('#sidebar, #content').toggleClass('active')
    }
    this.router.navigate([location])
  }
}
