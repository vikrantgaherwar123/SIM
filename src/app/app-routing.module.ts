import { NgModule } from '@angular/core'
import { Routes, RouterModule, CanActivate } from '@angular/router'
import { AuthGuard } from './auth.guard'

import { LoginComponent } from './components/login/login.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { ClientComponent } from './components/client/client.component'
import { ProductComponent } from './components/product/product.component'
import { AddEditComponent } from './components/invoice/addEdit/addEdit.component'
import { ViewComponent } from './components/invoice/view/view.component'
import { EstimateComponent } from './components/estimate/estimate.component'
import { PrimaryComponent } from './components/setting/primary/primary.component'
import { TncComponent } from './components/setting/tnc/tnc.component'
import { CustomFieldComponent } from './components/setting/custom-field/custom-field.component'
import { BankingComponent } from './components/setting/banking/banking.component'

const routes: Routes = [
  { path: '', redirectTo: '/invoice/add', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'client', component: ClientComponent, canActivate: [AuthGuard] },
  { path: 'product', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'invoice', redirectTo: '/invoice/add', pathMatch: 'full' },
  { path: 'invoice/add', component: AddEditComponent, canActivate: [AuthGuard] },
  { path: 'invoice/edit/:invId', component: AddEditComponent, canActivate: [AuthGuard] },
  { path: 'invoice/view', component: ViewComponent, canActivate: [AuthGuard] },
  // { path: 'estimate', redirectTo: '/estimate/view/:id', pathMatch: 'full' },
  // { path: 'estimate/view/:estId', component: EstimateComponent, canActivate: [AuthGuard] },
  { path: 'setting/primary', component: PrimaryComponent, canActivate: [AuthGuard] },
  { path: 'setting/tnc', component: TncComponent, canActivate: [AuthGuard] },
  { path: 'setting/customField', component: CustomFieldComponent, canActivate: [AuthGuard] },
  { path: 'setting/banking', component: BankingComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'invoice/add', pathMatch: 'full' },
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
