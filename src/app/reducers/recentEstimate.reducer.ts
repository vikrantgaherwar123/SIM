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

		default:
			return state
	}
}