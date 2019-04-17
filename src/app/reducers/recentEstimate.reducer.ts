import { Action } from '@ngrx/store'
import { recentEstimates } from '../interface'

import * as estimateActions from '../actions/estimate.action'

const initialState: recentEstimates[] = [
  
]

export function recentEstimate(state = initialState, action: estimateActions.Action) {
	switch (action.type) {
        case estimateActions.RECENTESTIMATE:
        state.push(...action.payload)
		return state
		
		case estimateActions.EDITRECENTESTIMATE:
		state[action.payload.index] = action.payload.value
		return state

		case estimateActions.RESETRECENTESTIMATE:
        return action.payload
		
		case estimateActions.REMOVERECENTESTIMATE:
        state.splice(action.payload, 1)
        return state

		default:
		return state
	}
}