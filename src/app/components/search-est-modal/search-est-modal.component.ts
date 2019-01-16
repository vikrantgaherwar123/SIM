import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { response, client } from '../../interface'
import { AppState } from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { SearchEstService } from '../../services/search-est.service';
import { ClientService } from '../../services/client.service'
import * as clientActions from '../../actions/client.action'


@Component({
  selector: 'app-search-est-modal',
  templateUrl: './search-est-modal.component.html',
  styleUrls: ['./search-est-modal.component.css']
})
export class SearchEstModalComponent implements OnInit {
  private clientList: client[]
  clientListLoading: boolean

  private estimateQueryForm = {
    client: new FormControl()
    // dateRange: {
    //   start: new FormControl(),
    //   end: new FormControl(new Date())
    // }
  }

  constructor(public router: Router,
    private searchEstService: SearchEstService,
    private clientService: ClientService,
    private store: Store<AppState>) {
    
      // to hide modal/go back to add page after browser back button clicked
    $(window).on('popstate', function(event) {
      $('#search-client').modal('hide')
     });
     }

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

  showSelectedEstimate(client){
    this.searchEstService.setUserData(client);
    this.router.navigate([`estimate/view`])
    $('#search-client').modal('hide')
  }

  
  openSearchClientModal() {
    $('#search-client').modal('show')
  }

  closeEstSearchModel() {
    $('#search-client').modal('hide')
    this.router.navigate(['estimate/add'])
  }
}
