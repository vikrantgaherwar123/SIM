import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CookieService } from 'ngx-cookie-service'
import * as $ from 'jquery'
import * as bootstrap from 'bootstrap'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2'
import { FilterPipeModule } from 'ngx-filter-pipe'
import { OrderModule } from 'ngx-order-pipe'

import { StoreModule } from '@ngrx/store'
import { clientReducer } from './reducers/client.reducer'
import { productReducer } from './reducers/product.reducer'
import { termsReducer } from './reducers/terms.reducer'
import { estimateReducer } from './reducers/estimate.reducer'
import { invoiceReducer } from './reducers/invoice.reducer'

import { CONSTANTS } from './constants'
import { MaterialModule } from './material'

import { AppComponent } from './components/index/index.component'
import { HeaderComponent } from './components/header/header.component'
import { AppRoutingModule } from './/app-routing.module'
import { LoginComponent } from './components/login/login.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { SidebarComponent } from './components/sidebar/sidebar.component'
import { ClientComponent } from './components/client/client.component'
import { ProductComponent } from './components/product/product.component'
import { AddComponent } from './components/invoice/add/add.component'
import { EstimateComponent } from './components/estimate/estimate.component'
import { EditComponent } from './components/invoice/edit/edit.component'
import { ViewComponent } from './components/invoice/view/view.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    SidebarComponent,
    ClientComponent,
    ProductComponent,
    AddComponent,
    EstimateComponent,
    EditComponent,
    ViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    FilterPipeModule,
    OrderModule,
    BrowserAnimationsModule,
    MaterialModule,
    StoreModule.forRoot({
      client: clientReducer,
      product: productReducer,
      terms: termsReducer,
      estimate: estimateReducer,
      invoice: invoiceReducer
    })
  ],
  providers: [CookieService, CONSTANTS],
  bootstrap: [AppComponent]
})
export class AppModule { }
