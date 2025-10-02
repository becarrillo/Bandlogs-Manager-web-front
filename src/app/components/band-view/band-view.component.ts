import { Component, inject, signal } from '@angular/core';
import { Band } from '../../interfaces/band';
import { User } from '../../interfaces/user';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../../interfaces/event';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { BandService } from '../../services/band.service';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from '../../app.component';
import { BandUpdateFormDialogComponent } from '../band-update-form-dialog/band-update-form-dialog.component';
import { ManagingBandAction } from '../../enums/managing-band-action';
import { EventDeleteDialogComponent } from '../event-delete-dialog/event-delete-dialog.component';
import { EventUpdateFormDialogComponent } from '../event-update-form-dialog/event-update-form-dialog.component';
import {
  MembershipInvitationFormDialogComponent
} from '../membership-invitation-form-dialog/membership-invitation-form-dialog.component';
import { SearchUserFormFieldComponent } from '../search-user-form-field/search-user-form-field.component';
import { BandDeleteDialogComponent } from '../band-delete-dialog/band-delete-dialog.component';
import { IUserRole } from '../../interfaces/i-user-role';
import { Router } from '@angular/router';


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
  private static band = signal<Band>({} as Band);
  protected members = signal<User[]>([]);
  protected events = signal<Event[]>([]);
  readonly memberUserColumns: string[] = ['lastname', 'firstname', 'nickname', 'phoneNumber', 'action'];
  readonly eventsColumns: string[] = ['date', 'description', 'location', 'action'];

  constructor() {
    this.route.paramMap.subscribe(params => {
      const paramStr = params.get('id-de-banda');
      if (paramStr !== null) {
        this.bandService
          .getBandById(parseInt(paramStr))
          .subscribe({
            next: value => {
              BandViewComponent.band.set(value);
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
    if (!confirm)
      return;
    var newVersionBand : Band = band;
    newVersionBand['users'] = band.users?.filter(u => {
      return u !== memberUser;
    });
    
    this.bandService
        .updateBand(BandViewComponent.band().bandId, newVersionBand)
        .subscribe({
          next: (value) => {
            BandViewComponent.band.set(value);
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

  getManagingBandEnumType() {
    return ManagingBandAction;
  }

  /** Transform band musical genre enum type to a (es) string */
  getMusicalGenreString() {
    switch (BandViewComponent.band().musicalGenre.toString()) {
      case "CLASSICAL":
        return "Música clásica";
        break;
      case "COMERCIAL_BALLAD":
        return "Balada";
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
      case "COMERCIAL_LATIN":
        return "Latino";
      case "COMERCIAL_MEX":
        return "Mexicano";
        break;
      case "COMERCIAL_CUMBIA_VALLENATO":
        return "Cumbia/Vallenato";
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
        data: { band: BandViewComponent.band() },
        enterAnimationDuration: 4,
        hasBackdrop: true
      })
    }
    if (action === ManagingBandAction.TO_ADD_MEMBER_TO_BAND) {
      this.dialog.open(BandSearchAndAddMemberDialogComponent, {
        data: {
          loggedInUsername: this.userRoleObject.nickname,
          bandId: BandViewComponent.band().bandId,
          bandService: this.bandService
        },
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

  public get _band() {
    return BandViewComponent.band();
  }

  static set _band(value: Band) {
    BandViewComponent.band.set(value);
  }
}

@Component({
  selector: 'app-band-search-and-add-member-dialog-component',
  standalone: true,
  imports: [
    MatDialogModule,
    SearchUserFormFieldComponent
  ],
  template: `
    <mat-dialog-content>
      <app-search-user-form-field
          (searchUser)="
            onSearchUser($event);
            openNextFormDialog();
          "
          [loggedInUsername]="_data.loggedInUsername"
        >
      </app-search-user-form-field>
    </mat-dialog-content>
  `,
  styleUrl: './band-view.component.css'
})
export class BandSearchAndAddMemberDialogComponent {
  private readonly data = inject<{
    loggedInUsername: string;
    bandId: number;
    bandService: BandService;
  }>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<BandSearchAndAddMemberDialogComponent>)
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);
  searchUserInputValue : string = '';

  onSearchUser(value : string) {
    this.searchUserInputValue = value;
  }

  openNextFormDialog() {
    this.data
        .bandService
        .listBandsByDirector(this.data.loggedInUsername)
        .subscribe({
          next: (values) => {
            const bands = values.filter(v => {
              const users = v.users!;
              users.findIndex(user => user.nickname===this.searchUserInputValue)===-1;
            });
            if (bands.length===0) {
              window.alert("No tienes bandas dirigidas pendientes para invitar a "+this.searchUserInputValue);
              this.dialogRef.close();
              return;
            }
            this.dialog.open(MembershipInvitationFormDialogComponent, {
              data: {
                bands,
                userNickname: this.searchUserInputValue
              },
              enterAnimationDuration: 4,
              hasBackdrop: true
            });
          },
          error: (err) => {
            if (err.status === 401) {
              window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a '/login'");
              this.cookieService.delete('navigation');
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              this.router.navigateByUrl('/login');
            } else if (err.status === 403) {
              window.alert("No tienes permisos para realizar esta operación");
            } else {
              window.alert("Error en la operación de obtener las bandas: ".concat(err.message));
              this.router.navigateByUrl('/login');
            }
            console.error(err);
          },
        });
  }

  protected get _data() {
    return this.data;
  }
}
