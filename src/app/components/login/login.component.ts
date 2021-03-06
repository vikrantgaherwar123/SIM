import { Component, OnInit } from '@angular/core'
import { Router } from "@angular/router"

import { response as apiRespo } from '../../interface'
import { setStorage } from '../../globalFunctions'
import {ToasterService} from 'angular2-toaster';
import { AuthService } from '../../services/auth.service'
import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'

import { Store } from '@ngrx/store'
import * as clientActions from '../../actions/client.action'
import * as productActions from '../../actions/product.action'
import * as termActions from '../../actions/terms.action'
import { AppState } from '../../app.state'
import { Title } from '@angular/platform-browser';

import { AuthService as socialAuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angular-6-social-login'
import { retryWhen, flatMap } from 'rxjs/operators';
import { interval, throwError, of, Observable } from 'rxjs';

interface response {
  status: number
  access_token: string
  user: {
    orgId: string
  }
  login_info: response
  message: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public user: any = {
    userName: '',
    password: ''
  }

  loggingIn: boolean = false
  authenticated: any
  errorMessage: string = ''
  forgetFlag: boolean = false
  forgetMail: string = ''
  clientsCompleted: boolean;
  productsCompleted: boolean ;
  termsCompleted: boolean;
  settingsCompleted: boolean;
  loginLoader: boolean;
  loggedInSuccess: boolean;
  loggedInFailed: boolean;
  clientsLoading: boolean;
  productLoading: boolean;
  termsLoading: boolean;
  settingsLoading: boolean;
  loginFailed: boolean;
  loginDone: boolean = false;
  accountExpired: boolean = false;

  constructor(
    private authService: AuthService,
    public toasterService: ToasterService,
    private router: Router,
    private clientService: ClientService,
    private productService: ProductService,
    private termsService: TermConditionService,
    private settingService: SettingService,
    private store: Store<AppState>,
    private socialAuthService: socialAuthService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loggedInSuccess = false;
    this.loggedInFailed = false;
    this.loginLoader = false;
    this.titleService.setTitle('Simple Invoice | Login');
    $('#userLogout').hide()
    $('#navbar').hide()
    var user: response = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')

    // Hide sidebar if active
    $('#sidebar, #content').addClass('active')

    if (user) {
      $("#login-btn").prop("disabled", true)
      this.loggingIn = true
      this.validateToken(user.access_token, user.user.orgId, user)
    }
    this.clientsLoading = true;
    this.productLoading = true;
    this.settingsLoading = true;
    this.termsLoading = true;
  }

  loginUser(event) {
    this.loginDone = true;
    this.loggingIn = true
    event.preventDefault()
    $("#login-btn").prop("disabled", true)
    this.loginLoader = true;

    this.authService.login(this.user).subscribe((response: response) => {
      if (response.status === 200) {
        this.loginLoader = false;
        this.loggedInSuccess = true;
        this.errorMessage = ''

        const access = response.login_info.access_token
        const ids = parseInt(response.login_info.user.orgId)

        // Validate token
        this.validateToken(access, ids, response)
      } 
      else {
        this.loginLoader = false;
        this.loggedInFailed = true;
        if (response.status == 410) {
          console.log('purchase error');
         } else if(response.status == 502){ //keep it as 410
          this.accountExpired = true;
        }
        else {
          $("#login-btn").prop("disabled", false)
          $("#fbbtn").prop("disabled", false)
          $("#googlebtn").prop("disabled", false)
          $("#login-btn1").prop("disabled", false)
          $("#login-btn").prop("disabled", false)

          this.errorMessage = response.message
          if(this.errorMessage){
            this.loggedInFailed = false;
          }
          
          // this.openErrorModal()
        }
      }
    },err => this.openErrorModal())
  }

  socialSignIn(socialPlatform: string) {
    let socialPlatformProvider
    if (socialPlatform == "facebook") {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID
    } else if (socialPlatform == "google") {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(userData => {
      var creds = { access_token: userData.idToken, provider: userData.provider }
      this.authService.socialLogin(creds).subscribe((response: any) => {
        if (response.status == 410) {
          console.log(response.message)
        } else if (response.status == 200) {
          const access = response.login_info.access_token
          const ids = parseInt(response.login_info.user.orgId)

          // Validate token
          this.validateToken(access, ids, response)
        }
      },err => this.openErrorModal())
    })
  }

  validateToken(access, ids, response) {
    this.authService.validateToken(access, ids).subscribe((response2: response) => {
      if (response2.status === 200) {
        var tempOrgId = response.login_info ? response.login_info.user.orgId : response.user.orgId;

        if (response.login_info) {
          delete response.login_info.user;
        } else {
          response.login_info = {}
          response.login_info.access_token = response.access_token
          response.login_info.expiry = response.expiry
          response.login_info.generated_time = response.generated_time
          response.login_info.purchaseStatus = response.purchaseStatus
          response.login_info.registered_email = response.registered_email
          response.login_info.tokenStatus = response.tokenStatus
        }
        response.login_info.user = {}
        response.login_info.user.orgId = tempOrgId
        localStorage.setItem('user', JSON.stringify(response.login_info))

        this.authenticated = response.login_info

        // Fetch basic app data and store
        this.fetchBasicData()

        $('#logoutBtn').removeClass("hide")
        $('#logoutBtn').addClass("show")
      } else {
        $("#login-btn").prop("disabled", false)
        this.errorMessage = response.message
        localStorage.clear()
        this.authenticated = false
        this.loggingIn = false
        this.router.navigate(['/login'])
      }
    },err => this.openErrorModal())
  }

  forgetPassword() {
    this.authService.forgetPassword(this.forgetMail).subscribe((response: any) => {
      if (response.status === 200) {
        this.errorMessage = 'Please check  your email to reset password!'
        this.forgetMail = ''
      } else {
        this.errorMessage = "This email address is not registered with us."
      }
    },err => this.openErrorModal())
  }

  // error modal
  openErrorModal() {
    this.loginFailed = true;
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }

  fetchBasicData() {
    // Fetch clients, products, terms and settings, store them and redirect to invoice page
    if (this.loggedInSuccess) {
      
      this.clientService.fetch().subscribe(
          (result: any) => {
             if(result){
              this.clientsLoading = false;
              if(result.status == 200){
              this.store.dispatch(new clientActions.add(result.records))
              }
              else{
              this.toasterService.pop('failure', 'Your Subscription has been expired !!!');
              }
              this.clientsCompleted = true;
              this.navigateToAdd();
             }
             else{
              this.clientsCompleted = false;
             }
          },
          err => this.openErrorModal()),

            this.productService.fetch().subscribe(
            (result: any) => {
              this.productLoading = false;
                if (result) {
                  this.productLoading = false;
                  if (result.status == 200 && result.records ) {
                    this.store.dispatch(new productActions.add(result.records.filter(prod => prod.enabled == 0)))
                  }
                  else {
                    this.toasterService.pop('failure', 'Your Subscription has been expired !!!');
                  }

                  this.productsCompleted = true;
                  this.navigateToAdd();
                }
              else{
                this.productsCompleted = false;
              }
            },
            err => this.openErrorModal()),

            this.termsService.fetch().subscribe(
            (result: any) => {
              if(result){
                this.termsLoading = false;
                if(result.status == 200 && result.termsAndConditionList ){
                this.store.dispatch(new termActions.add(result.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
                }
                else{
                  this.toasterService.pop('failure', 'Your Subscription has been expired !!!');
                }
                this.termsCompleted = true;
                this.navigateToAdd();
              }
              else{
                this.termsCompleted = false;
              }
            },
            err => this.openErrorModal()),

            this.settingService.fetch().subscribe(
            (result: any) => {
            if (result.settings) {
              this.settingsLoading = false;
              setStorage(result.settings)
                this.settingsCompleted = true;
                this.navigateToAdd();
            }else{
              this.settingsCompleted = false;
            }
            }, err => this.openErrorModal())
      $('#userLogout').show()

      $('#userLogout span').html(this.authenticated.registered_email) 
    }
  }

 
  navigateToAdd() {
    if (this.settingsCompleted && this.termsCompleted && this.clientsCompleted && this.productsCompleted === true) {
        this.router.navigate(['/invoice/add']);
    }
  }
}
