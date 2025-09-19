import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-dashboard-index',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterLink
  ],
  templateUrl: './dashboard-index.component.html',
  styleUrl: './dashboard-index.component.css'
})
export class DashboardIndexComponent {
  private authService = inject(AuthService);
  router = inject(Router);
  cookieService = inject(CookieService);
  userRoleObject! : IUserRole;
  
  constructor() {
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
        },
        error: (err) => {
          window.alert("Error: ".concat(err.message));
          if (err.status===401) {
            localStorage.removeItem('accessToken');
            this.cookieService.delete('navigation');
            AppComponent.userIsAuthenticated.set(false);
            this.router.navigateByUrl('/login');
          }
        }
      });
  }

  getLoggedInUsername() {
    return localStorage.getItem('loggedInUsername');
  }
}
