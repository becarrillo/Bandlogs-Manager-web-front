import { Component, effect, inject, signal } from '@angular/core';
import { Band } from '../../interfaces/band';
import { User } from '../../interfaces/user';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../../interfaces/event';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BandService } from '../../services/band.service';
import { AppComponent } from '../../app.component';
import { MatDialog } from '@angular/material/dialog';
import { BandUpdateFormDialogComponent } from '../band-update-form-dialog/band-update-form-dialog.component';
import { ManagingBandAction } from '../../enums/managing-band-action';
import { BandDeleteDialogComponent } from '../band-delete-dialog/band-delete-dialog.component';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventDeleteDialogComponent } from '../event-delete-dialog/event-delete-dialog.component';
import { UserService } from '../../services/user.service';
import { EventUpdateFormDialogComponent } from '../event-update-form-dialog/event-update-form-dialog.component';


@Component({
  selector: 'app-band-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './band-view.component.html',
  styleUrl: './band-view.component.css'
})
export class BandViewComponent {
  private bandService = inject(BandService);
  private authService = inject(AuthService);
  protected route = inject(ActivatedRoute);
  protected dialog = inject(MatDialog);
  readonly _snackbar = inject(MatSnackBar);
  protected userRoleObject!: IUserRole;
  protected band = signal<Band>({} as Band);
  protected members = signal<User[]>([]);
  protected events = signal<Event[]>([]);
  readonly memberUserColumns: string[] = ['lastname', 'firstname', 'nickname', 'phoneNumber', 'action'];
  readonly eventsColumns : string[] = ['date', 'description', 'location', 'action'];

  constructor() {
    this.route.paramMap.subscribe(params => {
      const paramStr = params.get('id-de-banda');
      if (paramStr !== null) {
        this.bandService
          .getBandById(parseInt(paramStr))
          .subscribe({
            next: value => {
              this.band.set(value);
            },
            error: err => {
              console.error(err);
              if (err.status === 401) {
                localStorage.removeItem('accessToken');
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
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
            window.location.pathname = '/login';
          } else if (err.status === 500) {
            window.alert("Error interno del servidor");
          } else {
            window.alert("Error intentando obtener usuario autenticado y rol");
          }
        }
      });
  }

  protected cancelMemberUser(band: Band, memberUser: User) {
    const confirm = window.confirm(`¿Estás seguro de retirar al miembro ${memberUser.nickname} de la banda?`);
    if (confirm) {
      band['users'] = band.users?.filter(u => {
        return u!==memberUser;
      });

      this.bandService
        .updateBand(this.band().bandId, band)
        .subscribe({
          next: (value) => {
            this.band.set(value);
            window.alert("Banda actualizada: ".concat(this.band.name));
          },
          error: (err) => {
            if (err.status === 401) {
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
              window.location.pathname = '/login';
            } else if (err.status === 500) {
              window.alert("Error interno del servidor");
            } else {
              window.alert("Error intentando modificar el evento");
            }
          }
        });
    }
  }

  getManagingBandEnumType() {
    return ManagingBandAction;
  }

  /** Transform band musical genre enum type to a (es) string */
  getMusicalGenreString() {
    switch (this.band().musicalGenre.toString()) {
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

  openFormDialog(action: ManagingBandAction, data?: any) {
    if (action === ManagingBandAction.TO_UPDATE) {
      this.dialog.open(BandUpdateFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
    if (action === ManagingBandAction.TO_DELETE) {
      this.dialog.open(BandDeleteDialogComponent, {
        data: {band: this.band()},
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
    if (action === ManagingBandAction.TO_UPDATE_EVENT_OF_BAND) {
      this.dialog.open(EventUpdateFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
    if (action === ManagingBandAction.TO_DELETE_EVENT_OF_BAND) {
      this.dialog.open(EventDeleteDialogComponent, {
        data,
        hasBackdrop: true
      })
    }
  }
}
