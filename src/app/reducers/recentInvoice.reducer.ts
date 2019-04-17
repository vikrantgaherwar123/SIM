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

		case InvoiceActions.EDITRECENTINVOICE:
		state[action.payload.index] = action.payload.value
		return state

		case InvoiceActions.RESETRECENTINVOICE:
        return action.payload
		
		case InvoiceActions.REMOVERECENTINVOICE:
        state.splice(action.payload, 1)
        return state

		default:
		return state
	}
}