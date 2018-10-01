import { Injectable } from '@angular/core'
import { Action } from '@ngrx/store'

export const ADD = 'ADD_INVOICE'
export const EDIT = 'EDIT_INVOICE'
export const REMOVE = 'REMOVE_INVOICE'

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

export type Action = add | edit | remove