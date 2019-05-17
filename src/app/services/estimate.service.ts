import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CONSTANTS } from '../constants'

@Injectable({
  providedIn: 'root'
})
export class EstimateService {
  private fetchUrl = ''
  private addUrl = ''
  private fetchByIdUrl = ''
  private fetchPdfUrl = ''
  private user: {
    access_token: string
  }
  private fetchByQueryUrl = '';
  private fetchTodaysInvEst = ''

  constructor(private http: HttpClient, private CONST: CONSTANTS) {
    this.fetchUrl = `${CONST.BASE_URL}estimate/pull/quotation`
    this.fetchByIdUrl = `${CONST.BASE_URL}estimate/pull/estimate/byId`
    this.fetchByQueryUrl = `${CONST.BASE_URL}estimate/pull/estimate/clientId`
    this.fetchTodaysInvEst = `${CONST.BASE_URL}invoice_data/pull/today's/invoicesOrestimates`
    this.fetchPdfUrl = `${CONST.BASE_URL}pdf/estimate/`
    this.addUrl = `${CONST.BASE_URL}estimate/add-estimate`
    
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
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

  fetchTodaysData(query){
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.fetchTodaysInvEst, query, headers)

  }

  add(estimate) {
    const headers = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "accessToken": this.user.access_token
      })
    }

    return this.http.post(this.addUrl, estimate, headers)
  }

  fetchPdf(id) {
    const headers = {
      headers: new HttpHeaders({
        "accessToken": this.user.access_token
      }),
      responseType: "arraybuffer" as "json"
    }

    return this.http.get(`${this.fetchPdfUrl}${id}`, headers)
  }

  changeKeysForStore(estimate) {
    return {
      adjustment: estimate.adjustment,
      alstQuotProduct: estimate.listItems,
      alstQuotTermsCondition: estimate.termsAndConditions,
      amount: estimate.amount,
      assignDiscountFlag: estimate.discount_on_item,
      assignTaxFlag: estimate.tax_on_item,
      createDate: estimate.created_date,
      discount: estimate.discount,
      discountFlag: estimate.percentage_flag,
      enabled: estimate.deleted_flag,
      epochTime: estimate.epoch,
      grossAmount: estimate.gross_amount,
      localClientId: estimate.local_client_id,
      localId: estimate._id,
      organizationId: estimate.organization_id,
      percentageValue: estimate.percentage_value,
      pushFlag: estimate.push_flag,
      quetationNo: estimate.estimate_number,
      serverUpdateTime: estimate.serverUpdateTime,
      shippingAddress: estimate.shipping_address,
      shippingCharges: estimate.shipping_charges,
      taxAmt: estimate.tax_amount,
      taxList: estimate.taxList,
      taxrate: estimate.tax_rate,
      taxableFlag:estimate.taxableFlag,
      unique_identifier: estimate.unique_identifier,
      unique_key_fk_client: estimate.unique_key_fk_client,
      version: estimate.version
    }
  }

  


  changeKeysForApi(estimate) {
    return {
      adjustment: estimate.adjustment,
      amount: estimate.amount,
      created_date: estimate.createDate,
      device_modified_on: 0,
      discount: estimate.discount,
      taxableFlag:estimate.taxableFlag,
      
      discount_on_item: estimate.assignDiscountFlag,
      estimate_number: estimate.quetationNo,
      gross_amount: estimate.grossAmount,
      listItems: estimate.alstQuotProduct,
      organization_id: estimate.organizationId,
      percentage_flag: estimate.discountFlag,
      percentage_value: estimate.percentageValue,
      shipping_address: estimate.shippingAddress,
      shipping_charges: estimate.shippingCharges,
      taxList: estimate.taxList,
      tax_amount: estimate.taxAmt,
      tax_on_item: estimate.assignTaxFlag,
      tax_rate: estimate.taxrate,
      termsAndConditions: estimate.alstQuotTermsCondition,
      unique_identifier: estimate.unique_identifier,
      unique_key_fk_client: estimate.unique_key_fk_client
    }
  }

  // changeKeysForMakeInvoice(estimate) {
  //   return {
  //   taxableFlag: estimate.taxableFlag,
  //   adjustment: estimate.adjustment,
  //   amount: estimate.amount,
  //   client_id: number
  //   created_date: string
  //   deletedItems: Array < {} >
  //   deletedPayments: Array<{ }>
  //   deletedTerms: Array < {} >
  //   deleted_flag: number
  //   device_modified_on: number
  //   discount: number
  //   discount_amount: number
  //   discount_on_item: number
  //   due_date: string
  //   due_date_flag: number
  //   epoch: number
  //   gross_amount: number
  //   id: number
  //   invoiceNote: string
  //   invoice_number: string
  //   listItems: Array < any >
  //     organization_id: number
  //   payments: Array < any >
  //     percentage_flag: number
  //   percentage_value: number
  //   push_flag: number
  //   reference: string
  //   serverUpdateTime: number
  //   shipping_address: string
  //   shipping_charges: number
  //   taxList: Array < any >
  //     tax_amount: number
  //   tax_on_item: number
  //   tax_rate: number
  //   termsAndConditions: Array < any >
  //     unique_identifier: string
  //   unique_key_fk_client: string
  //   version: number
  //   _id: number
  //   }
  // }
}
