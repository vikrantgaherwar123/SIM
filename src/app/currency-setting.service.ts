import { Injectable } from '@angular/core';
import { CONSTANTS } from './constants'
import { SettingService } from './services/setting.service'
import { response, client, invoice, terms, setting, product, addEditEstimate, recentInvoices, estimate, recentEstimates } from './interface'

@Injectable({
  providedIn: 'root'
})
export class CurrencySettingService {
  activeSettings: setting
  settings: any
  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  mysymbols: any;
  constructor(private settingService: SettingService,
    private CONST: CONSTANTS,
    ) {

    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
   }

  currencySetting(){
    if (this.settings.currencyText) {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyName;
    }
    else {
      this.mysymbols = this.CONST.COUNTRIES.filter(symbole => symbole.countryName == this.settings.country)[0].currencyCode;
    }
    return this.mysymbols;
  }
}
