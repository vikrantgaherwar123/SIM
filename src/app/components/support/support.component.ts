import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { client, response } from '../../interface'

import { ClientService } from '../../services/client.service'
import { EmailService } from '../../services/email.service'
import { Store } from '@ngrx/store'
import { AppState } from '../../app.state'
import { Title }     from '@angular/platform-browser';


@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  angForm: FormGroup;
  osVersion: {};
  browserName: {};
  browserVersion: {};
  userAgent: {};
  appVersion: {};
  platform: {};
  vendor: {};
  osName : {};
  clientList: client[]
 
  clientListLoading: boolean = false;
  orgMail: any;
  orgName
  subject: string = "Support Mail"
  queryMessage
  user: any;
  

  constructor(public clientService: ClientService,private store: Store<AppState>,
     private fb: FormBuilder,
     private titleService: Title,
    private emailService: EmailService) {
    store.select('client').subscribe(clients => this.clientList = clients.filter(cli => cli.enabled == 0))
    this.user = JSON.parse(localStorage.getItem('user'))
    // console.log(this.user);
    {
        this.createForm();
      }
    
    
   }

   createForm() {
    this.angForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      message: ['', Validators.required],
    });
  }
  

  ngOnInit() {
    this.titleService.setTitle('Simple Invoice | Support');
    this.browser_details();
  }

  sendMail() {
    this.emailService.sendEmail(this.orgMail, this.orgName, this.subject, this.queryMessage)
  } 

  browser_details() {
    // 'use strict';
    
    var module = {
        options: [],
        header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor],
        dataos: [
            { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
            { name: 'Windows', value: 'Win', version: 'NT' },
            { name: 'iPhone', value: 'iPhone', version: 'OS' },
            { name: 'iPad', value: 'iPad', version: 'OS' },
            { name: 'Kindle', value: 'Silk', version: 'Silk' },
            { name: 'Android', value: 'Android', version: 'Android' },
            { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
            { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
            { name: 'Macintosh', value: 'Mac', version: 'OS X' },
            { name: 'Linux', value: 'Linux', version: 'rv' },
            { name: 'Palm', value: 'Palm', version: 'PalmOS' }
        ],
        databrowser: [
            { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
            { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
            { name: 'Safari', value: 'Safari', version: 'Version' },
            { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
            { name: 'Opera', value: 'Opera', version: 'Opera' },
            { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
            { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
        ],
        init: function () {
            var agent = this.header.join(' '),
                os = this.matchItem(agent, this.dataos),
                browser = this.matchItem(agent, this.databrowser);
            
            return { os: os, browser: browser };
        },
        matchItem: function (string, data) {
            var i = 0,
                j = 0,
                html = '',
                regex,
                regexv,
                match,
                matches,
                version;
            
            for (i = 0; i < data.length; i += 1) {
                regex = new RegExp(data[i].value, 'i');
                match = regex.test(string);
                if (match) {
                    regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                    matches = string.match(regexv);
                    version = '';
                    if (matches) { if (matches[1]) { matches = matches[1]; } }
                    if (matches) {
                        matches = matches.split(/[._]+/);
                        for (j = 0; j < matches.length; j += 1) {
                            if (j === 0) {
                                version += matches[j] + '.';
                            } else {
                                version += matches[j];
                            }
                        }
                    } else {
                        version = '0';
                    }
                    return {
                        name: data[i].name,
                        version: parseFloat(version)
                    };
                }
            }
            return { name: 'unknown', version: 0 };
        }
    };
    
    var e = module.init(),
        debug = '';
    this.orgMail = this.user.registered_email
    this.osName = e.os.name  
    this.osVersion = e.os.version
    this.browserName =  e.browser.name
    this.browserVersion = e.browser.version

    this.userAgent = navigator.userAgent
    this.appVersion = navigator.appVersion
    this.platform = navigator.platform
    this.vendor = navigator.vendor
    
    debug += 'os.name = ' + e.os.name + '<br/>';
    debug += 'os.version = ' + e.os.version + '<br/>';
    debug += 'browser.name = ' + e.browser.name + '<br/>';
    debug += 'browser.version = ' + e.browser.version + '<br/>';
    
    debug += '<br/>';
    debug += 'navigator.userAgent = ' + navigator.userAgent + '<br/>';
    debug += 'navigator.appVersion = ' + navigator.appVersion + '<br/>';
    debug += 'navigator.platform = ' + navigator.platform + '<br/>';
    debug += 'navigator.vendor = ' + navigator.vendor + '<br/>';
    
    // document.getElementById('log').innerHTML = debug;
};

}
