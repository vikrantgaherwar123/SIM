import * as SettingActions from '../actions/setting.action'

const initialState: any = {}

export function settingReducer(state = initialState, action: SettingActions.Action) {
	switch (action.type) {
    case SettingActions.ADD:
      return {...state, ...action.payload}

    case SettingActions.EDIT:
    return {...state, ...action.payload}

    case SettingActions.REMOVE:
    return {}

		default:
			return state
	}
}