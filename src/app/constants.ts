import { Injectable } from '@angular/core';

@Injectable()
export class CONSTANTS {
  BASE_URL: string = 'http://www.simpleinvoiceweb.com/invoice_backend/rest/v1/';
  ACCESS_TOKEN: string = '';
  AUTHENTICATED: Boolean = false;
}