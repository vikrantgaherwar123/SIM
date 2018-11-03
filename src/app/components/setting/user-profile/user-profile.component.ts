import { Component, OnInit } from '@angular/core'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'


import { setting } from '../../../interface'

import { SettingService } from '../../../services/setting.service'
import { OrganisationService } from '../../../services/organisation.service'

import { Store } from '@ngrx/store'
import * as settingActions from '../../../actions/setting.action'
import { AppState } from '../../../app.state'
import { setStorage } from 'src/app/globalFunctions'

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  private user: {
    user: {
      orgId: string
    },
    setting: setting
  }
  org: any = {}

  logoImgUrl: string
  signImgUrl: string
  logoStyle: SafeStyle
  signStyle: SafeStyle

  constructor(private settingService: SettingService,
    private orgService: OrganisationService,
    private store: Store<AppState>,
    private sanitizer: DomSanitizer
  ) {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.logoImgUrl = "https://images-live.nyc3.digitaloceanspaces.com/org" + this.user.user.orgId + "logo.jpg"
    this.signImgUrl = "https://images-live.nyc3.digitaloceanspaces.com/org" + this.user.user.orgId + "sign.jpg"
  }

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

    var tempRandom = this.getRandomInt(1, 9999999)
    var temp = 'background-image: url('+this.logoImgUrl+"?random="+tempRandom+'),url(assets/images/settings/logoupload.png'
    this.logoStyle = this.sanitizer.bypassSecurityTrustStyle(temp)

    temp = 'background-image: url('+this.signImgUrl + "?random="+tempRandom+'),url(assets/images/settings/signupload.png)'
    this.signStyle = this.sanitizer.bypassSecurityTrustStyle(temp)

    this.orgService.fetch().subscribe((response: any) => this.org = response.record)
  }

  cancel() {
    window.history.back()
  }

  uploadImage (type, image) {
    var fd = new FormData()
    fd.append('file', image)

    this.orgService.imgUpload(type, fd).subscribe((response: any) => {
      var tempRandom = this.getRandomInt(1, 9999999)

      if (type == 1) {
        $('#logoImgCont').css('background-image', `url(${this.logoImgUrl}?random=${tempRandom})`)
      } else {
        $('#signImgCont').css('background-image', `url(${this.signImgUrl}?random=${tempRandom})`)
      }
    })
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  save(valid) {
    if (valid) {
      $('#profileSubmitBtn').attr('disabled', 'disabled')

      this.orgService.add(this.org).subscribe((response: any) => {
        alert(response.message)
        $('#profileSubmitBtn').removeAttr('disabled')
      }, (err) => {
        console.log('errrr', err)
      })
    }
  }
}