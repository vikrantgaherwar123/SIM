import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service'
import { generateUUID } from '../../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../../actions/client.action'
import { AppState } from '../../../app.state'
import {ToasterService} from 'angular2-toaster';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-batchupload',
  templateUrl: './batchupload.component.html',
  styleUrls: ['./batchupload.component.css']
})
export class BatchuploadComponent implements OnInit {
arrayBuffer:any;
file:File;
records : any;
editField: string;
allentires: any;
errors: {};
incomingfile(event) 
  {
  this.file= event.target.files[0]; 
  }

  // client starts
  clientList: client[]
  private activeClient = <client>{}
  repeatativeClientName: string = ''
  private user: {
    user: {
      orgId: string
    }
  }
  createMode: boolean = true
  editMode: boolean = false
  viewMode: boolean = false
  deleteclient:boolean = false
  // client ends
  constructor(public clientService: ClientService,
    public toasterService: ToasterService,
    private router: Router, private store: Store<AppState>) {
      
      store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
      this.user = JSON.parse(localStorage.getItem('user'))
   }
   Upload() {
    let fileReader = new FileReader();
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          this.records = XLSX.utils.sheet_to_json(worksheet,{raw:true});
          console.log();
          
          // var records = XLSX.utils.sheet_to_json(worksheet,{raw:true});
          // console.log(this.records);
          this.allentires = localStorage.getItem('records');
           this.allentires = localStorage.setItem('records', this.records.length);
           }
      fileReader.readAsArrayBuffer(this.file); // readAsArrayBuffer represents the FILES DATA
}
remove(id: any) {
  this.records.pop(this.records[id]);
  this.records.splice(id, 1);
}
  ngOnInit() {

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
      // this.clientListLoading = true
      var self = this

      this.clientService.add([this.clientService.changeKeysForApi(data)]).subscribe((response: any) => {
        // $('#updateClientBtn').button('reset');
        // $('#saveClientBtn').button('reset');
        // $('#updateClientBtn1').button('reset');
        // $('#saveClientBtn1').button('reset');

        if (response.status === 200) {
          // self.clientListLoading = false

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
              self.store.dispatch(new clientActions.edit({index: storeIndex, value: self.clientService.changeKeysForStore(response.clientList[0])}))
              this.clientList[index] = self.clientService.changeKeysForStore(response.clientList[0])
              //console.log(this.clientList[index]);
              this.toasterService.pop('success', 'Details Edited Successfully !!!');
            }
          }
          self.errors = {}
          // self.activeClient = <client>{}
          self.createMode = false
          self.editMode = false
          self.viewMode = true

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
      })
    } else {
      if(!proStatus) 
      {
        this.toasterService.pop('failure', 'Client name already exists.');
      }
      
          }
  }
  
}
