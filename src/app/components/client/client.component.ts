import { Component, OnInit } from '@angular/core'
import { ClientService } from '../../services/client.service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../actions/client.action'
import { AppState } from '../../app.state'
import {ToasterService} from 'angular2-toaster';
import { Title }     from '@angular/platform-browser';

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
    setting:any
  }
  clientList: client[]

  public activeClient = <client>{}
  private errors: object = {}
  clientListLoading: boolean = false
  clientDisplayLimit = 12
  sortTerm: string
  searchTerm: string
  repeatativeClientName: string = ''
  hideme = []

  createMode: boolean = true
  editMode: boolean = false
  viewMode: boolean = false
  settings: any;
  emptyClient: boolean;
  searchTerms;
  downArrow = "assets/images/down1.png";
  upArrow = "assets/images/up1.png";
  addClient: boolean;
  
  constructor(public clientService: ClientService,
    public toasterService: ToasterService,
    private titleService: Title,
    private router: Router, private store: Store<AppState>
  ) {
    this.toasterService = toasterService; 
    store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting;
    
     // show more-less button condition depending on height
     jQuery('.expandClicker').each(function(){
      if (jQuery(this).parent().height() < 30) {
        jQuery(this).fadeOut();
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Clients');
    this.clientListLoading = true;
    if(this.clientList.length < 1) {
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        if (response.status === 200) {
          this.clientList = this.removeEmptySpaces(response.records.filter(cli => cli.enabled == 0))
          this.store.dispatch(new clientActions.add(this.clientList))
          //sort in ascending
          this.sortByNameContact(this.clientList);
        }
      },error => this.openErrorModal())
    } else {
      this.removeEmptySpaces(this.clientList)
      //sort in ascending
      this.sortByNameContact(this.clientList);
      this.clientListLoading = false
     }   
  }
  sortByNameContact(value){
    if(value == 'name'){
      this.clientList.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return textA.localeCompare(textB);
      });
    }
    else if(value == 'contactPersonName'){
      this.clientList.sort(function (a, b) {
        if(a.contactPersonName && b.contactPersonName){
        var textA = a.contactPersonName.toUpperCase();
        var textB =  b.contactPersonName.toUpperCase();
        return textA.localeCompare(textB);
        }
      });
    }
    else{
      this.clientList.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return textA.localeCompare(textB);
      });
    }
    
  }

  removeEmptySpaces(data){
    //remove whitespaces from clientlist
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === undefined) {
        data.splice(i, 1);
      }
      if (data[i].name) {
        var tempClient = data[i].name.toLowerCase().replace(/\s/g, "");
        if (tempClient === "") {
          data.splice(i, 1);
        }
      }else if(!data[i].name){
        data.splice(i, 1);
      }
    }
    return data
  }

  save(status, edit) {
    // $('#saveClientBtn1').button('loading')
    // $('#saveClientBtn').button('loading')
    var proStatus = true
    if(this.activeClient.name == undefined){
      this.emptyClient = true
    }

    // If adding or editing client, make sure client with same name doesnt already exist
    if (this.activeClient.name && !this.addClient) {
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
            this.closeItemModel()
          } else if(self.activeClient.enabled !== 0){// delete
           
            self.store.dispatch(new clientActions.remove(storeIndex))
            this.clientList.splice(index, 1)
            this.toasterService.pop('success', 'Client Deleted Successfully !!!');
            this.closeItemModel()
          }
            if(self.activeClient.enabled == 0){    //edit
              self.store.dispatch(new clientActions.edit({index: storeIndex, value: self.clientService.changeKeysForStore(response.clientList[0])}))
              this.clientList[index] = self.clientService.changeKeysForStore(response.clientList[0])
              this.toasterService.pop('success', 'Details Edited Successfully !!!');
              this.closeItemModel()
            }
          self.errors = {}
          // self.activeClient = <client>{}
          // self.createMode = false
          // self.editMode = false
          // self.viewMode = true

          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
        }else if(response.status === 414){
          this.toasterService.pop('failure', 'Sorry Your Subscription Expired ');
        }
        else {
          self.errors = [response.error]
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          //console.log(response.error)
          this.toasterService.pop('failure', 'Some error occurred, please try again!');
        }
      },error => this.openErrorModal())
    } else {
      if (!proStatus) {
        this.toasterService.pop('failure', 'Client name already exists.');
      }
    }
  }

 

  // error modal
  openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }

  emptyField(input){
    if(input.target.value !== ''){
      this.emptyClient = false
    }
  }

  addNew() {
    this.activeClient = <client>{}
    this.addClient = true;

    // form.$setUntouched();
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')

    $('#name').select()
  }

  batchUpload() {
    this.router.navigate(['/client/batch/'])
  }

  deleteClient() {
    this.addClient = true
    this.activeClient.enabled = 1
    this.save(true, null)
  }
  addClientModal() {
    this.editMode = false;
    this.createMode = true;
    this.activeClient = <client>{}
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
    })
  }
  openDeleteClientModal(client) {
    this.activeClient = client
    $('#delete-client').modal('show')
    $('#delete-client').on('shown.bs.modal', (e) => {
      // $('#delete-product input[type="text"]')[1].focus()
    })
  }
  closeItemModel() {
    $('#add-client').modal('hide')
  }

 
  editThis(client) {
    this.addClient = true;
    this.activeClient = client
    // If there are clients with same name in db, Allow them to make changes
    if(this.clientList.filter(cli => cli.name == this.activeClient.name).length > 1) {
      this.repeatativeClientName = this.activeClient.name.toLowerCase().replace(/ /g, '')
    }
    this.editClientModal();
  }

  viewThis(client, cancelFlag=false) {
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
    if (!cancelFlag) {
      this.activeClient = {...client}
    }
  }
  editClientModal() {
    this.editMode = true;
    this.createMode = false;
    $('#add-client').modal('show')
    $('#add-client').on('shown.bs.modal', (e) => {
    })
  }
  

  cancelThis() {
    this.activeClient = {...this.clientList.filter(cli => cli.uniqueKeyClient == this.activeClient.uniqueKeyClient)[0]}

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
