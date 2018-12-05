import { Action } from '@ngrx/store'
import { terms } from '../interface'

import * as TermsActions from '../actions/terms.action'

const initialState: terms[] = []

export function termsReducer(state = initialState, action: TermsActions.Action) {
	switch (action.type) {
		case TermsActions.ADD:
      state.push(...action.payload)
      return state

    case TermsActions.EDIT:
      state[action.payload.index] = action.payload.value
      return state

    case TermsActions.REMOVE:
      state.splice(action.payload, 1)
      return state

    case TermsActions.RESET:
      return []

    default:
      return state
	}
}