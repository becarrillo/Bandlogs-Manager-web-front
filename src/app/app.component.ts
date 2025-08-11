import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Bandlogs-Manager-web-front';
  private router = inject(Router);
  cookieService = inject(CookieService);
  authService = inject(AuthService);
  static userIsAuthenticated = signal<boolean>(false);

  constructor() {
    const accessToken = localStorage.getItem('accessToken');
    AppComponent.userIsAuthenticated.set(
      accessToken!==null && accessToken.length>0
    );
    if (localStorage.getItem('theme')===null)
      localStorage.setItem('theme','light');
  }


  getPath() {
    return this.router.url;
  }

  getTheme() {
    return localStorage.getItem('theme');
  }

  isUserAuthenticated() {
    return AppComponent.userIsAuthenticated();
  }

  navigateToPath(path : string) {
    this.router.navigate(path.split('/'));
  }

  setTheme() {
    var theme = localStorage.getItem('theme');
    theme==='dark' ? theme = 'light' : theme = 'dark';
    localStorage.setItem('theme', theme);
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedInUsername');
    this.cookieService.delete('navigation');
    AppComponent.userIsAuthenticated.set(false);
    this.router.navigateByUrl('/login');
  }
}
