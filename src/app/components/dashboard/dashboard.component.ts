import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { setting } from '../../interface'
import { SettingService } from '../../services/setting.service'

import { Store } from '@ngrx/store'
import { AppState } from '../../app.state'
import { Title }     from '@angular/platform-browser';


interface response {
  status: number,
  records: Array<{}>,
  message: string,
  error: string,
  settings: {
    appSettings: {
      androidSettings: {}
    }
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private settingStore: Observable<setting[]>

  constructor(private router: Router,
    private settingService: SettingService,
    private store: Store<AppState>,
    private titleService: Title
  ) {
    this.settingStore = store.select('setting')
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Dashboard');
    this.settingStore.subscribe(settings => {
      if(settings){
      if(Object.keys(settings).length == 0) {
        this.settingService.fetch().subscribe((response: response) => {
          if (response.status === 200) {
            var cookie = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')
            if (response.settings === null) {
            } else {
              cookie.setting = response.settings.appSettings.androidSettings;
              if (cookie.setting.currencyInText != "" && typeof cookie.setting.currencyInText !== 'undefined') {
                // $locale.NUMBER_FORMATS.CURRENCY_SYM = $rootScope.currencySymbol(cookie.setting.currencyInText);
              } else {
                console.log("else in dashboard");
              }
              // $rootScope.authenticated.setting = cookie.setting;
            }
            localStorage.setItem('user', JSON.stringify(cookie))
          }
        })
      }
    }
    })
  }

  navigate(location) {
    this.router.navigate([location])
  }
}
