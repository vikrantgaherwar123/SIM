import { client, product, estimate, invoice, terms, recentInvoices } from './interface'

export interface AppState {
  readonly client: client[]
  readonly product: product[]
  readonly estimate: estimate[]
  readonly invoice: invoice[]
  readonly terms: terms[]
  readonly recentInvoices: recentInvoices[]
}