import { Component, OnInit } from '@angular/core'
import { ClientService } from '../../services/client.service'
import { CookieService } from 'ngx-cookie-service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../interface'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store'
import * as clientActions from '../../actions/client.action'
import { AppState } from '../../app.state'

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  private user: {
    user: {
      orgId: string
    }
  }
  private clientList: Observable<client[]>
  private activeClient = {
    addressLine1: "",
    businessDetail: "",
    businessId: "",
    contactPersonName: "",
    deleted_flag: 0,
    device_modified_on: 0,
    email: "",
    localClientid: 0,
    name: "",
    number: "",
    shippingAddress: "",
    organizationId: "",
    uniqueKeyClient: ""
  }
  private activeClientIndex
  private errors: object = {}
  private clientListsLoader: boolean

  private selectedClient = null
  private clientDisplayLimit = 12
  
  private checked: boolean = false
  private isEdit: boolean = false
  private isCreate: boolean
  private clearBtn: boolean
  private inputDisabled: boolean
  private rightDivBtns: boolean = false
  private isEditBtn: boolean = true
  private cancle: boolean = true
  private inputReadonly: boolean
  private tempClient = null
  private tempIndex = null

  private clientListLoader: boolean

  constructor(public clientService: ClientService, private cookie: CookieService,
    private router: Router, private store: Store<AppState>
  ) {
    this.clientList = store.select('client')
    this.user = JSON.parse(this.cookie.get('user'))
  }

  ngOnInit() {
    this.clientListLoader = false

    this.clientList.subscribe(clients => {
      if(clients.length < 1) {
        this.clientService.fetch().subscribe((response: response) => {
          if (response.status === 200) {
            this.clientListLoader = true
            this.store.dispatch(new clientActions.add(response.records.filter(client => client.enabled == 0)))
          }
        })
      } else {
        this.clientListLoader = true
      }
    })
  }

  toggle() {
    this.checked = !this.checked
  }

  isStatus(client) {
    return (client.enabled == 0);
  }

  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    var genreA = a.value.toUpperCase();
    var genreB = b.value.toUpperCase();

    var comparison = 0;
    if (genreA > genreB) {
      comparison = 1;
    } else if (genreA < genreB) {
      comparison = -1;
    }
    return comparison;
  }

  save(status, edit) {
    // $('#saveClientBtn1').button('loading')
    // $('#saveClientBtn').button('loading')
    var proStatus = true
    // edit = 1 ==> add, edit = 2 ==> edit
    if (edit == 1) {
      // $('#updateClientBtn1').button('loading')
      // $('#updateClientBtn').button('loading')

      var tempClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')
      //console.log("temp pro name" , tempProName)
      var tempCompare = ''

      this.clientList.subscribe(clients => {
        if (clients.length) {
          for (var p = 0; p < clients.length; p++) {
            tempCompare = clients[p].name.toLowerCase().replace(/ /g, '')
            if (tempCompare === tempClientName) {
              proStatus = false
              break
            }
          }
        } else {
          proStatus = true;
        }
      }) 
    } else if (edit == 2) {
      var tempClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      this.clientList.subscribe(clients => {
        if (this.clientList) {
          for (var p = 0; p < clients.length; p++) {
            tempCompare = clients[p].name.toLowerCase().replace(/ /g, '')
            if (tempCompare === tempClientName) {
              if (this.activeClient.uniqueKeyClient !== clients[p].uniqueKeyClient) {
                proStatus = false;
                break
              }
            }
          }
        } else {
          proStatus = true
        }
      })
    } else {
      proStatus = true
    }
    if (status && proStatus) {
      this.activeClient.organizationId = this.user.user.orgId
      var d = new Date()
      if (this.activeClient.uniqueKeyClient == "" || typeof this.activeClient.uniqueKeyClient == 'undefined') {
        this.activeClient.uniqueKeyClient = generateUUID(this.user.user.orgId);
      }
      this.activeClient.device_modified_on = d.getTime();
      this.clientListLoader = false
      var self = this
      this.clientService.add([this.clientService.changeKeysForApi(this.activeClient)]).subscribe((response: any) => {
        // $('#updateClientBtn').button('reset');
        // $('#saveClientBtn').button('reset');
        // $('#updateClientBtn1').button('reset');
        // $('#saveClientBtn1').button('reset');

        if (response.status === 200) {
          self.clientListLoader = true
          let index
          self.clientList.subscribe(clients => {
            index = clients.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          })
          if (index == -1) {  // add
            self.store.dispatch(new clientActions.add([self.clientService.changeKeysForStore(response.clientList[0])]))
          } else {
            if (self.activeClient.deleted_flag) {   // delete
              self.store.dispatch(new clientActions.remove(index))
            } else {    //edit
              self.store.dispatch(new clientActions.edit({index, value: self.clientService.changeKeysForStore(response.clientList[0])}))
            }
          }
          self.errors = {}

          self.activeClient.name = "",
          self.activeClient.contactPersonName = "",
          self.activeClient.email = "",
          self.activeClient.number = "",
          self.activeClient.addressLine1 = "",
          self.activeClient.shippingAddress = "",
          self.activeClient.businessDetail = "",
          self.activeClient.businessId = "",
          self.activeClient.uniqueKeyClient = "",
          self.activeClient.deleted_flag = 0

          self.selectedClient = null
          self.isEditBtn = true
          self.isCreate = false
          self.isEdit = false
          self.cancle = true
          self.clearBtn = false
          self.rightDivBtns = false

          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
          console.log(response.message)
        }
        else {
          self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          console.log(response.error)
          // alert('Some error occurred, please try again!');
        }
      })
    } else {
      // $('#updateClientBtn').button('reset');
      // $('#saveClientBtn').button('reset');
      // $('#updateClientBtn1').button('reset');
      // $('#saveClientBtn1').button('reset');
      // notifications.showError({ message: 'Unable to Save, Client already exist.', hideDelay: 5000, hide: true });
      console.log('Unable to Save, Client already exist.')
    }
  }

  addNew() {
    this.rightDivBtns = false
    this.activeClient.name = ""
    this.activeClient.contactPersonName = ""
    this.activeClient.email = ""
    this.activeClient.number = ""
    this.activeClient.addressLine1 = ""
    this.activeClient.shippingAddress = ""
    this.activeClient.businessDetail = ""
    this.activeClient.businessId = ""
    this.activeClient.deleted_flag = 0

    // form.$setUntouched();
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')

    $('#name').select()
    this.clearBtn = false
    this.isEdit = false
    this.selectedClient = null
    this.inputDisabled = false
    this.isEditBtn = true
    this.isCreate = false
    this.inputReadonly = false
    this.cancle = true
  }

  batchUpload() {
    this.router.navigate(['/client/batch/'])
  }

  deleteClient() {
    this.activeClient.deleted_flag = 1
    this.save(true, null)
  }

  editThis() {
    this.inputReadonly = false;
    this.isEditBtn = true;
    this.rightDivBtns = false;
  }

  viewThis(client, cancelFlag) {
    var index
    this.clientList.subscribe(clients => {
      index = clients.findIndex(cli => cli.uniqueKeyClient == client.uniqueKeyClient)
    })
    
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
    if (!cancelFlag) {
      this.activeClient.uniqueKeyClient = client.uniqueKeyClient,
      this.activeClient.localClientid = client.localClientid,
      this.activeClient.name = client.name,
      this.activeClient.contactPersonName = client.contactPersonName,
      this.activeClient.email = client.email,
      this.activeClient.number = client.number,
      this.activeClient.organizationId = client.organizationId,
      this.activeClient.addressLine1 = client.addressLine1,
      this.activeClient.shippingAddress = client.shippingAddress,
      this.activeClient.businessDetail = client.businessDetail,
      this.activeClient.businessId = client.businessId,
      this.activeClient.deleted_flag = client.enabled
    }
    this.selectedClient = index
    if (!cancelFlag) {
      this.tempClient = {
        "uniqueKeyClient": client.uniqueKeyClient,
        "localClientid": client.localClientid,
        "name": client.name,
        "contactPersonName": client.contactPersonName,
        "email": client.email,
        "organizationId": client.organizationId,
        "number": client.number,
        "addressLine1": client.addressLine1,
        "shippingAddress": client.shippingAddress,
        "businessDetail": client.businessDetail,
        "businessId": client.businessId,
        "deleted_flag": client.enabled
      }
      this.tempClient = this.activeClient
    } else {
      this.activeClient = this.tempClient
    }

    this.tempIndex = index
    this.isEditBtn = false
    this.inputReadonly = true
    this.isEdit = true
    this.isCreate = true
    this.cancle = false
    this.clearBtn = true
    this.rightDivBtns = true
    // $('readonly')
  }

  cancelThis() {
    //activeClient = tempClient ;

    this.isEditBtn = false
    this.inputReadonly = true
    this.rightDivBtns = true
    this.viewThis(this.tempClient, true)
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty');
  }

  clearThis() {
    this.activeClient.name = ""
    this.activeClient.contactPersonName = ""
    this.activeClient.email = ""
    this.activeClient.number = ""
    this.activeClient.addressLine1 = ""
    this.activeClient.shippingAddress = ""
    this.activeClient.businessDetail = ""
    this.activeClient.businessId = ""
    this.activeClient.deleted_flag = 0
    // form.$setUntouched()
    // form.email.$touched = false
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')
  }

  loadMore() {
    this.clientDisplayLimit += 10
  }
}
