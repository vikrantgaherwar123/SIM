import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service'

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  private clientList: []
  constructor(private clientService: ClientService) { }

  ngOnInit() {
    this.clientService.fetchClients().subscribe((response) => {
      if(response.status === 200) {
        this.clientList = response.records
      }
    })
  }

}
