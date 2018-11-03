import { Component, OnInit } from '@angular/core'

import { setting } from '../../../interface'

import { SettingService } from '../../../services/setting.service'
import { OrganisationService } from '../../../services/organisation.service'

import { Store } from '@ngrx/store'
import * as settingActions from '../../../actions/setting.action'
import { AppState } from '../../../app.state'
import { setStorage } from 'src/app/globalFunctions'

@Component({
  selector: 'app-banking',
  templateUrl: './banking.component.html',
  styleUrls: ['./banking.component.css']
})
export class BankingComponent implements OnInit {

  user = <{
    user: {
      orgId: number
    },
    setting: setting
  }>{}
  appSettings: {androidSettings: setting}
  activeSetting: setting = <setting>{}
  org: any = {}

  constructor(private settingService: SettingService,
    private orgService: OrganisationService,
    private store: Store<AppState>) { }

  ngOnInit() {
    $('input').on('focus', function() {
      $(this).prev().addClass('focused-icon')
      $(this).prev().css({ "color": "#176cc1" })
      $(this).addClass('focused-input')
    })
    $('input').on('blur', function() {
      $(this).prev().removeClass('focused-icon')
      $(this).prev().css({ "color": "#555" })
      $(this).removeClass('focused-input')
    })

    this.settingService.fetch().subscribe((response: any) => {
      if (response.status == 200) {
        this.appSettings = response.settings.appSettings
        this.activeSetting = this.appSettings.androidSettings ? {...this.appSettings.androidSettings} : <setting>{}
      }
    })

    this.orgService.fetch().subscribe((response: any) => this.org = response.record)
  }

  save(valid) {
    if(valid) {
      $('#bankingDetailSubmit').attr('disable', 'disable')
      var setting = this.appSettings

      setting.androidSettings = this.activeSetting

      this.settingService.add(setting).subscribe((response: any) => {
        if (response.status == 200) {
          // update store, local storage, variables in here
          this.store.dispatch(new settingActions.add(response.settings))
          setStorage(response.settings)
          this.appSettings = response.settings.appSettings
        } else {
          alert (response.message)
          // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
        }
      })

      this.orgService.add(this.org).subscribe((response: any) => {
        if (response.status === 200) {
          alert('Banking Details had been updated successfully!')
          // notifications.showSuccess({message: response.data.message, hideDelay: 1500, hide: true});
        }
        $('#bankingDetailSubmit').removeAttr('disable')
      })
    }
  }
}