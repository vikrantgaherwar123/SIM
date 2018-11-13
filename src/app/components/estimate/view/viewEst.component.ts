import { Component, OnInit } from '@angular/core'
import { EstimateService } from '../../../services/estimate.service'
import { ClientService } from '../../../services/client.service'
import { response, estimate, client } from '../../../interface'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'

import { Store } from '@ngrx/store'
import * as estimateActions from '../../../actions/estimate.action'
import * as clientActions from '../../../actions/client.action'
import { AppState } from '../../../app.state'
import { Router } from '@angular/router'

@Component({
  selector: 'app-view',
  templateUrl: './viewEst.component.html',
  styleUrls: ['./viewEst.component.css']
})
export class ViewEstComponent implements OnInit {

  estimateList: estimate[]
  activeEst: estimate
  private activeEstId: string
  estListLoader: boolean = false
  estDispLimit: number = 20
  estSortTerm: string
  estSearchTerm: string

  private estimateQueryForm = {
    client: new FormControl(),
    dateRange: {
      start: new FormControl(),
      end: new FormControl(new Date())
    }
  }
  changingQuery: boolean = false

  private clientList: client[]
  private activeClient: client
  filteredClients: Observable<string[] | client[]>

  private setting: any

  constructor(private estimateService: EstimateService, private clientService: ClientService,
    private store: Store<AppState>,
    public router: Router
  ) {
    store.select('client').subscribe(clients => this.clientList = clients)
    // store.select('globals').subscribe(globals => {
    //   if (Object.keys(globals.estimateQueryForm).length > 0) {
    //     this.estimateQueryForm = globals.estimateQueryForm
    //   }
    // })
    this.setting = JSON.parse(localStorage.getItem('user')).setting
  }

  ngOnInit() {
    // Fetch clients if not in store
    if (this.clientList.length < 1) {
      this.clientService.fetch().subscribe((response: response) => {
        this.store.dispatch(new clientActions.add(response.records))
      })
    }

    // Set Active estimate whenever estimate list changes
    this.store.select('estimate').subscribe(estimates => {
      if(estimates.length > 0) {
        this.estimateList = estimates
        this.setActiveEst()
      } else {
        this.estListLoader = true
        this.estimateService.fetch().subscribe((response: any) => {
          this.estListLoader = false
          var records = (response.records ? response.records.filter(rec => rec.enabled == 0) : [])
          this.store.dispatch(new estimateActions.add(records))
          this.estimateList = records
          this.setActiveEst()
        })
      }
    })
  }

  loadMore() {
    this.estDispLimit += 10
  }

  goEdit(estId) {
    this.router.navigate([`estimate/edit/${estId}`])
  }

  // Search Estimate Functions
  // SearchEstimate() {
  //   var query = {
  //     clientIdList: [],
  //     startTime: 0,
  //     endTime: 0
  //   }

  //   if (this.estimateQueryForm.client.value && this.estimateQueryForm.client.value.length > 0) {
  //     query.clientIdList = this.estimateQueryForm.client.value.map(cli => cli.uniqueKeyClient)
  //     if (query.clientIdList[0] == null) {
  //       query.clientIdList = null
  //       this.estimateQueryForm.client.reset([{ name: 'All' }])
  //     }
  //   } else {
  //     query.clientIdList = null
  //     this.estimateQueryForm.client.reset([{ name: 'All' }])
  //   }
  //   if (this.estimateQueryForm.dateRange.start.value) {
  //     query.startTime = this.estimateQueryForm.dateRange.start.value.getTime()
  //   }
  //   if (this.estimateQueryForm.dateRange.end.value) {
  //     query.endTime = this.estimateQueryForm.dateRange.end.value.getTime()
  //   } else {
  //     query.endTime = new Date().getTime()
  //   }
  //   this.store.dispatch(new globalActions.add({ estimateQueryForm: this.estimateQueryForm }))
  //   this.fetchEstimates(query)
  //   this.changingQuery = false
  // }

  getNames() {
    return this.estimateQueryForm.client.value.reduce((a, b) => a + b.name + ', ', '')
  }

  // fetchEstimates(query = null) {
  //   // Fetch estimates with given query
  //   if (query == null) {
  //     query = {
  //       clientIdList: null,
  //       startTime: 0,
  //       endTime: new Date().getTime()
  //     }
  //   }

  //   this.estListLoader = true
  //   this.estimateService.fetch().subscribe((response: any) => {
  //     if (response.status === 200) {
  //       this.store.dispatch(new estimateActions.add(response.records ? response.records.filter(rec => rec.deleted_flag == 0) : []))
  //       // this.setActiveEst()
  //     }
  //     this.estListLoader = false
  //   })
  // }

  setActiveEst(estId: string = '') {
    this.activeEstId = estId
    if (!this.activeEstId) {
      this.activeEst = this.estimateList[0]
      if (this.activeEst) {
        this.activeEstId = this.activeEst.unique_identifier
      }
    } else {
      this.activeEst = this.estimateList.filter(est => est.unique_identifier == this.activeEstId)[0]
    }
    this.setActiveClient()
  }

  setActiveClient() {
    if (this.activeEst) {
      var client = this.clientList.filter(client => client.uniqueKeyClient == this.activeEst.unique_key_fk_client)[0]
      if (client) {
        this.activeClient = client
      } else {
        this.activeClient = null
      }
    }
  }

  downloadEstimate(type) {
    if (type == "download") {
      $('#downloadBtn').attr('disabled', 'disabled')
    } else if (type == "preview") {
      $('#previewBtn').attr('disabled', 'disabled')
    }

    this.estimateService.fetchPdf(this.activeEst.unique_identifier).subscribe((response: any) => {
      var file = new Blob([response], { type: 'application/pdf' })

      var a = window.document.createElement('a')
      a.href = window.URL.createObjectURL(file)

      document.body.appendChild(a)
      if (type == "download") {
        a.download = this.getFileName()
        a.click()
        $('#downloadBtn').removeAttr('disabled')
      } else if (type == "preview") {
        window.open(a.toString())
        $('#previewBtn').removeAttr('disabled')
      }
    })
  }

  getFileName() {
    var d = new Date()

    var day = d.getDate() <= 9 ? '0' + d.getDate() : d.getDate()
    var month = d.toString().split(' ')[1]
    var year = d.getFullYear()
    var time = getTime()

    function getTime() {
      var hour = d.getHours() < 13 ? d.getHours().toString() : (d.getHours() - 12).toString()
      hour = parseInt(hour) < 10 ? '0' + hour : hour
      var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      return hour + min
    }

    var ampm = d.getHours() < 12 ? 'AM' : 'PM';

    var estimateNumber = this.activeEst.quetationNo.replace('/', '')
    return 'ESTPDF_' + estimateNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
  }
}
