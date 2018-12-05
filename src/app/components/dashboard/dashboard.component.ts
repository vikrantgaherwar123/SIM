import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { setting } from '../../interface'
import { SettingService } from '../../services/setting.service'

import { Store } from '@ngrx/store'
import { AppState } from '../../app.state'

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
    private store: Store<AppState>
  ) {
    this.settingStore = store.select('setting')
  }

  ngOnInit() {
    this.settingStore.subscribe(settings => {
      if(Object.keys(settings).length == 0) {
        this.settingService.fetch().subscribe((response: response) => {
          if (response.status === 200) {
            var cookie = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user')
            if (response.settings === null) {
              // $rootScope.authenticated.setting = {};
              // $rootScope.authenticated.setting.date_format = true;
              // $rootScope.settings.date_format = 'dd-mm-yy';
              // $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy";
              // $rootScope.currencySymbolTemp = $locale.NUMBER_FORMATS.CURRENCY_SYM;
              // $rootScope.settings.alstTaxName = [];
              // cookie.setting = response.data.settings.appSettings.webSettings;
            } else {
              cookie.setting = response.settings.appSettings.androidSettings;
    
              // if (cookie.setting.numberFormat === "###,###,###.00") {
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator;
              //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern1';
              // } else if (cookie.setting.numberFormat === "##,##,##,###.00") {
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator;
              //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern2';
              // } else if (cookie.setting.numberFormat === "###.###.###,00") {
              //   console.log("number Format 3")
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator;
              //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern1';
    
              // } else if (cookie.setting.numberFormat === "##.##.##.###,00") {
              //   console.log("number Format 4")
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator;
              //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator;
              //   //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2;
              //   //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern2';
    
              // } else if (cookie.setting.numberFormat === "### ### ###,00") {
              //   console.log("number Format 5")
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = cookie.setting.decimalSeperator;
              //   $locale.NUMBER_FORMATS.GROUP_SEP = cookie.setting.commaSeperator;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern1';
    
              // } else {
              //   console.log("number Format 6")
              //   $locale.NUMBER_FORMATS.DECIMAL_SEP = ".";
              //   $locale.NUMBER_FORMATS.GROUP_SEP = ",";
              //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3;
              //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
              //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
              //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
              //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
              //   $rootScope.settings.currency_pattern = 'pattern1';
              // }
    
              // if (cookie.setting.dateDDMMYY === false) {
              //   $locale.DATETIME_FORMATS.mediumDate = "MM-dd-yyyy";
              //   $rootScope.settings.date_format = 'mm-dd-yy';
              // } else if (cookie.setting.dateDDMMYY === true) {
              //   $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy";
              //   $rootScope.settings.date_format = 'dd-mm-yy';
              // }
    
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
    })
  }

  navigate(location) {
    this.router.navigate([location])
  }
}
