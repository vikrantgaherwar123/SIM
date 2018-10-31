import { Component, OnInit } from '@angular/core'
import { Router } from "@angular/router"

import { response as apiRespo } from '../../interface'

import { AuthService } from '../../services/auth.service'
import { ClientService } from '../../services/client.service'
import { ProductService } from '../../services/product.service'
import { TermConditionService } from '../../services/term-condition.service'
import { SettingService } from '../../services/setting.service'

import { Store } from '@ngrx/store'
import * as clientActions from '../../actions/client.action'
import * as productActions from '../../actions/product.action'
import * as termActions from '../../actions/terms.action'
import * as settingActions from '../../actions/setting.action'
import { AppState } from '../../app.state'

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
  registerMessage: any
  pro_bar_load: Boolean = false
  status: String
  errorStatus: Boolean = false

  constructor(
    private authService: AuthService,
    private router: Router,
    private clientService: ClientService,
    private productService: ProductService,
    private termsService: TermConditionService,
    private settingService: SettingService,
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    $('.user-logout').hide()
    var user: response = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')

    // Hide sidebar if active
    $('#sidebar, #content').addClass('active')

    if(user) {
      $("#login-btn").prop("disabled", true)
      this.loggingIn = true
      this.validateToken(user.access_token, user.user.orgId, user)
    }
  }

  loginUser(event) {
    event.preventDefault()
    $("#login-btn").prop("disabled", true)
    this.loggingIn = true

    this.authService.login(this.user).subscribe((response: response) => {
      if (response.status === 200) {
        this.registerMessage = null

        const access = response.login_info.access_token
        const ids = parseInt(response.login_info.user.orgId)

        // Validate token
        this.validateToken(access, ids, response)
      } else {
        this.pro_bar_load = true
        if (response.status == 410) {
          console.log('purchase error');
        } else {
          $("#login-btn").prop("disabled", false)
          $("#fbbtn").prop("disabled", false)
          $("#googlebtn").prop("disabled", false)
          $("#login-btn1").prop("disabled", false)
          $("#login-btn").prop("disabled", false)

          this.errorStatus = true
          this.registerMessage = response.message
          this.loggingIn = false
        }
      }
    })
  }

  validateToken(access, ids, response) {
    this.authService.validateToken(access, ids).subscribe((response2: response) => {
      if (response2.status === 200) {
        var tempOrgId = response.login_info ? response.login_info.user.orgId : response.user.orgId;

        if(response.login_info) {
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
        this.pro_bar_load = true
        this.status = response.message
        localStorage.clear()
        this.authenticated = false
        this.loggingIn = false
        this.router.navigate(['/login'])
      }
    })
  }

  fetchBasicData() {
    // Fetch clients, products, terms and settings, store them and redirect to invoice page
    $.when(this.clientService.fetch().toPromise(),
      this.productService.fetch().toPromise(),
      this.termsService.fetch().toPromise(),
      this.settingService.fetch().toPromise()
    ).done((clientResponse: apiRespo, productResponse: apiRespo, termResponse: apiRespo, settingResponse: any) => {
      this.store.dispatch(new clientActions.add(clientResponse.records))
      this.store.dispatch(new productActions.add(productResponse.records))
      this.store.dispatch(new termActions.add(termResponse.termsAndConditionList.filter(tnc => tnc.enabled == 0)))
      this.store.dispatch(new settingActions.add(settingResponse.settings))

      this.setCookie(settingResponse.settings)
      $('.user-logout').show()
      $('.user-logout span').html(this.authenticated.registered_email)
      this.router.navigate(['/invoice/add'])
    })
  }

  setCookie(settings) {
    var cookie = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')

    // Add settings in cookie
    cookie.setting = settings.appSettings.androidSettings
    if (cookie.setting.currencyInText != "" && typeof cookie.setting.currencyInText !== 'undefined') {
      // $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.currencySymbol(cookie.setting.currencyInText);
    } else {
      console.log("else in dashboard");
    }

    localStorage.setItem('user', JSON.stringify(cookie))
  }
}
