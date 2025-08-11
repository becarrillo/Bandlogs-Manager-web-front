import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: UserRegistrationComponent},
    {    
        path: 'dashboard',
        loadChildren: () => import("./modules/dashboard/dashboard.module")
            .then(m => m.DashboardModule),
        canActivateChild: [authGuard]
    }
];
