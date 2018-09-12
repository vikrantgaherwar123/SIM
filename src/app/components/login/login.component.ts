import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { CookieService } from 'ngx-cookie-service'
import { Router } from "@angular/router";

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

  constructor(private authService: AuthService, private cookie: CookieService, private router: Router) { }

  ngOnInit() {
    if(this.cookie.get('user')) {
      this.router.navigate(['/dashboard'])
    }
  }

  loginUser(event) {
    event.preventDefault()
    this.authService.login(this.user).subscribe((response) => {
      if (response.status === 200) {
        this.registerMessage = null;
        this.reloadEntire = 1;

        const access = response.login_info.access_token;
        const ids = parseInt(response.login_info.user.orgId);

        // Validate token
        this.authService.validateToken(access, ids).subscribe((response2) => {
          if (response2.status === 200) {
            // console.log("cookiessset on login",$cookies.putObject('user', results, {'path': '/'}))
            var tempOrgId = response.login_info.user.orgId;
            delete response.login_info.user;
            //console.log("oo",response.data.login_info);
            response.login_info.user = {};
            response.login_info.user.orgId = tempOrgId;
            this.cookie.set('user', JSON.stringify(response.login_info), null, '/');
            this.authenticated = response.login_info;

            // DataStore.initializerStart();
            // $rootScope;
            // $scope;
            // if (!$rootScope.referrer) {
            //   $location.path('dashboard');
            // }
            // else {
            //   $location.path($rootScope.referrer);
            // }
            $('#logoutBtn').removeClass("hide");
            $('#logoutBtn').addClass("show");
            $("#login-btn").button('reset');
            this.router.navigate(['/dashboard']);
          } else {
            this.pro_bar_load = true;
            this.status = response.message;
            var expire = new Date();
            expire.setDate(expire.getDate() - 1);
            this.cookies.remove('user');
            this.authenticated = false;
            this.router.navigate(['/login']);
            $("#login-btn").button('reset');
          }
        })
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
          // this.status = response.message;
          this.errorStatus = true;
          this.registerMessage = this.status;
        }
      }
    });
  }
}
