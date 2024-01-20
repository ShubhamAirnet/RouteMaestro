import { Routes } from '@angular/router';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AuthGuard } from 'src/app/Services/auth.guard';
import { CollectionsComponent } from 'src/app/pages/collections/collections.component';
import { ComingSoonComponent } from 'src/app/pages/coming-soon/coming-soon.component';
import { CheckoutComponent } from 'src/app/pages/checkout/checkout.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'generate-aI-itinerary',  component: DashboardComponent },
    { path: 'dashboard/:id',  component: DashboardComponent,canActivate: [AuthGuard] },
    { path: 'user-profile',   component: UserProfileComponent, canActivate: [AuthGuard]},
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent},
    { path: 'icons/:id',      component: IconsComponent},
    { path: 'maps',           component: MapsComponent },
    { path: 'collections',    component: CollectionsComponent },
    { path: 'generate-aI-itinerary/:responseId', component: DashboardComponent },

];
