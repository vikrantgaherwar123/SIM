import { Action } from '@ngrx/store'
import { client } from '../interface'

import * as ClientActions from '../actions/client.actions'
import * as _ from 'lodash'

const initialState: client[] = []

export function clientReducer(state = initialState, action: ClientActions.Action) {
	switch (action.type) {
		case ClientActions.ADD_CLIENT:
			return [...state, action.payload]

		default:
			return state
	}
}