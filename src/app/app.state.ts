import { client, product, estimate, invoice, terms } from './interface'

export interface AppState {
  readonly client: client[]
  readonly product: product[]
  readonly estimate: estimate[]
  readonly invoice: invoice[]
  readonly terms: terms[]
}