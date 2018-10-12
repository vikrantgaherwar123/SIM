import { client } from '../interface'

import * as ClientActions from '../actions/client.action'

const initialState: client[] = [
  // Comment this data before publishing
  // {
  //   addressLine1: '94/A',
  //   addressLine2: 'Nandanvan',
  //   addressLine3: 'Nogpur',
  //   businessDetail: 'satronics pvt ltd',
  //   businessId: '',
  //   contactPersonName: 'satish logade',
  //   deviceCreatedDate: 1511180754369,
  //   email: 'satishlogade@gmail.com',
  //   enabled: 0,
  //   localClientid: 5,
  //   modifiedDate: 0,
  //   name: 'satishL',
  //   number: '12345678',
  //   organizationId: 1,
  //   serverUpdateTime: 1511180755180,
  //   shippingAddress: 'poonam mall',
  //   uniqueKeyClient: '@11512392993529bb4e46e8'
  // }
]

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