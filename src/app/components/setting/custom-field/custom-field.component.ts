import { Component, OnInit } from '@angular/core'

import { setting } from '../../../interface'

import { SettingService } from '../../../services/setting.service'

import { Store } from '@ngrx/store'
import { AppState } from '../../../app.state'
import { setStorage } from 'src/app/globalFunctions'
import {ToasterService} from 'angular2-toaster'
import { Title }     from '@angular/platform-browser';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.css']
})
export class CustomFieldComponent implements OnInit {

  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  appSettings: {androidSettings: setting}
  activeSetting: setting = <setting>{}

  constructor(private settingService: SettingService,
    public toasterService : ToasterService,
    private titleService: Title,
     private store: Store<AppState>) {
    this.toasterService = toasterService
   }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Custom Field');
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
    },error => this.openErrorModal())
  }

  cancel() {
    window.history.back()
  }

  // error modal
  openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }

  save(valid) {
    if(valid) {
      var setting = this.appSettings

      setting.androidSettings = this.activeSetting

      this.settingService.add(setting).subscribe((response: any) => {
        if (response.status == 200) {
          // update local storage, variables
          setStorage(response.settings)
          this.appSettings = response.settings.appSettings

          this.toasterService.pop('success','Custom Field Added Successfully')
        } else {
          alert (response.message)
          // notifications.showError({ message: response.data.message, hideDelay: 1500, hide: true })
        }
      },error => this.openErrorModal())
    }
  }
}