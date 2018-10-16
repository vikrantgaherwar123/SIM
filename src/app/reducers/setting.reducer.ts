import * as SettingActions from '../actions/setting.action'

const initialState: any = {
  // Comment this before publishing
  // appSettings: {
  //   androidSettings: {
  //     CommasThree: false,
  //     CommasTwo: false,
  //     adjustment: "Adjust Amt.",
  //     alstTaxName: null,
  //     appDataDateOptionFlag: 0,
  //     appVersionCode: "",
  //     appVersionNo: 0,
  //     applyFilterOptionToAllUser: false,
  //     balance: "Balance",
  //     bankingDetails: "",
  //     baseAmount: "",
  //     carrier: "",
  //     colorcode: -1339181,
  //     commaSeperator: ",",
  //     country: "India",
  //     countryIndex: 5,
  //     currencyInText: "Rs",
  //     currencyPos: -1,
  //     currencySymbol: true,
  //     currencyText: false,
  //     dateDDMMYY: true,
  //     dateMMDDYY: false,
  //     decimalSeperator: ".",
  //     deviceCreatedEpoch: 0,
  //     discount: "Flat Discount",
  //     discountFlagLevel: 1,
  //     dontShowGSTMsgAgain: false,
  //     dropboxEmail: "",
  //     fobPoint: "",
  //     googleDriveEmail: "",
  //     gstApplied: true,
  //     invNo: 88,
  //     inventoryEnabledFlag: true,
  //     inventoryStockAlertsFlag: true,
  //     invoiceOldShowFlag: false,
  //     invoiceQuickShowFlag: false,
  //     isLinkToDrive: false,
  //     isLinkToDropbox: false,
  //     languageCode: 1,
  //     legecyOrQuickVersion: 1,
  //     mTvAmount: "Total Amt.",
  //     mTvAmountDue: "Due On",
  //     mTvBillTo: "BIling To...",
  //     mTvDueDate: "Due On :",
  //     mTvEstimate: "#ESTIMATE",
  //     mTvInvoice: "#INVOICE",
  //     mTvProducts: "Item Description",
  //     mTvQty: "Quantity",
  //     mTvRate: "Price",
  //     mTvShipTo: "Shipping To...",
  //     mTvTermsAndConditions: "Terms & Condition....",
  //     notes: "",
  //     numberFormat: "###,###,###.00",
  //     order: "",
  //     otherDetails: "",
  //     paid: "Paid Amt.",
  //     payPalActivatinFlag: true,
  //     payPalUserAccountURL: "nit",
  //     payableTo: "Payable To",
  //     productCode: "HSN Code",
  //     pushFlag: 0,
  //     quotFormat: "",
  //     quotNo: "24",
  //     receiptLable: "RECEIPT",
  //     receiptNo: "",
  //     savePDFOnDrive: false,
  //     savePDFOnDropBox: false,
  //     setInvoiceFormat: "INV",
  //     shipping: "Shipping Amt.",
  //     shippingDetails: "",
  //     signature: "Authorized Signature",
  //     subtotal: "Total",
  //     taxFlagLevel: 2,
  //     taxIDLable: "GSTIN",
  //     taxLable: "",
  //     templateVersion: 1,
  //     total: "Grand Total",
  //     totalSaleOrPayMonthly: false,
  //     totalSaleOrPayWeekly: true
  //   },
  //   android_donot_update_push_flag: 1,
  //   iosSettings: null,
  //   webSettings: null
  // },
  // createdTime: 1504608955688,
  // deviceLastUpdatedTime: 1539175993776,
  // orgId: "1",
  // processed_flag: 0,
  // updatedTime: 1539176000800
}

export function settingReducer(state = initialState, action: SettingActions.Action) {
	switch (action.type) {
    case SettingActions.ADD:
      return {...state, ...action.payload}

    case SettingActions.EDIT:
    return {...state, ...action.payload}

    case SettingActions.REMOVE:
    return {}

		default:
			return state
	}
}