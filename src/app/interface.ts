import { Observable } from 'rxjs'

export interface response {
  status: number,
  records: client[],
  clientList: client[],
  termsAndConditionList: terms[]
  message: string,
  error: string
}

export interface setting {
  alstTaxName: []
  adjustment: string
  balance: string
  currencyInText: string
  dateDDMMYY: boolean
  date_format: boolean
  discount: string
  discount_on_item: number
  mTvQty: string
  mTvProducts: string
  mTvRate: string
  mTvAmount: string
  mTvTermsAndConditions: string
  mTvBillTo: string
  mTvShipTo: string
  mTvDueDate: string
  paid: string
  quotFormat: string
  quotNo: string
  subtotal: string
  shipping: string
  tax_on_item: number
  total: string
}

export interface client {
  addressLine1: string
  addressLine2: string
  addressLine3: string
  businessDetail: string
  businessId: string
  contactPersonName: string
  deviceCreatedDate: number
  email: string
  enabled: number
  localClientid: number
  modifiedDate: number
  name: string
  number: string
  organizationId: number
  serverUpdateTime: number
  shippingAddress: string
  uniqueKeyClient: string
}

export interface product {
  buyPrice: number
  deviceCreatedDate: number
  discription: string
  enabled: number
  inventoryEnabled: number
  modifiedDate: number
  openingStock: number
  prodLocalId: number
  prodName: string
  productCode: string
  rate: number
  remainingStock: number
  serverOrgId: number
  serverUpdateTime: number
  taxRate: number
  uniqueKeyProduct: string
  unit: string
}

export interface terms {
  createDate: number
  deviceCreateDate: number
  enabled: number
  modifiedDate: number
  modifiedOn: number
  orgId: number
  serverTermCondId: number
  serverUpdateTime: number
  setDefault: string
  terms: string
  uniqueKeyTerms: string
}

export interface invoice {
  adjustment: number
  amount: number
  balance: number
  client_id: number
  created_date: string
  deleted_flag: number
  device_modified_on: number
  discount: number
  discount_on_item: number
  due_date_flag: number
  epoch: number
  gross_amount: number
  id: number
  invoice_number: string
  listItems: Array<{}>
  organization_id: number
  payments: Array<{}>
  percentage_flag: number
  percentage_value: number
  push_flag: number
  serverUpdateTime: number
  shipping_address: string
  shipping_charges: number
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  termsAndConditions: Array<{}>
  unique_identifier: string
  unique_key_fk_client: string
  version: number
}

export interface estimate {
  name: string,
  value: string
}