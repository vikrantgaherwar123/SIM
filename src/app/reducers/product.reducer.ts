import { Action } from '@ngrx/store'
import { product } from '../interface'

import * as ProductActions from '../actions/product.action'

const initialState: product[] = []

export function productReducer(state = initialState, action: ProductActions.Action) {
	switch (action.type) {
		case ProductActions.ADD:
      state.push(...action.payload)
      return state

    case ProductActions.REMOVE:
      state.splice(action.payload, 1)
      return state

    case ProductActions.EDIT:
      state[action.payload.index] = action.payload.value
      return state

		default:
			return state
	}
}