import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service'
import { generateUUID } from '../../../globalFunctions'
import { Router } from '@angular/router'

import { client, response } from '../../../interface'
import { Store } from '@ngrx/store'
import * as clientActions from '../../../actions/client.action'
import { AppState } from '../../../app.state'
import { ToasterService } from 'angular2-toaster';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-batchupload',
  templateUrl: './batchupload.component.html',
  styleUrls: ['./batchupload.component.css']
})
export class BatchuploadComponent implements OnInit {
  arrayBuffer: any;
  file: File;
  records: any;
  errors: {};
  incomingfile(event) {
    this.file = event.target.files[0];
  }

  // client starts
  clientList: client[]
  private user: {
    user: {
      orgId: string
    }
  }
  addClient: boolean = false
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
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.records = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    }
    fileReader.readAsArrayBuffer(this.file); // readAsArrayBuffer represents the FILES DATA
  }


  remove(index) {
    this.records.splice(index, 1);
  }
  ngOnInit() {

  }

  update() {
    // localStorage.setItem("uploadFile", JSON.stringify(this.records));
    // var ExcelRecords = {};
    // ExcelRecords = localStorage.getItem("uploadFile")
    // console.log(ExcelRecords);
    
    for(let i =0 ; i<this.records.length;i++){
      //add required input params for api call
      this.records[i].enabled = 0 ;
      this.records[i].organizationId = parseInt(this.user.user.orgId);
      this.records[i].uniqueKeyClient = generateUUID(this.user.user.orgId);
      var d = new Date()
      this.records[i].deviceCreatedDate = d.getTime()
      this.records[i].modifiedDate = d.getTime()
      this.clientService.add([this.clientService.changeKeysForApi(this.records[i])]).subscribe((response: any) => {
      if (response.status === 200) {
        // Update store and client list
        let index, storeIndex
          index = this.clientList.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          // storeIndex is used if user want to delete some record right we havent used it
          this.store.select('client').subscribe(clients => {
            storeIndex = clients.findIndex(client => client.uniqueKeyClient == response.clientList[0].unique_identifier)
          })
          
        if (index == -1) {  // add
            this.store.dispatch(new clientActions.add([this.clientService.changeKeysForStore(response.clientList[0])]))
            this.clientList.push(this.clientService.changeKeysForStore(response.clientList[0]))
            this.toasterService.pop('success', 'Clients Saved Successfully !!!');
          }
        console.log("Success");
        // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
      } else if (response.status === 414) {
        this.toasterService.pop('failure', 'Sorry Your Subscription Expired ');
      }
      else {
        // self.errors = [response.error]
        // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
        //console.log(response.error)
        this.toasterService.pop('failure', 'Some error occurred, please try again!');
      }
    })
  }
  }
}
