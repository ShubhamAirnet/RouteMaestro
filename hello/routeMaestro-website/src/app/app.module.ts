import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule,  CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { browserSessionPersistence, getAuth, initializeAuth, provideAuth } from '@angular/fire/auth';
import { ToastrModule } from 'ngx-toastr';
import { AuthService } from './Services/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
// import { NgOtpInputModule } from 'ng-otp-input';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { TermCondComponent } from './pages/term-cond/term-cond.component';
import { ShippingComponent } from './pages/shipping/shipping.component';
import { RefundComponent } from './pages/refund/refund.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { HomeComponent } from './pages/home/home.component';
import { FaqComponent } from './components/faq/faq.component';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ItineraryComponent } from './pages/itinerary/itinerary.component';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { AddUserComponent } from './pages/add-user/add-user.component';
import { AdminPricingComponent } from './pages/admin-pricing/admin-pricing.component';
import { MerchantComponent } from './pages/merchant/merchant.component';
import { SuccessComponent } from './pages/success/success.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserViewComponent } from './pages/user-view/user-view.component';



@NgModule({
  imports: [
    NgbTooltipModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    NgbNavModule,
    HttpClientModule,
    MatSnackBarModule,
    FormsModule,
    // NgOtpInputModule,
    NgxSpinnerModule,
    ComponentsModule,
    RouterModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => initializeAuth(getApp(), {
      persistence: browserSessionPersistence
    })),
    provideAuth(() => getAuth()),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    ComingSoonComponent,
    PoliciesComponent,
    TermCondComponent,
    ShippingComponent,
    RefundComponent,
    ContactUsComponent,
    PricingComponent,
    HomeComponent,
    FaqComponent,
    ItineraryComponent,
    AddUserComponent,
    AdminPricingComponent,
    MerchantComponent,
    SuccessComponent,
    UserListComponent,
    UserViewComponent,
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  providers: [AuthService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
