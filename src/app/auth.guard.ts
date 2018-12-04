import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from './services/auth.service'
import {TranslateService} from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  languages = ['en', 'en', 'es', 'ru', 'fr', 'de', 'it', 'pt', 'in', 'ms', 'ja', 'ar', 'ko', 'jv', 'zu', '', 'th']
  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {
    translate.setDefaultLang('en')
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(this.authService.isLoggedIn()) {
      let langCode = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).setting.languageCode : 0
      this.translate.use(this.languages[langCode])
      return true
    } else {
      this.router.navigate(['login'])
      return false
    }
  }
}
