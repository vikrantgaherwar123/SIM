import { Injectable } from '@angular/core'
import { Action } from '@ngrx/store'

export const ADD_CLIENT = 'ADD_CLIENT'
export const REMOVE_CLIENT = 'REMOVE_CLIENT'

export class addClient implements Action {
  readonly type = ADD_CLIENT

  constructor(public payload: any) {

  }
}

export class removeClient implements Action {
  readonly type = REMOVE_CLIENT

  constructor(public payload: any) {
    
  }
}

export type Action = addClient | removeClient