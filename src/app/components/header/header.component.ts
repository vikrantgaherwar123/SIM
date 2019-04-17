import { Component, OnInit, Input, ElementRef } from '@angular/core'
import { Router } from "@angular/router"

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  // host: {
  //   '(document:click)': 'onClick($event)',
  // },
})
export class HeaderComponent implements OnInit {

  @Input() instance
  email
  showVar: boolean;
  estSrc: string;
  invSrc: string;
  productSrc: string;
  clientSrc: string;
  settingSrc: string;
  BatchSrc: string;

  constructor(public router: Router,private _eref: ElementRef) {
    var user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')
     this.email = (user && user.registered_email) ? user.registered_email : 'user'
    // var $buttons = jQuery('button');
    // $buttons.on('click', function () {
    //   jQuery(this).toggleClass('active').siblings('button').removeClass('active');
    // })
    
  }

  // onClick(event) {
  //   if (!this._eref.nativeElement.contains(event.target)) {// or some similar check
  //   !this.instance._toggleSidebar();
  //   }
  //  }

  ngOnInit() {
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
    //change header image on hover
    this.offEstHover();
    this.offInvHover();
    this.offProductHover();
    this.offClientHover();
    this.offSettingHover();
    this.offBatchHover();
  }

  onEstHover(){
    this.estSrc = "assets/images/menu-logo/estimetOnHover.png";
  }
  offEstHover(){
    this.estSrc = "assets/images/estimet_n.png";
  }
  onInvHover(){
    this.invSrc = "assets/images/menu-logo/invoiceOnHover.png";
  }
  offInvHover(){
    this.invSrc = "assets/images/invoice_n.png";
  }
  onProductHover(){
    this.productSrc = "assets/images/menu-logo/productHeader.png";
  }
  offProductHover(){
    this.productSrc = "assets/images/product_n.png";
  }
  onClientHover(){
    this.clientSrc = "assets/images/menu-logo/clientHeader.png";
  }
  offClientHover(){
    this.clientSrc = "assets/images/client_img.png";
  }
  onSettingHover(){
    this.settingSrc = "assets/images/menu-logo/settingsHeader.png";
  }
  offSettingHover(){
    this.settingSrc = "assets/images/setting_n.png";
  }
  onBatchHover(){
    this.BatchSrc = "assets/images/menu-logo/batch_uploadHeader.png";
  }
  offBatchHover(){
    this.BatchSrc = "assets/images/batch_upload.png";
  }

  toggleSideNavBar() {
    this.showVar = !this.showVar; //color change of menu
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
