import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private fetchUrl = ''
  private fetchByIdUrl = ''
  private fetchByQueryUrl = ''
  private addUrl = ''
  private fetchPdfUrl = ''
  private user: {
    access_token: string
  }

  constructor(private http: HttpClient, private CONST: CONSTANTS, private cookie: CookieService) { 
    this.fetchUrl = `${CONST.BASE_URL}invoice_data/pull/invoice`
    this.fetchByIdUrl = `${CONST.BASE_URL}invoice_data/pull/invoice/byId`
    this.fetchByQueryUrl = `${CONST.BASE_URL}invoice_data/pull/invoice/cientId`
    this.addUrl = `${CONST.BASE_URL}invoice_data/add/invoice`
    this.fetchPdfUrl = `${CONST.BASE_URL}pdf/invoice/`

    this.user = this.cookie.get('user') ? JSON.parse(this.cookie.get('user')) : {}
  }

  fetch() {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token,
        "lastEpoch": '0'
      })
    }

    return this.http.get(this.fetchUrl, headers)
  }

  fetchById(idList) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.fetchByIdUrl, {"idList": idList}, headers)
  }

  fetchByQuery(query) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.fetchByQueryUrl, query, headers)
  }

  add(invoice) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, invoice, headers)
  }

  fetchPdf(id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      })
    }

    return this.http.get(`${this.fetchPdfUrl}${id}`, headers)
  }

  changeKeysForStore(data) {
    var tempInvoice = data
    var tempItemList = []
    var tempTermList = []
    var tempPaymentList = []
    for (var j = 0; j < data.listItems.length; j++) {
      var temp: any = {
        'uniqueKeyListItem': data.listItems[j].unique_identifier,
        'productName': data.listItems[j].product_name,
        'description': data.listItems[j].description == null ? '' : data.listItems[j].description,
        'qty': data.listItems[j].quantity,
        'unit': data.listItems[j].unit,
        'rate': data.listItems[j].rate,
        'discountRate': data.listItems[j].discount,
        'tax_rate': data.listItems[j].tax_rate,
        'price': data.listItems[j].total,
        'taxAmount': data.listItems[j].tax_amount,
        'discountAmount': data.listItems[j].discount_amount,
        'uniqueKeyFKProduct': data.listItems[j].unique_key_fk_product,
        'unique_identifier': data.unique_key_fk_invoice,
        'listItemId': data.listItems[j]._id,
        'prodId': data.listItems[j].local_prod_id,
        'org_id': data.listItems[j].organization_id,
        'invoiceProductCode': data.listItems[j].invoiceProductCode,
        'uniqueKeyFKInvoice': data.listItems[j].unique_key_fk_invoice
      }
      tempItemList.push(temp)
    }
    tempInvoice.listItems = tempItemList

    if (data.termsAndConditions && data.termsAndConditions.length > 0) {
      for (var i = 0; i < data.termsAndConditions.length; i++) {
        var temp: any = {
          "terms": data.termsAndConditions[i].terms_condition,
          "localId": data.termsAndConditions[i]._id,
          "invoiceId": data.termsAndConditions[i].local_invoiceId,
          "serverInvoiceId": data.termsAndConditions[i].invoice_id,
          "serverOrgId": data.termsAndConditions[i].organization_id,
          "uniqueInvoiceTerms": data.termsAndConditions[i].unique_identifier,
          "uniqueKeyFKInvoice": data.termsAndConditions[i].unique_key_fk_invoice
        }
        tempTermList.push(temp)
      }
      tempInvoice.termsAndConditions = tempTermList
    }

    if (data.payments && data.payments.length > 0) {
      for (var i = 0; i < data.payments.length; i++) {
        var temp: any = {
          "dateOfPayment": data.payments[i].date_of_payment,
          "paidAmount": data.payments[i].paid_amount,
          "orgId": data.payments[i].organization_id,
          "uniqueKeyInvoicePayment": data.payments[i].unique_identifier,
          "uniqueKeyFKClient": data.payments[i].unique_key_fk_client,
          "uniqueKeyFKInvoice": data.payments[i].unique_key_fk_invoice,
          "enabled": data.payments[i].deleted_flag,
          "uniqueKeyVoucherNo": data.payments[i].unique_key_voucher_no,
          "voucherNo": data.payments[i].voucher_no,
          "invPayId": data.payments[i]._id,
          "invoiceId": data.payments[i].local_invoice_id,
          "clientId": data.payments[i].local_client_id,
          "paymentNote": data.payments[i].paymentNote
        }
        tempPaymentList.push(temp)
      }
      tempInvoice.payments = tempPaymentList
    }

    return tempInvoice
  }
}
