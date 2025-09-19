import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, IMAGE_LOADER } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CookieService } from 'ngx-cookie-service';
import { IUserRole } from '../../interfaces/i-user-role';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonModule,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (src: string) => {
        return new URL(src, import.meta.url).href;
      }
    }
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);
  cookieService = inject(CookieService);

  theme!: string;
  protected loggedInUserRole!: IUserRole;

  static closeWindowSignal = signal<boolean>(false);

  constructor() {
    let theme = localStorage.getItem('theme');
    if (theme !== null)
      this.theme = theme;
    const token = localStorage.getItem('accessToken');
    if (token !== null && token.length > 0) {
      this.authService
        .getAuthenticatedUserRole()
        .subscribe({
          next: (value) => {
            this.loggedInUserRole = value;
          },
          error: (err) => {
            if (err.status === 401) {
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              window.alert("Sesión de usuario expirada, serás redirigido al login");
              this.router.navigateByUrl('/login');
            } else if (err.status === 500) {
              window.alert("Error interno del servidor");
            } else {
              console.error(err.message);
            }
          }
        });
    }
  }

  encodeURIParamValue(uri: string): string {
    return encodeURI(uri);
  }

  decodeURIParamValue(uri: string): string {
    return decodeURI(uri);
  }

  getLoggedInUsername(): string {
    return this.cookieService.get('loggedInUsername');
  }

  getTheme() {
    return localStorage.getItem('theme');
  }

  getToken(): string {
    const token = localStorage.getItem('accessToken');
    return token ?? '';
  }

  protected logout() {
    this.authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedInUsername');
    this.cookieService.delete('navigation');
  }
}
