import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { CONSTANTS } from '../constants'
import { MD5 } from '../globalFunctions'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = `${CONSTANTS.BASE_URL}login`
  private validateTokenUrl = `${CONSTANTS.BASE_URL}validate/token?id=`

  constructor( private http: HttpClient ) {
  }
  
  // User Login
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

  // Validate Token
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
