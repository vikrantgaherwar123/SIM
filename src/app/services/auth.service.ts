import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { catchError } from 'rxjs/operators'
import { Observable, of } from 'rxjs'

import { CONSTANTS } from '../constants'
import { MD5 } from '../globalFunctions'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = ''
  private socialLoginUrl = ''
  private validateTokenUrl = ''
  private changePasswordUrl = ''
  private forgetPasswordUrl = ''
  private user: {
    access_token: string
  }

  constructor( private http: HttpClient, private CONST: CONSTANTS) {
    this.loginUrl = `${CONST.BASE_URL}login`
    this.socialLoginUrl = `${CONST.BASE_URL}social-login-free`
    this.validateTokenUrl = `${CONST.BASE_URL}validate/token?id=`
    this.changePasswordUrl = `${CONST.BASE_URL}changePassword`
    this.forgetPasswordUrl = `${CONST.BASE_URL}forgotPassword`

    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  }
  
  // Check if user logged in
  isLoggedIn() {
    if(localStorage.getItem('user')) {
      return true
    } else {
      return false
    }
  }

  // User Login api
  login(user) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "User-Name": user.userName,
        "Password": user.password,
        "Device-Id": MD5(navigator.userAgent),
        "Device-Type": '3'
      })
    }

    return this.http.post(this.loginUrl, {}, headers).pipe(
      catchError(this.handleError('login', {}))
    )
  }

  // Social Login api
  socialLogin(creds) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "Device-Id": MD5(navigator.userAgent),
        "Device-Type": '3'
      })
    };

    return this.http.post(this.socialLoginUrl, creds, headers).pipe(
      catchError(this.handleError('login', {}))
    )
  }

  // Validate Token api
  validateToken(access, id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": access
      })
    };

    return this.http.get(`${this.validateTokenUrl}${id}`, headers).pipe(
      catchError(this.handleError('validateToken', {}))
    )
  }

  // Change Password api
  changePassword(currentPass, newPass) {
    //after login access token comes undefined so we've get it here
    if(this.user.access_token === undefined){
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
      }
    const headers = {
      headers: new HttpHeaders({
        "currentPass": currentPass,
        "accessToken": this.user.access_token,
        "newPass": newPass
      })
    }

    return this.http.get(this.changePasswordUrl, headers).pipe(
      catchError(this.handleError('validateToken', {}))
    )
  }

  // Forget Password api
  forgetPassword(email) {
    const headers = {
      headers: new HttpHeaders({
        "Device-Id": MD5(navigator.userAgent),
        "email": email
      })
    }

    return this.http.get(this.forgetPasswordUrl, headers).pipe(
      catchError(this.handleError('forget Pawwsord', {}))
    )
  }

  // Error Handler
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
