import { Action } from '@ngrx/store'
import { client } from '../interface'

import * as TermsActions from '../actions/terms.action'

const initialState: terms[] = []

export function termsReducer(state = initialState, action: TermsActions.Action) {
	switch (action.type) {
		case TermsActions.ADD:
      return [...state, ...action.payload]
    
    case TermsActions.EDIT:
      state[action.payload.index] = action.payload.value
      return state

    case TermsActions.REMOVE:
      state.splice(action.payload, 1)
      return state

    default:
      return state
	}
}