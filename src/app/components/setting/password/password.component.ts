import { Component, OnInit } from '@angular/core'

import { AuthService } from '../../../services/auth.service'

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {

  currentPass: string = ""
  newPass: string = ""
  confirmPass: string = ""

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  changePassword () {
    $('#bsave').attr('disabled', 'disabled')
    if (this.newPass !== '' && this.newPass === this.confirmPass) {
      this.authService.changePassword(this.currentPass, this.newPass).subscribe((response: any) => {
        this.currentPass = ""
        this.newPass = ""
        this.confirmPass = ""

        alert(response.message)
        $('#bsave').removeAttr('disabled')
      })
    } else {
      alert('Invalid password!')
    }
  }
}
