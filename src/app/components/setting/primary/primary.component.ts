import { Component, OnInit } from '@angular/core'

import { CONSTANTS } from '../../../constants'
import { setting } from '../../../interface'

import { SettingService } from '../../../services/setting.service'
import {ToasterService} from 'angular2-toaster'
import { Title }     from '@angular/platform-browser';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-primary',
  templateUrl: './primary.component.html',
  styleUrls: ['./primary.component.css']
})
export class PrimaryComponent implements OnInit {

  appSettings: any
  activeSettings: setting
  countries: Array<{
    id: number,
    currencyCode: string,
    currencyName: string,
    countryName: string
  }>
  activeCountry: any
  private user: {
    user: {
      orgId: string
    },
    setting: any
  }
  settings: any;
  activePatternNumber: string = "Pattern";

  constructor(private CONST: CONSTANTS,
    public toasterService : ToasterService,
    private settingService: SettingService,
    private titleService: Title,
    private adapter: DateAdapter<any>
  ) {
    this.toasterService = toasterService
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting

  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Primary Setting');
    // this.loaded = true
    this.countries = this.CONST.COUNTRIES
    this.countries.sort(this.dynamicSort("countryName"))

    this.settingService.fetch().subscribe((response: any) => {
      if (response.status == 200) {
        this.appSettings =  response.settings.appSettings
        this.activeSettings = response.settings.appSettings.androidSettings ?
          response.settings.appSettings.androidSettings : {
          dropbox_token: "",
          date_format: "",
          currency_pattern: ""
        }

        this.activeCountry = this.countries.filter(country => country.id == this.activeSettings.countryIndex)[0]
      }
    },error => this.openErrorModal())
  }

  dynamicSort(property) {
    var sortOrder = 1
    if (property[0] === "-") {
      sortOrder = -1
      property = property.substr(1)
    }
    return function (a, b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
      return result * sortOrder
    }
  }

  saveSettings() {
    var setting = this.appSettings
    setting.androidSettings = this.activeSettings

    this.settingService.add(setting).subscribe((response: any) => {
      if (response.status == 200) {
        var cookie = JSON.parse(localStorage.getItem('user'))

        // if (this.activeSettings.numberFormat === "###,###,###.00") {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = this.activeSettings.decimalSeperator
        //   $locale.NUMBER_FORMATS.GROUP_SEP = this.activeSettings.commaSeperator
        //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
        //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
        //   this.settingscurrency_pattern = 'pattern1'

        // } else if (this.activeSettings.numberFormat === "##,##,##,###.00") {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = this.activeSettings.decimalSeperator
        //   $locale.NUMBER_FORMATS.GROUP_SEP = this.activeSettings.commaSeperator
        //   //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
        //   //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
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
        //   this.settingscurrency_pattern = 'pattern2'

        // } else if (this.activeSettings.numberFormat === "###.###.###,00") {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = this.activeSettings.decimalSeperator
        //   $locale.NUMBER_FORMATS.GROUP_SEP = this.activeSettings.commaSeperator
        //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
        //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
        //   this.settingscurrency_pattern = 'pattern1'

        // } else if (this.activeSettings.numberFormat === "##.##.##.###,00") {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = this.activeSettings.decimalSeperator
        //   $locale.NUMBER_FORMATS.GROUP_SEP = this.activeSettings.commaSeperator
        //   //$locale.NUMBER_FORMATS.PATTERNS[1].gSize = 2
        //   //$locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
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
        //   this.settingscurrency_pattern = 'pattern2'

        // } else if (this.activeSettings.numberFormat === "### ### ###,00") {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = this.activeSettings.decimalSeperator
        //   $locale.NUMBER_FORMATS.GROUP_SEP = this.activeSettings.commaSeperator
        //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
        //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
        //   this.settingscurrency_pattern = 'pattern1'

        // } else {
        //   $locale.NUMBER_FORMATS.DECIMAL_SEP = "."
        //   $locale.NUMBER_FORMATS.GROUP_SEP = ","
        //   $locale.NUMBER_FORMATS.PATTERNS[1].gSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].lgSize = 3
        //   $locale.NUMBER_FORMATS.PATTERNS[1].macFrac = 0
        //   $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = 2
        //   $locale.NUMBER_FORMATS.PATTERNS[1].minInt = 1
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negPre = "- \u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].negSuf = ""
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posPre = "\u00a4"
        //   $locale.NUMBER_FORMATS.PATTERNS[1].posSuf = ""
        //   this.settingscurrency_pattern = 'pattern1'
        // }

        if (!this.activeSettings.dateDDMMYY) {
          // $locale.DATETIME_FORMATS.mediumDate = "MM-dd-yyyy"
          this.adapter.setLocale('en-GB');
        } else if (this.activeSettings.dateDDMMYY) {
          this.adapter.setLocale('en-US');
          // $locale.DATETIME_FORMATS.mediumDate = "dd-MM-yyyy"
        }

        if (this.activeSettings.currencyInText != "" && typeof this.activeSettings.currencyInText !== 'undefined') {
          // $locale.NUMBER_FORMATS.CURRENCY_SYM = this.currencySymbol(this.activeSettings.currencyInText)
        } else {
          console.log("else in settings")
        }

        // Update local storage
        cookie.setting = this.activeSettings
        localStorage.setItem('user', JSON.stringify(cookie))

        this.toasterService.pop('success','Updated Successfully')
        this.ngOnInit()
      } else {
        alert (response.message)
        // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
      }
    },error => this.openErrorModal())
  }

