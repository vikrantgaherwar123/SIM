import { Component, OnInit } from '@angular/core';
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
incomingfile(event) 
  {
  this.file= event.target.files[0]; 
  }
  constructor() {
    
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
          // var records = XLSX.utils.sheet_to_json(worksheet,{raw:true});
          // console.log(this.records);
           this.allentires = localStorage.setItem('records', this.records.length);
           }
      fileReader.readAsArrayBuffer(this.file); // readAsArrayBuffer represents the FILES DATA
}
remove(index: any) {
  this.records.push(this.records[index]);
  this.records.splice(index, 1);
}
  ngOnInit() {
    
  }
  
}
