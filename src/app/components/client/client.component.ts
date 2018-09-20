import { Component, OnInit } from '@angular/core'
import { ClientService } from '../../services/client.service'
import { CookieService } from 'ngx-cookie-service'
import { generateUUID } from '../../globalFunctions'
import { Router } from '@angular/router';

interface response {
  status: number,
  records: Array<{}>,
  message: string,
  error: string
}

interface repo {
  value: string,
  name: string
}
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
  private clientList: Array<{}> = []
  private data = {
    client: {
      name: "",
      contact_person_name: "",
      email: "",
      number: "",
      address_line1: "",
      shipping_address: "",
      business_detail: "",
      business_id: "",
      organization_id: "",
      unique_identifier: "",
      device_modified_on: 0,
      deleted_flag: 0
    }
  }
  private errors: object = {}
  private clientListsLoader: boolean

  private selectedClient = null
  private clientDisplayLimit = 12
  
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

  private classes = [
    "red",
    "blue",
    "yellow",
    "green",
    "orange",
    "fineblue",
    "purple"
  ];
  private checked = false
  private filterClient: {name: string} = {name: ''}
  private isNone: boolean
  private isByClient: boolean
  private isByDate: boolean
  private order: {
    sortClient: string
  } = {sortClient: 'name'}
  private clientListLoader: boolean

  constructor(public clientService: ClientService, private cookie: CookieService, private router: Router) {
    this.user = JSON.parse(this.cookie.get('user'))
  }

  ngOnInit() {
    this.clientListLoader = false
    this.clientService.fetchClients().subscribe((response: response) => {
      if (response.status === 200) {
        this.clientListLoader = true
        this.clientList = response.records
      }
    })
  }

  toggle() {
    this.checked = !this.checked
  }

  isStatus(client) {
    return (client.enabled == 0);
  }

  setSortClients(searchfield) {
    this.filterClient = {name: ''}
    if (searchfield == 'id') {
      this.isNone = true;
      this.isByClient = false;
      this.isByDate = false;
    } else if (searchfield == 'name') {
      this.isNone = false;
      this.isByClient = true;
      this.isByDate = false;
    } else if (searchfield == 'contact_person_name') {
      this.isNone = false;
      this.isByClient = false;
      this.isByDate = true;
    }
    this.order.sortClient = searchfield;
    this.selectedClient = -1;
  }

  dynamicOrder(client) {
    var order = 0;
    switch (this.order.sortClient) {
      case 'name':
        order = client.name;
        break;

      case 'contact_person_name':
        order = client.contactPersonName;
        break;

      default:
        order = -(parseInt(client.deviceCreatedDate));
    }

    return order;
  }

  // $('input').on('focus', function() {
  //   $(this).prev().addClass('focused-icon');
  //   $(this).prev().css({ "color": "#176cc1" });
  //   $(this).addClass('focused-input');
  // });
  // $('input').on('blur', function() {
  //   $(this).prev().removeClass('focused-icon');
  //   $(this).prev().css({ "color": "#555" });
  //   $(this).removeClass('focused-input');
  // });
  // panCardRegex = '^[0-9?=.*!@#$%^&*,.-]+$';

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

  save(data, status, edit) {
    // $('#saveClientBtn1').button('loading')
    // $('#saveClientBtn').button('loading')
    var proStatus = true
    if (edit == 1) {
      // $('#updateClientBtn1').button('loading')
      // $('#updateClientBtn').button('loading')

      var tempClientName = this.data.client.name.toLowerCase().replace(/ /g, '')
      //console.log("temp pro name" , tempProName)
      var tempCompare = ''
      if (this.clientList) {
        for (var p = 0; p < this.clientList.length; p++) {

          tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempClientName) {
            proStatus = false
            break
          }
        }
      } else {
        proStatus = true;
      }
    } else if (edit == 2) {
      var tempClientName = this.data.client.name.toLowerCase().replace(/ /g, '')
      var tempCompare = ''
      if (this.clientList) {
        for (var p = 0; p < this.clientList.length; p++) {
          tempCompare = this.clientList[p].name.toLowerCase().replace(/ /g, '')
          if (tempCompare === tempClientName) {
            if (data.client.unique_identifier !== this.clientList[p].uniqueKeyClient) {
              proStatus = false;
              break
            }
          }
        }
      } else {
        proStatus = true
      }
    } else {
      proStatus = true
    }
    if (status && proStatus) {
      this.data.client.organization_id = this.user.user.orgId
      var d = new Date()
      if (data.client.unique_identifier == "" || typeof data.client.unique_identifier == 'undefined') {
        this.data.client.unique_identifier = generateUUID(this.user.user.orgId);
      }
      this.data.client.device_modified_on = d.getTime();
      var self = this
      this.clientService.addClient([this.data.client]).subscribe(function (response: response) {
        // $('#updateClientBtn').button('reset');
        // $('#saveClientBtn').button('reset');
        // $('#updateClientBtn1').button('reset');
        // $('#saveClientBtn1').button('reset');
        if (response.status === 200) {
          self.data.client = {
            name: "",
            contact_person_name: "",
            email: "",
            number: "",
            address_line1: "",
            shipping_address: "",
            business_detail: "",
            business_id: "",
            unique_identifier: "",
            deleted_flag: 0
          }
          self.clientListsLoader = false
          self.clientService.fetchClients().subscribe((response: response) => {
            self.clientListsLoader = true
            self.clientList = response.records
            self.selectedClient = 'none'

            self.repos = response.records.map((repo:repo) => {
              repo.value = repo.name.toLowerCase();
              return repo;
            })
            // this.repos.sort(compare);
            // repos = repos.filter(function (clien) {
            //   return (clien.enabled == 0);
            // });
            // DataStore.addClientsList(repos);
            // DataStore.addUnSortedClient(clientList);
          });
          self.errors = {};

          // notifications.showSuccess({ message: response.message, hideDelay: 1500, hide: true });
          console.log(response.message)

          self.selectedClient = null;
          self.isEditBtn = true;
          self.isCreate = false;
          self.isEdit = false;
          self.cancle = true;
          self.clearBtn = false;
          self.rightDivBtns = false;
        }
        else {
          self.errors = [response.error];
          // notifications.showError({ message: 'Some error occurred, please try again!', hideDelay: 1500, hide: true });
          console.log(response.error)
          // alert('Some error occurred, please try again!');
        }

      });
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
    this.filterClient = {name: ''}

    this.rightDivBtns = false
    this.data.client.name = ""
    this.data.client.contact_person_name = ""
    this.data.client.email = ""
    this.data.client.number = ""
    this.data.client.address_line1 = ""
    this.data.client.shipping_address = ""
    this.data.client.business_detail = ""
    this.data.client.business_id = ""
    this.data.client.deleted_flag = 0

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
    this.filterClient = {name: ''}

    this.data.client.deleted_flag = 1
    this.save(this.data, true, null)
    var self = this
    this.clientService.fetchClients().subscribe(function (response: response) {
      self.clientListsLoader = true
      self.clientList = response.records
      self.selectedClient = 'none'
    })
  }

  editThis() {
    this.filterClient = {name: ''}
    this.inputReadonly = false;
    this.isEditBtn = true;
    this.rightDivBtns = false;
  }

  viewThis(client, index, cancelFlag) {
    this.filterClient = {name: ''}
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
    if (!cancelFlag) {
      this.data.client.unique_identifier = client.uniqueKeyClient,
      this.data.client._id = client.localClientid,
      this.data.client.name = client.name,
      this.data.client.contact_person_name = client.contactPersonName,
      this.data.client.email = client.email,
      this.data.client.number = client.number,
      this.data.client.organization_id = client.organizationId,
      this.data.client.address_line1 = client.addressLine1,
      this.data.client.shipping_address = client.shippingAddress,
      this.data.client.business_detail = client.businessDetail,
      this.data.client.business_id = client.businessId,
      this.data.client.deleted_flag = client.enabled
    }
    this.selectedClient = index
    if (!cancelFlag) {
      this.tempClient = {
        "unique_identifier": client.uniqueKeyClient,
        "_id": client.localClientid,
        "name": client.name,
        "contact_person_name": client.contact_person_name,
        "email": client.email,
        "organization_id": client.organizationId,
        "number": client.number,
        "address_line1": client.address_line1,
        "shipping_address": client.shipping_address,
        "business_detail": client.business_detail,
        "business_id": client.business_id,
        "deleted_flag": client.enabled
      };
      this.tempClient = this.data.client
    } else {
      this.data.client = this.tempClient
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
    //data.client = tempClient ;

    this.isEditBtn = false
    this.inputReadonly = true
    this.rightDivBtns = true
    this.viewThis(this.tempClient, this.tempIndex, true)
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error');
    }
    $('#emailLabel').addClass('is-empty');
  }

  clearThis() {
    this.data.client.name = ""
    this.data.client.contact_person_name = ""
    this.data.client.email = ""
    this.data.client.number = ""
    this.data.client.address_line1 = ""
    this.data.client.shipping_address = ""
    this.data.client.business_detail = ""
    this.data.client.business_id = ""
    this.data.client.deleted_flag = 0
    // form.$setUntouched()
    // form.email.$touched = false
    if ($('#emailLabel').hasClass('has-error')) {
      $('#emailLabel').removeClass('has-error')
    }
    $('#emailLabel').addClass('is-empty')
  }

  loadMore() {
    this.clientDisplayLimit += 10;
  }
}
