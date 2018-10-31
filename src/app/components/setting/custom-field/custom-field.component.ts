import { Component, OnInit } from '@angular/core'

import { setting } from '../../../interface'

import { SettingService } from '../../../services/setting.service'

import { Store } from '@ngrx/store'
import * as settingActions from '../../../actions/setting.action'
import { AppState } from '../../../app.state'
import { setStorage } from 'src/app/globalFunctions'

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.css']
})
export class CustomFieldComponent implements OnInit {

  user = <{
    user: {
      orgId: number
    },
    setting: setting
  }>{}
  errors = {}
  checked = false
  appSettings: {androidSettings: setting}
  activeSetting: setting = <setting>{}
  constructor(private settingService: SettingService, private store: Store<AppState>) { }

  ngOnInit() {
    $('input').on('focus', () => {
      $(this).prev().addClass('focused-icon')
      $(this).prev().css({ "color": "#176cc1" })
      $(this).addClass('focused-input')
    })
    $('input').on('blur', () => {
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
  }

  cancel() {
    window.history.back()
  }

  save(valid) {
    if(valid) {
      var setting = this.appSettings

      setting.androidSettings = this.activeSetting

      this.settingService.add(setting).subscribe((response: any) => {
        if (response.status == 200) {
          // update store, local storage, variables in here
          this.store.dispatch(new settingActions.add(response.settings))
          setStorage(response.settings)
          this.appSettings = response.settings.appSettings

          alert('Custom Fields had been updated successfully!')
        } else {
          alert (response.message)
          // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
        }
      })
    }
  }
}