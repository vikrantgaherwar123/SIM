import { Action } from '@ngrx/store'

export const ADD = 'ADD_TERMS'
export const EDIT = 'EDIT_TERMS'
export const REMOVE = 'REMOVE_TERMS'
export const RESET = 'RESET_TERMS'

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

  constructor(public payload: number) {
    
  }
}

export class reset implements Action {
  readonly type = RESET

  constructor() {

  }
}

export type Action = add | edit | remove | reset