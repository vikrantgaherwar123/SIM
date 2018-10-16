import { Action } from '@ngrx/store'
import { product } from '../interface'

import * as ProductActions from '../actions/product.action'

const initialState: product[] = [
  // Remove Initial data before publiching
  // {
  //   buyPrice: 0,
  //   deviceCreatedDate: 1516081011944,
  //   discription: "",
  //   enabled: 0,
  //   inventoryEnabled: 0,
  //   modifiedDate: 0,
  //   openingDate: "2018-01-16",
  //   openingStock: 0,
  //   prodLocalId: 0,
  //   prodName: "fdsf",
  //   productCode: 'we43d33d3daas',
  //   rate: 100,
  //   remainingStock: 0,
  //   serverOrgId: 1,
  //   serverUpdateTime: 1516081012243,
  //   taxRate: 0,
  //   uniqueKeyProduct: "@11516081011944a4d874e8",
  //   unit: ""
  // }
]

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