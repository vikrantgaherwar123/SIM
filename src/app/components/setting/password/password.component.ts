import { Component, OnInit } from '@angular/core'

import { AuthService } from '../../../services/auth.service'
import {ToasterService} from 'angular2-toaster'
@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {

  currentPass: string = ""
  newPass: string = ""
  confirmPass: string = ""

  constructor(private authService: AuthService,public toasterService : ToasterService) {
    this.toasterService = toasterService
   }

  ngOnInit() {
  }

  changePassword () {
    $('#bsave').attr('disabled', 'disabled')
    if (this.newPass !== '' && this.newPass === this.confirmPass) {
      this.authService.changePassword(this.currentPass, this.newPass).subscribe((response: any) => {
        this.currentPass = ""
        this.newPass = ""
        this.confirmPass = ""
        if(response.status === 200){
        alert(response.message)
        $('#bsave').removeAttr('disabled')
        this.toasterService.pop('success','Password Changed Successfully')
        }else{
          this.toasterService.pop('failure','Something went wrong')
        }
      })
    } else {
      //alert('Invalid password!')
      this.toasterService.pop('failure','Invalid Password')
    }
  }
}
