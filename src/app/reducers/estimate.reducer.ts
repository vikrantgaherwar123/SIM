import { Action } from '@ngrx/store'
import { estimate } from '../interface'

import * as EstimateActions from '../actions/estimate.action'

const initialState: estimate[] = []

export function estimateReducer(state = initialState, action: EstimateActions.Action) {
	switch (action.type) {
    case EstimateActions.ADD:
      state.push(...action.payload)
      return state
    
    case EstimateActions.EDIT:
      state[action.payload.index] = action.payload.value
      return state

    case EstimateActions.REMOVE:
      state.splice(action.payload, 1)
      return state

    case EstimateActions.RESET:
      return action.payload

		default:
			return state
	}
}