import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { MatMenuModule} from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core'
import {TranslateHttpLoader} from '@ngx-translate/http-loader'
import { HttpClientModule, HttpClient ,HTTP_INTERCEPTORS } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client'
import * as $ from 'jquery'
import * as bootstrap from 'bootstrap'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2'
import { FilterPipeModule } from 'ngx-filter-pipe'
import { OrderModule } from 'ngx-order-pipe'
import { SocialLoginModule, AuthServiceConfig,
  GoogleLoginProvider, FacebookLoginProvider
} from "angular-6-social-login"
import { StoreModule } from '@ngrx/store'
import { clientReducer } from './reducers/client.reducer'
import { productReducer } from './reducers/product.reducer'
import { termsReducer } from './reducers/terms.reducer'
import { estimateReducer } from './reducers/estimate.reducer'
import { invoiceReducer } from './reducers/invoice.reducer'
import { recentInvoice } from './reducers/recentInvoice.reducer'
import { recentEstimate } from './reducers/recentEstimate.reducer'
import { HttpErrorInterceptor } from './error-handler';
import { globalReducer } from './reducers/globals.reducer'
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
import { environment } from '../environments/environment'
import {ToasterModule, ToasterService} from 'angular2-toaster';
import {ProgressBarModule} from "angular-progress-bar"
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BatchuploadComponent } from './components/setting/batchupload/batchupload.component';
import { SupportComponent } from './components/support/support.component';
import { EmailService } from './services/email.service';
import { HttpModule } from '@angular/http';
import { Title }     from '@angular/platform-browser';
import { CurrencyPipe } from './currencyPipe';
import { CurrencyPipeNoSymbol } from './currencyPipeNoSymbol';

import { ToastrModule } from 'ngx-toastr';
// search module
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import{MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter, MAT_DATE_LOCALE} from '@angular/material';
import { ViewTodaysInvoiceComponent } from './components/invoice/view-todays-invoice/view-todays-invoice.component';
import { ViewTodaysEstimateComponent } from './components/estimate/view-todays-estimate/view-todays-estimate.component';
import { SubscriptionComponent } from './components/login/subscription/subscription.component';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

// Social login config
export function getAuthServiceConfigs() {
  const FB_APP_ID = environment.FB_APP_ID
  const G_APP_ID = environment.G_APP_ID

  return new AuthServiceConfig([
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider(FB_APP_ID)
    },
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(G_APP_ID)
    }
  ])
  
  
}
// toaster class


export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    CurrencyPipe,
    CurrencyPipeNoSymbol,
    AppComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    SidebarComponent,
    ClientComponent,
    ProductComponent,
    AddEditComponent,
    ViewComponent,
    AddEditEstComponent,
    ViewEstComponent,
    PrimaryComponent,
    TncComponent,
    CustomFieldComponent,
    BankingComponent,
    PasswordComponent,
    UserProfileComponent,
    BatchuploadComponent,
    SupportComponent,
    ViewTodaysInvoiceComponent,
    ViewTodaysEstimateComponent,
    SubscriptionComponent,
    
  ],
  imports: [
    MatCheckboxModule,
    MatMenuModule,
    ProgressBarModule,
    BrowserModule,
    Ng2SearchPipeModule,
    HttpModule,
    SocialLoginModule,
    AppRoutingModule,
    ToastrModule.forRoot(
      {
        timeOut: 3000,
        preventDuplicates: false,
      }
    ),// ToastrModule added
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingBarHttpClientModule,
    SweetAlert2Module.forRoot(),
    FilterPipeModule,
    OrderModule,
    BrowserAnimationsModule,
    ToasterModule.forRoot(),
    MaterialModule,
    StoreModule.forRoot({
      client: clientReducer,
      product: productReducer,
      terms: termsReducer,
      estimate: estimateReducer,
      invoice: invoiceReducer,
      recentInvoices: recentInvoice,
      recentEstimates: recentEstimate,
      globals: globalReducer
    }),
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
     useClass: HttpErrorInterceptor,
     multi: true
    },
    EmailService,
    CONSTANTS,
    // {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    // {provide: MAT_DATE_LOCALE, useValue: 'en-US'},
    // { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    // { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
      
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
 }
