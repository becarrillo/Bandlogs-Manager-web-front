import { Component, inject, signal } from '@angular/core';
import { Band } from '../../interfaces/band';
import { User } from '../../interfaces/user';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../../interfaces/event';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BandService } from '../../services/band.service';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from '../../app.component';
import { MatDialog } from '@angular/material/dialog';
import { BandUpdateFormDialogComponent } from '../band-update-form-dialog/band-update-form-dialog.component';
import { ManagingBandAction } from '../../enums/managing-band-action';
import { BandDeleteDialogComponent } from '../band-delete-dialog/band-delete-dialog.component';

@Component({
  selector: 'app-band-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './band-view.component.html',
  styleUrl: './band-view.component.css'
})
export class BandViewComponent {
  private bandService = inject(BandService);
  route = inject(ActivatedRoute);
  protected dialog = inject(MatDialog);
  cookieService = inject(CookieService);
  protected band! : Band;
  protected members = signal<User[]>([]);
  protected events = signal<Event[]>([]);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const paramStr = params.get('id-de-banda');
      if (paramStr!==null) {
        this.bandService
          .getBandById(parseInt(paramStr))
          .subscribe({
            next: value => {
              this.band = value;
            },
            error: err => {
              console.error(err);
              if (err.status===401) {
                localStorage.removeItem('accessToken');
                this.cookieService.delete('navigation');
                AppComponent.userIsAuthenticated.set(false);
                window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'")
                window.location.pathname = "/login";
              } else {
                window.alert("Error intentando obtener la banda");
              }
            }
          });
      }
    });
  }

  getManagingBandEnumType() {
    return ManagingBandAction;
  }

  getMusicalGenreString() {
    switch (this.band.musicalGenre.toString()) {
      case "CLASSICAL":
        return "Música clásica";
        break;
      case "COMERCIAL_JAZZ":
        return "Jazz";
        break;
      case "COMERCIAL_ROCK":
        return "Rock";
        break;
      case "COMERCIAL_POP":
        return "Pop";
        break;
      case "COMERCIAL_VALLENATO":
        return "Vallenato";
        break;
      case "FOLKLORIC":
        return "Folclórico";
        break;
      case "AFRO_MUSIC":
        return "Africano";
        break;
      case "EXPERIMENTAL":
        return "Música experimental";
        break;
      default:
        return "Otro";
    }
  }

  getTheme() {
    return localStorage.getItem('theme');
  }

  openFormDialog(action : ManagingBandAction, data : any) {
    if (action===ManagingBandAction.TO_UPDATE) {
      this.dialog.open(BandUpdateFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
    if (action===ManagingBandAction.TO_DELETE) {
      this.dialog.open(BandDeleteDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
  }
}
