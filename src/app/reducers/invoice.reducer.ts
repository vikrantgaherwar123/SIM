import { Action } from '@ngrx/store'
import { invoice } from '../interface'

import * as InvoiceActions from '../actions/invoice.action'

const initialState: invoice[] = []

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

		default:
			return state
	}
}