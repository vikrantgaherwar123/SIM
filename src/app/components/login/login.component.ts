import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { CookieService } from 'ngx-cookie-service'
import { Router } from "@angular/router"

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

  user: Object = {
    userName: '',
    password: ''
  }

  authenticated: Object
  registerMessage: any
  reloadEntire: Number
  pro_bar_load: Boolean = false
  status: String
  errorStatus: Boolean = false

  constructor(
    private authService: AuthService,
    private cookie: CookieService,
    private router: Router
  ) { }

  ngOnInit() {
    $('.user-logout').hide()
    var user: response = this.cookie.get('user') ? JSON.parse(this.cookie.get('user')) : this.cookie.get('user')

    if(user) {
      this.validateToken(user.access_token, user.user.orgId, user)
    }
  }

  loginUser(event) {
    event.preventDefault()
    this.authService.login(this.user).subscribe((response: response) => {
      if (response.status === 200) {
        this.registerMessage = null;
        this.reloadEntire = 1;

        const access = response.login_info.access_token;
        const ids = parseInt(response.login_info.user.orgId);

        // Validate token
        this.validateToken(access, ids, response);
      } else {
        this.pro_bar_load = true;
        if (response.status == 410) {
          console.log('purchase error');
          
          // window.location.href = 'http://www.simpleinvoiceweb.com/views/error-unpurchased.html';
        } else {
          $("#login-btn").button('reset');
          $("#fbbtn").prop("disabled", false)
          $("#googlebtn").prop("disabled", false);
          $("#login-btn1").prop("disabled", false);
          $("#login-btn").prop("disabled", false);
          // this.status = response.message
          this.errorStatus = true;
          this.registerMessage = response.message
        }
      }
    });
  }

  validateToken(access, ids, response) {
    this.authService.validateToken(access, ids).subscribe((response2: response) => {
      if (response2.status === 200) {
        $('.user-logout').show()
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
        response.login_info.user = {};
        response.login_info.user.orgId = tempOrgId;
        this.cookie.set('user', JSON.stringify(response.login_info), null, '/');
        this.authenticated = response.login_info;

        $('#logoutBtn').removeClass("hide");
        $('#logoutBtn').addClass("show");
        $("#login-btn").button('reset');
        this.router.navigate(['/dashboard']);
      } else {
        this.pro_bar_load = true;
        this.status = response.message;
        var expire = new Date();
        expire.setDate(expire.getDate() - 1);
        this.cookie.delete('user');
        this.authenticated = false;
        this.router.navigate(['/login']);
        $("#login-btn").button('reset');
      }
    })
  }
}
