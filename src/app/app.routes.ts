import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { CalendarComponent } from './components/calendar/calendar.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';


export const routes: Routes = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: UserRegistrationComponent},
    {    
        path: 'dashboard',
        loadChildren: () => import("./modules/dashboard/dashboard.module")
            .then(m => m.DashboardModule),
        canActivateChild: [authGuard]
    },
    {
        path: 'calendario',
        component: CalendarComponent,
        canActivateChild: [authGuard]
    },
];
