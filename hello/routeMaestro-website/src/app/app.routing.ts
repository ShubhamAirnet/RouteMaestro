import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { OtpComponent } from './pages/otp/otp.component';
import { AuthGuard } from './Services/auth.guard';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { TermCondComponent } from './pages/term-cond/term-cond.component';
import { ShippingComponent } from './pages/shipping/shipping.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { RefundComponent } from './pages/refund/refund.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItineraryComponent } from './pages/itinerary/itinerary.component';
import { FlightDetailsComponent } from './components/flight-details/flight-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    canActivate: [AuthGuard],
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
      }
    ]
  }, {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/layouts/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule)
      }
    ]
  },
  { path: 'coming-soon', component: ComingSoonComponent },
  { path: 'privacy-policy', component: PoliciesComponent },
  { path: 'terms-and-conditions', component: TermCondComponent },
  { path: 'shipping-and-delivery', component: ShippingComponent },
  { path: 'Checkout', component: CheckoutComponent },
  { path: 'refund', component: RefundComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'about-us',      component: AboutUsComponent },
  { path: 'pricing',  component:PricingComponent},
  { path:'home',component:HomeComponent},
  {path:"dashboard",component:DashboardComponent},
  {path:"itinerary" , component:ItineraryComponent},
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
