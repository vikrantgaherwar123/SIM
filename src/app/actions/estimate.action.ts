import { Action } from '@ngrx/store'

export const ADD = 'ADD_ESTIMATE'
export const EDIT = 'EDIT_ESTIMATE'
export const REMOVE = 'REMOVE_ESTIMATE'
export const RESET = 'RESET_ESTIMATE'
export const RECENTESTIMATE = 'RECENT_ESTIMATE'


export class add implements Action {
  readonly type = ADD

  constructor(public payload: any) {

  }
}

export class edit implements Action {
  readonly type = EDIT

  constructor(public payload: any) {
    
  }
}

export class remove implements Action {
  readonly type = REMOVE

  constructor(public payload: any) {
    
  }
}

export class reset implements Action {
  readonly type = RESET

  constructor(public payload: any) {
    
  }
}

export class recentEstimate implements Action {
  readonly type = RECENTESTIMATE

  constructor(public payload: any) {
    
  }
}
export type Action = add | edit | remove | reset | recentEstimate