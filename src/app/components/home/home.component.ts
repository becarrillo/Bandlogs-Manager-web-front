import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, IMAGE_LOADER } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CookieService } from 'ngx-cookie-service';

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
  cookieService = inject(CookieService);
  
  theme! : string;

  static closeWindowSignal = signal<boolean>(false);
  
  constructor() {
    let theme = localStorage.getItem('theme');
    if (theme!==null) 
      this.theme = theme;
  }

  encodeURIParamValue(uri : string) : string {
    return encodeURI(uri);
  }

  decodeURIParamValue(uri : string) : string {
    return decodeURI(uri);
  }

  getLoggedInUsername(): string {
    return this.cookieService.get('loggedInUsername');
  }

  getToken() : string {
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
