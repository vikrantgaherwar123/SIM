export interface response {
  status: number,
  records: client[],
  clientList: client[],
  termsAndConditionList: terms[]
  message: string,
  error: string
}

export interface setting {
  CommasThree: boolean
  CommasTwo: boolean
  adjustment: string
  alstTaxName: Array<{}>
  appDataDateOptionFlag: number
  appVersionCode: string
  appVersionNo: number
  applyFilterOptionToAllUser: false
  balance: string
  bankingDetails: string
  baseAmount: string
  carrier: string
  colorcode: number
  commaSeperator: string
  country: string
  countryIndex: number
  currencyInText: string
  currencyPos: number
  currencySymbol: boolean
  currencyText: boolean
  dateDDMMYY: boolean
  dateMMDDYY: boolean
  date_format: string
  decimalSeperator: string
  deviceCreatedEpoch: number
  discount: string
  discountFlagLevel: number
  dontShowGSTMsgAgain: boolean
  dropboxEmail: string
  fobPoint: string
  googleDriveEmail: string
  gstApplied: boolean
  invNo: number
  inventoryEnabledFlag: boolean
  inventoryStockAlertsFlag: boolean
  invoiceOldShowFlag: boolean
  invoiceQuickShowFlag: boolean
  isLinkToDrive: boolean
  isLinkToDropbox: boolean
  languageCode: number
  legecyOrQuickVersion: number
  mTvAmount: string
  mTvAmountDue: string
  mTvBillTo: string
  mTvDueDate: string
  mTvEstimate: string
  mTvInvoice: string
  mTvProducts: string
  mTvQty: string
  mTvRate: string
  mTvShipTo: string
  mTvTermsAndConditions: string
  notes: string
  numberFormat: string
  order: string
  otherDetails: string
  paid: string
  payPalActivatinFlag: boolean
  payPalUserAccountURL: string
  payableTo: string
  productCode: string
  pushFlag: number
  quotFormat: string
  quotNo: string
  receiptLable: string
  receiptNo: string
  savePDFOnDrive: boolean
  savePDFOnDropBox: boolean
  showBalPaidAmountFlag:boolean      
  setInvoiceFormat: string
  shipping: string
  shippingDetails: string
  signature: string
  subtotal: string
  taxFlagLevel: number
  taxableFlag : number
  taxIDLable: string
  taxLable: string
  templateVersion: number
  total: string
  totalSaleOrPayMonthly: boolean
  totalSaleOrPayWeekly: boolean
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
  openingDate: string
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
  taxableFlag:number
  adjustment: number
  amount: number
  balance: number
  client_id: number
  created_date: string
  deletedItems: Array<{}>
  deletedPayments: Array<{}>
  deletedTerms: Array<{}>
  deleted_flag: number
  device_modified_on: number
  discount: number
  discount_amount : number
  discount_on_item: number
  due_date: string
  due_date_flag: number
  epoch: number
  gross_amount: number
  id: number
  invoiceNote: string
  invoice_number: string
  listItems: Array<any>
  organization_id: number
  payments: Array<any>
  percentage_flag: number
  percentage_value: number
  push_flag: number
  reference: string
  serverUpdateTime: number
  shipping_address: string
  shipping_charges: number
  taxList: Array<any>
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  termsAndConditions: Array<any>
  unique_identifier: string
  unique_key_fk_client: string
  version: number
  _id: number
}


export interface recentInvoices {
  taxableFlag:number
  showBalPaidAmountFlag: boolean
  adjustment: number
  amount: number
  balance: number
  client_id: number
  created_date: string
  deletedItems: Array<{}>
  deletedPayments: Array<{}>
  deletedTerms: Array<{}>
  deleted_flag: number
  device_modified_on: number
  discount: number
  discount_amount : number
  discount_on_item: number
  due_date: string
  due_date_flag: number
  epoch: number
  gross_amount: number
  id: number
  invoiceNote: string
  invoice_number: string
  listItems: Array<any>
  organization_id: number
  payments: Array<any>
  percentage_flag: number
  percentage_value: number
  push_flag: number
  reference: string
  serverUpdateTime: number
  shipping_address: string
  shipping_charges: number
  taxList: Array<any>
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  termsAndConditions: Array<any>
  unique_identifier: string
  unique_key_fk_client: string
  version: number
  _id: number
}

