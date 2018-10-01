import { client } from './interface'
import { product } from './interface'
import { estimate} from './interface'
import { invoice } from './interface'
import { terms } from './interface'

export interface AppState {
    readonly client: client[]
    readonly product: product[]
    readonly estimate: estimate[]
    readonly invoice: invoice[]
    readonly terms: terms[]
}