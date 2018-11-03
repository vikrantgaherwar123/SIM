import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view',
  templateUrl: './viewEst.component.html',
  styleUrls: ['./viewEst.component.css']
})
export class ViewEstComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  loadMore() {
    this.clientDisplayLimit += 10
  }

  downloadEstimate(type) {
    if (type == "download") {
      $('#downloadBtn').attr('disabled', 'disabled')
    }
    else if (type == "preview") {
      $('#previewBtn').attr('disabled', 'disabled')
    }

    this.estimateService.fetchPdf(this.activeEstimate.unique_identifier).subscribe((response: any) => {
      var file = new Blob([response], { type: 'application/pdf' })
      var fileURL = URL.createObjectURL(file)

      var a = window.document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([response], {type: 'application/pdf'}))

      // Append anchor to body.
      document.body.appendChild(a)
      if (type == "download") {
        a.download = this.getFileName(this.activeEstimate.unique_identifier)
        a.click()
        $('#downloadBtn').removeAttr('disabled')
      }
      else if (type == "preview") {
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

    var invoiceNumber = this.activeEst.invoice_number.replace('/', '')
    return 'INVPDF_' + invoiceNumber + '_' + day + month + year + '_' + time + ampm + '.pdf';
  }
}
