import { client, product, estimate, invoice, terms, recentInvoices ,recentEstimates } from './interface'

export interface AppState {
  readonly client: client[]
  readonly product: product[]
  readonly estimate: estimate[]
  readonly invoice: invoice[]
  readonly terms: terms[]
  readonly recentInvoices: recentInvoices[]
  readonly recentEstimates: recentEstimates[]

}