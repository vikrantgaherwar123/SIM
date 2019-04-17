import { Action } from '@ngrx/store'
import { invoice } from '../interface'

import * as InvoiceActions from '../actions/invoice.action'

const initialState: invoice[] = [
  // Comment this data before publishing
  // {
  //   adjustment: 0,
  //   amount: 233,
  //   balance: 0,
  //   client_id: 0,
  //   created_date: "2018-01-24",
  //   deletedItems: [],
  //   deletedPayments: [],
  //   deletedTerms: [],
  //   deleted_flag: 0,
  //   device_modified_on: 1516781182511,
  //   discount: 0,
  //   discount_on_item: 2,
  //   due_date: "2018-01-31",
  //   due_date_flag: 3,
  //   epoch: 0,
  //   gross_amount: 233,
  //   id: 0,
  //   invoice_number: "INV746",
  //   invoiceNote: '',
  //   listItems: [{
  //     description: "",
  //     discountAmount: 0,
  //     discountRate: 0,
  //     listItemId: 0,
  //     org_id: 0,
  //     price: 30,
  //     prodId: 0,
  //     productName: "Pen Holder",
  //     qty: 1,
  //     rate: 30,
  //     serverId: 0,
  //     serverInvoiceId: 0,
  //     serverProductId: 0,
  //     taxAmount: 0,
  //     tax_rate: 0,
  //     uniqueKeyFKInvoice: "@11517917348631b600b703",
  //     uniqueKeyFKProduct: "@115157468980638ebcfc53",
  //     uniqueKeyListItem: "@1151791733874483d103e3",
  //     unit: "jghj"
  //   }],
  //   organization_id: 1,
  //   payments: [],
  //   percentage_flag: 1,
  //   percentage_value: 0,
  //   push_flag: 0,
  //   reference: "hfh",
  //   serverUpdateTime: 1516781185205,
  //   shipping_address: "rameshwari",
  //   shipping_charges: 0,
  //   taxList: [],
  //   tax_amount: 0,
  //   tax_on_item: 2,
  //   tax_rate: 0,
  //   termsAndConditions: [],
  //   unique_identifier: "@115167811825088311e2b2",
  //   unique_key_fk_client: "70b7d8d7ff18c7e61494754497543",
  //   version: 1,
  //   _id: 0
  // }
]

export function invoiceReducer(state = initialState, action: InvoiceActions.Action) {
	switch (action.type) {
		case InvoiceActions.ADD:
      state.push(...action.payload)
      return state
    
    case InvoiceActions.EDIT:
      state[action.payload.index] = action.payload.value
      return state

    case InvoiceActions.REMOVE:
      state.splice(action.payload, 1)
      return state

    // case InvoiceActions.REMOVERECENTINVOICE:
    //   state.splice(action.payload, 1)
    //   return state

    case InvoiceActions.RESET:
      return action.payload

		default:
			return state
	}
}