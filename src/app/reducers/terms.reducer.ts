import { Action } from '@ngrx/store'
import { terms } from '../interface'

import * as TermsActions from '../actions/terms.action'

const initialState: terms[] = [
  // Comment this data before publishing
  // {
  //   createDate: 0,
  //   deviceCreateDate: 1513069212782,
  //   enabled: 1,
  //   modifiedDate: 0,
  //   modifiedOn: 0,
  //   orgId: 1,
  //   serverTermCondId: 0,
  //   serverUpdateTime: 1513069218384,
  //   setDefault: 'DEFAULT',
  //   terms: "testing terms 1↵testing terms 1",
  //   uniqueKeyTerms: "@115039094973269d8f280a"
  // },
  // {
  //   createDate: 0,
  //   deviceCreateDate: 1513235982330,
  //   enabled: 1,
  //   modifiedDate: 0,
  //   modifiedOn: 0,
  //   orgId: 1,
  //   serverTermCondId: 0,
  //   serverUpdateTime: 1513235984364,
  //   setDefault: "",
  //   terms: "testing new terms",
  //   uniqueKeyTerms: "@11512972930230ab0d012a"
  // }
]

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

    default:
      return state
	}
}