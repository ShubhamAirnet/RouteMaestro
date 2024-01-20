import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlightCardComponent } from './flight-card/flight-card.component';
import { FlightDetailsComponent } from './flight-details/flight-details.component';
import { FlightSetCardComponent } from './flight-set-card/flight-set-card.component';
import { AlternateFlightOptionsComponent } from './alternate-flight-options/alternate-flight-options.component';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    FlightCardComponent,
    FlightDetailsComponent,
    FlightSetCardComponent,
    AlternateFlightOptionsComponent,
    AdminNavbarComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    FlightCardComponent,
    FlightDetailsComponent,
    FlightSetCardComponent,
    AlternateFlightOptionsComponent,
    AdminNavbarComponent
  ]
})
export class ComponentsModule { }