export interface estimate {
  discount_amount:number,
  showBalPaidAmountFlag: boolean
  taxableFlag:number,
  adjustment: number
  alstQuotProduct: Array<any>
  alstQuotTermsCondition: Array<any>
  amount: number
  assignDiscountFlag: number
  assignTaxFlag: number
  createDate: string
  deviceCreatedDate: number
  discount: number
  discountFlag: number
  enabled: number
  epochTime: number
  grossAmount: number
  localClientId: number
  localId: number
  organizationId: number
  percentageValue: number
  pushFlag: number
  quetationNo: string
  serverClientId: number
  serverUpdateTime: number
  shippingAddress: string
  shippingCharges: number
  taxAmt: number
  taxrate: number
  version: number
  created_date: string
  deleted_flag: number
  device_modified_on: number
  discount_on_item: number
  estimate_number: string
  gross_amount: number
  listItems: Array<any>
  organization_id: number
  percentage_flag: number
  percentage_value: number
  shipping_address: string
  shipping_charges: number
  taxList: Array<any>
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  epoch: number,
  termsAndConditions: Array<any>
  unique_identifier: string
  unique_key_fk_client: string
}

export interface recentEstimates {
  discount_amount: number,
  showBalPaidAmountFlag: boolean
  taxableFlag:number,
  adjustment: number
  alstQuotProduct: Array<any>
  alstQuotTermsCondition: Array<any>
  amount: number
  assignDiscountFlag: number
  assignTaxFlag: number
  createDate: string
  deviceCreatedDate: number
  discount: number
  discountFlag: number
  enabled: number
  epochTime: number
  grossAmount: number
  localClientId: number
  localId: number
  organizationId: number
  percentageValue: number
  pushFlag: number
  quetationNo: string
  serverClientId: number
  serverUpdateTime: number
  shippingAddress: string
  shippingCharges: number
  taxAmt: number
  taxrate: number
  version: number
  created_date: string
  deleted_flag: number
  device_modified_on: number
  discount_on_item: number
  estimate_number: string
  gross_amount: number
  listItems: Array<any>
  organization_id: number
  percentage_flag: number
  percentage_value: number
  shipping_address: string
  shipping_charges: number
  taxList: Array<any>
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  epoch: number,
  termsAndConditions: Array<any>
  unique_identifier: string
  unique_key_fk_client: string
}

export interface addEditEstimate {
  taxableFlag:number,
  showBalPaidAmountFlag: boolean
  alstQuotProduct: Array<any>
  alstQuotTermsCondition: Array<any>
  assignDiscountFlag: number,
  assignTaxFlag: number,
  createDate: string,
  discountFlag: number,
  enabled: number,
  epochTime: number,
  epoch: number,
  grossAmount: number,
  localClientId: number,
  localId: number,
  organizationId: number,
  percentageValue: number,
  pushFlag: number,
  quetationNo: string,
  serverUpdateTime: number,
  shippingAddress: string,
  shippingCharges: number,
  taxAmt: number,
  taxrate: number,
  adjustment: number
  amount: number
  created_date: string
  deleted_flag: number
  device_modified_on: number
  discount: number
  discount_on_item: number
  estimate_number: string
  gross_amount: number
  listItems: Array<any>
  organization_id: number
  percentage_flag: number
  percentage_value: number
  shipping_address: string
  shipping_charges: number
  taxList: Array<any>
  tax_amount: number
  tax_on_item: number
  tax_rate: number
  termsAndConditions: Array<any>
  unique_identifier: string
  unique_key_fk_client: string
  version: number
  deviceCreatedDate: number
  serverClientId: number
}