  // Setter Functions
  setDateFormat(format) {
    this.activeSettings.date_format=format

    if(format == 'mm-dd-yy') {
      this.activeSettings.dateDDMMYY=false
      this.activeSettings.dateMMDDYY=true
    } else {
      this.activeSettings.dateDDMMYY=true
      this.activeSettings.dateMMDDYY=false
    }
  }

  setCurrencyPattern(value) {
    this.activeSettings.numberFormat = value

    switch(this.activeSettings.numberFormat) {
      case "###,###,###.00":
        this.activeSettings.decimalSeperator = "."
        this.activeSettings.commaSeperator = ","
        this.activePatternNumber = "1,000,000.00"
        break
      case "##,##,##,###.00":
        this.activeSettings.decimalSeperator = "."
        this.activeSettings.commaSeperator = ","
        this.activePatternNumber = "1,00,00,000.00"
        break
      case "###.###.###,00":
        this.activeSettings.decimalSeperator = ","
        this.activeSettings.commaSeperator = "."
        this.activePatternNumber = "1.000.000,00"
        break
      case "##.##.##.###,00":
        this.activeSettings.decimalSeperator = ","
        this.activeSettings.commaSeperator = "."
        this.activePatternNumber = "1.00.00.000,00"
        break
      case "### ### ###,00":
        this.activeSettings.decimalSeperator = ","
        this.activeSettings.commaSeperator = " "
        this.activePatternNumber = "1 000 000,00"
        break
      default:
        this.activeSettings.decimalSeperator = "."
        this.activeSettings.commaSeperator = ","
    }
  }

   // error modal
   openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }

  setCountry(countryId) {
    this.activeCountry = this.countries.filter(country => country.id == countryId)[0]

    this.activeSettings.country = this.activeCountry.countryName
    this.activeSettings.countryIndex = this.activeCountry.id
    this.activeSettings.currencyInText = this.activeCountry.currencyName
    this.activeSettings.currencySymbol = true
    this.activeSettings.currencyText = false
  }

  setCurrencySymbol(type){
    if(type == 'symbol') {
      this.activeSettings.currencySymbol = true
      this.activeSettings.currencyText = false
    } else {
      this.activeSettings.currencySymbol = false
      this.activeSettings.currencyText = true
    }
  }

  setAdditionalTaxes(value) {
    var i = 0
    var tempTaxes
    this.activeSettings.alstTaxName = []
    while (i < value) {
      tempTaxes = { "calculateValue": 0, taxName: '' }
      this.activeSettings.alstTaxName.push(tempTaxes)
      i++
    }

    this.close()
  }

  currencySymbol(value) {
    var x = value
    var r = /\\u([\d\w]{4})/gi
    x = x.replace(r, function (match, grp) {
      return String.fromCharCode(parseInt(grp, 16))
    })
    x = unescape(x)
    return x
  }

  close() {
    $('#addTaxName').modal('hide')
  }
}