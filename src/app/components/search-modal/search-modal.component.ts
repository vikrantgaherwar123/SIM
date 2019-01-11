import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms'
import { response, client } from '../../interface'
import { Router } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { ClientService } from '../../services/client.service'
import { SearchService } from '../../services/search.service';
import * as clientActions from '../../actions/client.action'
@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css']
})
export class SearchModalComponent implements OnInit {

  private clientList: client[]
  clientListLoading: boolean

  
  private invoiceQueryForm = {
    client: new FormControl()
    // dateRange: {
    //   start: new FormControl(),
    //   end: new FormControl(new Date())
    // }
  }
  // changingQuery: boolean = false

  
  constructor(public router: Router,
    private searchService: SearchService,
    private clientService: ClientService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.fetchClients()
    this.openSearchClientModal()
  }

  fetchClients(){
    this.clientListLoading = true
      this.clientService.fetch().subscribe((response: response) => {
        this.clientListLoading = false
        if (response.records) {
          this.store.dispatch(new clientActions.add(response.records))
          this.clientList = response.records.filter(recs => recs.enabled == 0)
          var obj = {};
          //You can filter based on Id or Name based on the requirement
          var uniqueClients = this.clientList.filter(function (item) {
            if (obj.hasOwnProperty(item.name)) {
              return false;
            } else {
              obj[item.name] = true;
              return true;
            }
          });
          this.clientList = uniqueClients;
        }
      })
  }


  showSelectedInvoices(client){
    this.searchService.setUserData(client);
    this.router.navigate([`invoice/view`])
    $('#search-client').modal('hide')
  }

  
  openSearchClientModal() {
    $('#search-client').modal('show')
  }

  closeSearchModel() {
    $('#search-client').modal('hide')
    this.router.navigate(['/invoice/add'])
  }
}
