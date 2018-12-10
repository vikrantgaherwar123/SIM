import { Component, OnInit } from '@angular/core'
import { ClientService } from '../../services/client.service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../actions/client.action'
import { AppState } from '../../app.state'
import {ToasterService} from 'angular2-toaster';


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
  repeatativeClientName: string = ''

  createMode: boolean = true
  editMode: boolean = false
  viewMode: boolean = false

  constructor(public clientService: ClientService,
    public toasterService: ToasterService,
    private router: Router, private store: Store<AppState>
  ) {
    this.toasterService = toasterService; 
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
        this.toasterService.pop('failure', 'Organization name required');
        return false
      }

      var tempCompare = ''
      if (this.clientList.length > 0) {
        for (var p = 0; p < this.clientList.length; p++) {
          tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempClientName) {
            if(edit == 1) {
              if(this.activeClient.uniqueKeyClient !== this.clientList[p].uniqueKeyClient && tempClientName !== this.repeatativeClientName) {
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
      this.repeatativeClientName = ''
    }

    if (status && proStatus) {
      this.activeClient.organizationId = parseInt(this.user.user.orgId)
      var d = new Date()
      if (!this.activeClient.uniqueKeyClient) {
        this.activeClient.uniqueKeyClient = generateUUID(this.user.user.orgId);
      }
      if(!this.activeClient.deviceCreatedDate) {
        this.activeClient.deviceCreatedDate = d.getTime()
      }
      this.activeClient.modifiedDate = d.getTime()
      var data = {...this.activeClient}
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
            this.toasterService.pop('success', 'Client Saved Successfully !!!');
          } else {
            if (self.activeClient.enabled) {   // delete
              self.store.dispatch(new clientActions.remove(storeIndex))
              this.clientList.splice(index, 1)
              this.toasterService.pop('success', 'Client Deleted Successfully !!!');
            } else {    //edit
              self.store.dispatch(new clientActions.edit({storeIndex, value: self.clientService.changeKeysForStore(response.clientList[0])}))
              this.clientList[index] = self.clientService.changeKeysForStore(response.clientList[0])
              this.toasterService.pop('success', 'Details Edited Successfully !!!');
            }
          }
          self.errors = {}
          // self.activeClient = <client>{}
          self.createMode = false
          self.editMode = false
          self.viewMode = true

          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
        }
        else {
          self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          //console.log(response.error)
          this.toasterService.pop('failure', 'Some error occurred, please try again!');
        }
      })
    } else {
      if(!proStatus) 
      {
        this.toasterService.pop('failure', 'Client name already exists.');
      }
      
          }
  }

  addNew() {
    this.activeClient = <client>{}

    // form.$setUntouched();
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')

    $('#name').select()
    this.createMode = true
    this.editMode = false
    this.viewMode = false
  }

  batchUpload() {
    this.router.navigate(['/client/batch/'])
  }

  deleteClient() {
    this.activeClient.enabled = 1
    this.save(true, null)
  }

  editThis() {
    // If there are clients with same name in db, Allow them to make changes
    if(this.clientList.filter(cli => cli.name == this.activeClient.name).length > 1) {
      this.repeatativeClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')
    }

    this.createMode = false
    this.editMode = true
    this.viewMode = false
  }

  viewThis(client, cancelFlag=false) {
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
    if (!cancelFlag) {
      this.activeClient = {...client}
    }

    this.createMode = false
    this.editMode = false
    this.viewMode = true
  }

  cancelThis() {
    this.activeClient = {...this.clientList.filter(cli => cli.uniqueKeyClient == this.activeClient.uniqueKeyClient)[0]}

    this.createMode = false
    this.editMode = false
    this.viewMode = true
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
