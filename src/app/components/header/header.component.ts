import { Component, OnInit, Input, ElementRef } from '@angular/core'
import { Router, NavigationEnd } from "@angular/router"

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
    router.events.subscribe( (event) => ( event instanceof NavigationEnd ) && this.handleRouteChange() )
    
  }

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

  handleRouteChange(){
    if (this.router.url === '/invoice/add' || this.router.url==='/invoice/view' ){
      this.invSrc = "assets/images/menu-logo/invoice_blue.png";
    }else{
      this.invSrc = "assets/images/menu-logo/invoice_grey.png";
    }
    if (this.router.url ==='/estimate/add' || this.router.url==='/estimate/view' ){
      this.estSrc = "assets/images/menu-logo/estimate_blue.png";
    }else{
      this.estSrc = "assets/images/menu-logo/estimate_grey.png";
    }
    if (this.router.url==='/product'){
      this.productSrc = "assets/images/menu-logo/product_blue.png";
    }else{
      this.productSrc = "assets/images/menu-logo/product_grey.png";
    }
    if (this.router.url==='/client'){
      this.clientSrc = "assets/images/menu-logo/client_blue.png";
    }else{
      this.clientSrc = "assets/images/menu-logo/client_grey.png";
    }
    if (this.router.url==='/setting/primary'){
      this.settingSrc = "assets/images/menu-logo/settings_blue.png";
    }else{
      this.settingSrc = "assets/images/menu-logo/settings-grey.png";
    }
    if (this.router.url==='/setting/batchUpload'){
      this.BatchSrc = "assets/images/menu-logo/batch_upload_blue.png";
    }else{
      this.BatchSrc = "assets/images/menu-logo/batch_upload_greyb.png";
    }
  }

  onEstHover(){
    if(this.router.url !=='/estimate/add' && this.router.url !=='/estimate/view'){
    this.estSrc = "assets/images/menu-logo/estimate_blue.png";
    }
  }
  offEstHover(){
    if(this.router.url !=='/estimate/add' && this.router.url !=='/estimate/view'){
      this.estSrc = "assets/images/menu-logo/estimate_grey.png";
    }
  }
  onInvHover(){
    if(this.router.url !== '/invoice/add' && this.router.url !=='/invoice/view' ){
      this.invSrc = "assets/images/menu-logo/invoice_blue.png";
    }
  }
  offInvHover(){
    if(this.router.url !== '/invoice/add' && this.router.url !=='/invoice/view' ){
    this.invSrc = "assets/images/menu-logo/invoice_grey.png";
    }
  }
  onProductHover(){
    if(this.router.url !=='/product'){
    this.productSrc = "assets/images/menu-logo/product_blue.png";
    }
  }
  offProductHover(){
    if(this.router.url !=='/product'){
    this.productSrc = "assets/images/menu-logo/product_grey.png";
    }
  }
  onClientHover(){
    if(this.router.url !=='/client'){
    this.clientSrc = "assets/images/menu-logo/client_blue.png";
    }
  }
  offClientHover(){
    if(this.router.url !=='/client'){
    this.clientSrc = "assets/images/menu-logo/client_grey.png";
    }
  }
  onSettingHover(){
    if(this.router.url !=='/setting/primary'){
    this.settingSrc = "assets/images/menu-logo/settings_blue.png";
    }
  }
  offSettingHover(){
    if(this.router.url !=='/setting/primary'){
    this.settingSrc = "assets/images/menu-logo/settings-grey.png";
    }
  }
  onBatchHover(){
    if(this.router.url !=='/setting/batchUpload'){
    this.BatchSrc = "assets/images/menu-logo/batch_upload_blue.png";
    }
  }
  offBatchHover(){
    if(this.router.url !=='/setting/batchUpload'){
    this.BatchSrc = "assets/images/menu-logo/batch_upload_greyb.png";
    }
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
