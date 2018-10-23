import * as GlobalActions from '../actions/globals.action'

const initialState: any = {
  invoiceQueryForm: {}
}

export function globalReducer(state = initialState, action: GlobalActions.Action) {
	switch (action.type) {
    case GlobalActions.ADD:
    return {...state, ...action.payload}

    case GlobalActions.REMOVE:
      state[action.payload] = null
    return state

		default:
			return state
	}
}