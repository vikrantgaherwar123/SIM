import { client } from '../interface'

import * as ClientActions from '../actions/client.action'

const initialState: client[] = []

export function clientReducer(state = initialState, action: ClientActions.Action) {
	switch (action.type) {
    case ClientActions.ADD:
      state.push(...action.payload)
      return state
    
    case ClientActions.EDIT:
      state[action.payload.index] = action.payload.value
    return state

    case ClientActions.REMOVE:
      state.splice(action.payload, 1)
    return state

		default:
			return state
	}
}