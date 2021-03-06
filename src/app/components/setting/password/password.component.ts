import { Component, OnInit } from '@angular/core'

import { AuthService } from '../../../services/auth.service'
import {ToasterService} from 'angular2-toaster'
import { Title }     from '@angular/platform-browser';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {

  currentPass: string = ""
  newPass: string = ""
  confirmPass: string = ""
  user: any;

  constructor(private authService: AuthService,public toasterService : ToasterService,
    private titleService: Title) {
    this.toasterService = toasterService,
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
   }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Password');
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
          this.authService.validateToken(this.user.access_token , this.user.user.orgId);
        }
      },error => this.openErrorModal())
    } else {
      //alert('Invalid password!')
      this.toasterService.pop('failure','Invalid Password')
    }
  }

  // error modal
  openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }
}
