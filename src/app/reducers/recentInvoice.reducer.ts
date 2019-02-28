import { Action } from '@ngrx/store'
import { recentInvoices } from '../interface'

import * as InvoiceActions from '../actions/invoice.action'

const initialState: recentInvoices[] = [
  
]

export function recentInvoice(state = initialState, action: InvoiceActions.Action) {
	switch (action.type) {
        case InvoiceActions.RECENTINVOICE:
        state.push(...action.payload)
        return state

		default:
			return state
	}
}