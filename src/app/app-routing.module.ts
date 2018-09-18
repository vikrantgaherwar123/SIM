import { NgModule } from '@angular/core'
import { Routes, RouterModule, CanActivate } from '@angular/router'
import { AuthGuard } from './auth.guard'

import { LoginComponent } from './components/login/login.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { ClientComponent } from './components/client/client.component'
import { ProductComponent } from './components/product/product.component'
import { InvoiceComponent } from './components/invoice/invoice.component'

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'client', component: ClientComponent, canActivate: [AuthGuard] },
  { path: 'product', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'invoice', redirectTo: '/invoice/view/:id', pathMatch: 'full' },
  { path: 'invoice/view/:id', component: InvoiceComponent, canActivate: [AuthGuard] }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
