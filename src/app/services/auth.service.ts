import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { catchError } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'
import { MD5 } from '../globalFunctions'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = ''
  private validateTokenUrl = ''

  constructor( private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService ) {
    this.loginUrl = `${CONST.BASE_URL}login`
    this.validateTokenUrl = `${CONST.BASE_URL}validate/token?id=`
  }
  
  // Check if user logged in
  isLoggedIn() {
    if(this.cookie.get('user')) {
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
    };

    return this.http.post(this.loginUrl, {}, headers).pipe(
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

  //Error Handler
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
