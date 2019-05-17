import { Component, OnInit } from '@angular/core'


import { terms, setting } from '../../../interface'
import { generateUUID } from '../../../globalFunctions'

import { TermConditionService } from '../../../services/term-condition.service'

import { Store } from '@ngrx/store'
import * as tncActions from '../../../actions/terms.action'
import { AppState } from '../../../app.state'
import { ToasterService } from 'angular2-toaster';
import { Title }     from '@angular/platform-browser';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tnc',
  templateUrl: './tnc.component.html',
  styleUrls: ['./tnc.component.css']
})
export class TncComponent implements OnInit {

  tncs: Array<terms> = []
  activeTnc: terms = <terms>{}
  termList: terms[]
  tncLoading: boolean = false

  operation: string = ''

  user: {
    user: {
      orgId: number
    },
    setting: setting
  }
  settings: setting;
  deleteIndex: any;

  constructor(private tncService: TermConditionService,
    public router: Router,
    public toasterService : ToasterService,
    private titleService: Title,
    private store: Store<AppState>
  ) {
    this.toasterService = toasterService,
    
    this.user = JSON.parse(localStorage.getItem('user'))
    this.settings = this.user.setting
    store.select('terms').subscribe(terms => this.termList = terms)
  }

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Terms And Conditions');
    this.tncLoading = true
    this.store.dispatch(new tncActions.reset())
    if(this.termList.length < 1) {
    this.tncService.fetch().subscribe((response: any) => {
      this.tncLoading = false
      this.tncs = response.termsAndConditionList.filter(ter => ter.enabled == 0)
      this.store.dispatch(new tncActions.add(this.tncs))
    },error => this.openErrorModal())}
  }

  save(status) {
    if (status) {
      this.activeTnc.orgId = this.user.user.orgId
      if (!this.activeTnc.uniqueKeyTerms) {
        this.activeTnc.uniqueKeyTerms = generateUUID(this.user.user.orgId)
      }

      var d = new Date()
      this.activeTnc.modifiedOn = d.getTime()
      
      this.tncService.add([this.tncService.changeKeysForApi(this.activeTnc)]).subscribe((response: any) => {
        if (response.status === 200) {
          var changedTnc = this.tncService.changeKeysForStore(response.termsAndConditionList[0])

          if(this.operation == 'edit' || this.operation == 'delete') {
            var index = this.tncs.findIndex(tnc => tnc.uniqueKeyTerms == response.termsAndConditionList[0].unique_identifier)
          }

          // alert, update store, update current var
          switch(this.operation) {
            case 'add':
              this.toasterService.pop('success','Term added successfully')
              //alert('Term added successfully!')
              this.tncs.push(changedTnc)
              this.store.dispatch(new tncActions.add([changedTnc]))
              break
            case 'edit':
              this.toasterService.pop('success','Term edited successfully')
              //alert('Term edited successfully!')
              this.tncs[index] = changedTnc
              this.store.dispatch(new tncActions.edit({index, value: changedTnc}))
              break
            case 'delete':
              this.toasterService.pop('success','Term deleted successfully')
              this.tncs.splice(index, 1)
              this.store.dispatch(new tncActions.remove(index))
              break
            default:
          }
          
          this.activeTnc = <terms>{}
          this.close()
        } else {
          //notifications.showError({message: result.message, hideDelay: 1500,hide: true})
          alert(response.message)
        }
      },error => this.openErrorModal())
    }
  }

   // error modal
   openErrorModal() {
    $('#errormessage').modal('show')
    $('#errormessage').on('shown.bs.modal', (e) => {
    })
  }

  setDeafulTerm(index){
    this.store.select('terms').subscribe(terms => this.termList = terms)
    index = this.tncs.length - (index +1);
    var defaultTerm = this.termList[index]
    if(defaultTerm.setDefault == "DEFAULT"){
      this.operation = 'edit'
      this.activeTnc = {...this.tncs[index]}
      this.activeTnc.setDefault = null;
      this.save(true);
    }else{
      this.operation = 'edit'
      this.activeTnc = {...this.tncs[index]}
      this.activeTnc.setDefault = 'DEFAULT';
      this.save(true);
    }
  }

  add() {
    this.operation = 'add'
    $('#addEditTnc').modal('show')
    this.activeTnc = <terms>{}
  }

  edit(index) {
    index = this.tncs.length - (index +1);
    this.operation = 'edit'
    this.activeTnc = {...this.tncs[index]}
    $('#addEditTnc').modal('show')
  }

  setUnsetDefault() {
    if(this.activeTnc.setDefault == 'DEFAULT') {
      this.activeTnc.setDefault = null
    } else {
      this.activeTnc.setDefault = 'DEFAULT'
    }
  }

  delete() {
    this.deleteIndex = this.tncs.length - (this.deleteIndex +1);
    this.operation = 'delete'
    this.activeTnc = this.tncs[this.deleteIndex]
    this.activeTnc.enabled = 1
    this.save(true)
  }

  openDeleteTermModal(index) {
    this.deleteIndex = index;
    $('#delete-tnc').modal('show')
    $('#delete-tnc').on('shown.bs.modal', (e) => {
      // $('#delete-product input[type="text"]')[1].focus()
    })
  }

  close() {
    $('#addEditTnc').modal('hide')
  }
}
