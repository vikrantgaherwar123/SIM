import { NgModule } from '@angular/core'
import { Routes, RouterModule, CanActivate } from '@angular/router'
import { AuthGuard } from './auth.guard'

import { LoginComponent } from './components/login/login.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { ClientComponent } from './components/client/client.component'
import { ProductComponent } from './components/product/product.component'
import { AddEditComponent } from './components/invoice/addEdit/addEdit.component'
import { ViewComponent } from './components/invoice/view/view.component'
import { AddEditEstComponent } from './components/estimate/addEdit/addEditEst.component'
import { ViewEstComponent } from './components/estimate/view/viewEst.component'
import { PrimaryComponent } from './components/setting/primary/primary.component'
import { TncComponent } from './components/setting/tnc/tnc.component'
import { CustomFieldComponent } from './components/setting/custom-field/custom-field.component'
import { BankingComponent } from './components/setting/banking/banking.component'
import { PasswordComponent } from './components/setting/password/password.component'
import { UserProfileComponent } from './components/setting/user-profile/user-profile.component'
import { BatchuploadComponent } from './components/setting/batchupload/batchupload.component';
import { SupportComponent } from './components/support/support.component';
import { LoadalldataComponent } from './components/loadalldata/loadalldata.component';


const routes: Routes = [
  { path: '', redirectTo: '/load', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'client', component: ClientComponent, canActivate: [AuthGuard] },
  { path: 'product', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'invoice', redirectTo: '/invoice/add', pathMatch: 'full' },
  { path: 'invoice/add', component: AddEditComponent, canActivate: [AuthGuard] },
  { path: 'load', component: LoadalldataComponent, canActivate: [AuthGuard] },
  { path: 'invoice/edit/:invId', component: AddEditComponent, canActivate: [AuthGuard] },
  { path: 'invoice/add/:estId', component: AddEditComponent, canActivate: [AuthGuard] },
  { path: 'invoice/view', component: ViewComponent, canActivate: [AuthGuard] },
  { path: 'estimate/add', component: AddEditEstComponent, canActivate: [AuthGuard] },
  { path: 'estimate/edit/:estId', component: AddEditEstComponent, canActivate: [AuthGuard] },
  { path: 'estimate/view', component: ViewEstComponent, canActivate: [AuthGuard] },
  { path: 'setting/primary', component: PrimaryComponent, canActivate: [AuthGuard] },
  { path: 'setting/tnc', component: TncComponent, canActivate: [AuthGuard] },
  { path: 'setting/customField', component: CustomFieldComponent, canActivate: [AuthGuard] },
  { path: 'setting/banking', component: BankingComponent, canActivate: [AuthGuard] },
  { path: 'setting/password', component: PasswordComponent, canActivate: [AuthGuard] },
  { path: 'setting/userProfile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'setting/batchUpload', component: BatchuploadComponent, canActivate: [AuthGuard] },
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'invoice/add', pathMatch: 'full' },
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
