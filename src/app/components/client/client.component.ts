import { Component, OnInit } from '@angular/core'
import { ClientService } from '../../services/client.service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../interface'
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
  clientList: client[]

  private activeClient = <client>{}
  private errors: object = {}
  clientListLoading: boolean = false
  clientDisplayLimit = 12
  sortTerm: string
  searchTerm: string

  private checked: boolean = false
  isCreate: boolean
  private clearBtn: boolean
  private inputDisabled: boolean
  rightDivBtns: boolean = false
  isEditBtn: boolean = true
  cancle: boolean = true
  private inputReadonly: boolean
  private tempClient = null
  private tempIndex = null

  constructor(public clientService: ClientService,
    private router: Router, private store: Store<AppState>
  ) {
    store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
  }

  ngOnInit() {
    this.clientListLoading = true

    if(this.clientList.length < 1) {
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        if (response.status === 200) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(cli => cli.enabled == 0)
        }
      })
    } else {
      this.clientListLoading = false
    }
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

    // If adding or editing client, make sure client with same name doesnt already exist
    if (!this.activeClient.enabled) {
      var tempClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')

      // If empty spaces
      if(!tempClientName) {
        this.activeClient.name = ''
        alert('Organisation name required!')
        return false
      }

      var tempCompare = ''
      if (this.clientList.length > 0) {
        for (var p = 0; p < this.clientList.length; p++) {
          tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempClientName) {
            if(edit == 1) {
              if(this.activeClient.uniqueKeyClient !== this.clientList[p].uniqueKeyClient) {
                proStatus = false
                break
              }
            } else {
              proStatus = false
              break
            }
          }
        }
      }
    }

    if (status && proStatus) {
      this.activeClient.organizationId = parseInt(this.user.user.orgId)
      var d = new Date()
      if (this.activeClient.uniqueKeyClient == "" || typeof this.activeClient.uniqueKeyClient == 'undefined') {
        this.activeClient.uniqueKeyClient = generateUUID(this.user.user.orgId);
      }
      var data = {...this.activeClient, device_modified_on: d.getTime()}
      this.clientListLoading = true
      var self = this

      this.clientService.add([this.clientService.changeKeysForApi(data)]).subscribe((response: any) => {
        // $('#updateClientBtn').button('reset');
        // $('#saveClientBtn').button('reset');
        // $('#updateClientBtn1').button('reset');
        // $('#saveClientBtn1').button('reset');

        if (response.status === 200) {
          self.clientListLoading = false

          // Update store and client list
          let index, storeIndex
          index = self.clientList.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          self.store.select('client').subscribe(clients => {
            storeIndex = clients.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          })

          if (index == -1) {  // add
            self.store.dispatch(new clientActions.add([self.clientService.changeKeysForStore(response.clientList[0])]))
            this.clientList.push(self.clientService.changeKeysForStore(response.clientList[0]))
          } else {
            if (self.activeClient.enabled) {   // delete
              self.store.dispatch(new clientActions.remove(storeIndex))
              this.clientList.splice(index, 1)
              self.inputReadonly = false              
            } else {    //edit
              self.store.dispatch(new clientActions.edit({storeIndex, value: self.clientService.changeKeysForStore(response.clientList[0])}))
              this.clientList[index] = self.clientService.changeKeysForStore(response.clientList[0])
            }
          }
          self.errors = {}
          self.activeClient = <client>{}
          self.isEditBtn = true
          self.isCreate = false
          self.cancle = true
          self.clearBtn = false
          self.rightDivBtns = false

          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
        }
        else {
          self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          console.log(response.error)
          // alert('Some error occurred, please try again!');
        }
      })
    } else {
      if(!proStatus) {
        alert('Client with this name already exists!')
      }
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
    
    this.activeClient = <client>{}

    // form.$setUntouched();
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')

    $('#name').select()
    this.clearBtn = false

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
    this.activeClient.enabled = 1
    this.save(true, null)
  }

  editThis() {
    this.inputReadonly = false;
    this.isEditBtn = true;
    this.rightDivBtns = false;
  }

  viewThis(client, cancelFlag=false) {
    var index = this.clientList.findIndex(cli => cli.uniqueKeyClient == client.uniqueKeyClient)

    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
    if (!cancelFlag) {
      this.activeClient.addressLine1 = client.addressLine1,
      this.activeClient.businessDetail = client.businessDetail,
      this.activeClient.businessId = client.businessId,
      this.activeClient.contactPersonName = client.contactPersonName,
      this.activeClient.email = client.email,
      this.activeClient.enabled = client.enabled,
      this.activeClient.localClientid = client.localClientid,
      this.activeClient.name = client.name,
      this.activeClient.number = client.number,
      this.activeClient.organizationId = client.organizationId,
      this.activeClient.shippingAddress = client.shippingAddress
      this.activeClient.uniqueKeyClient = client.uniqueKeyClient
    }

    if (!cancelFlag) {
      this.tempClient = {
        "addressLine1": client.addressLine1,
        "businessDetail": client.businessDetail,
        "businessId": client.businessId,
        "contactPersonName": client.contactPersonName,
        "deleted_flag": client.enabled,
        "email": client.email,
        "localClientid": client.localClientid,
        "name": client.name,
        "number": client.number,
        "organizationId": client.organizationId,
        "shippingAddress": client.shippingAddress,
        "uniqueKeyClient": client.uniqueKeyClient
      }
      this.tempClient = this.activeClient
    } else {
      this.activeClient = this.tempClient
    }

    this.tempIndex = index
    this.isEditBtn = false
    this.inputReadonly = true
    this.isCreate = true
    this.cancle = false
    this.clearBtn = true
    this.rightDivBtns = true
    // $('readonly')
  }

  cancelThis() {
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
    this.activeClient = <client>{}
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')
  }

  loadMore() {
    this.clientDisplayLimit += 10
  }
}
