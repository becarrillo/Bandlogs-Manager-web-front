import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoggedInUserMenuComponent } from '../logged-in-user-menu/logged-in-user-menu.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipInvitationFormDialogComponent } from '../membership-invitation-form-dialog/membership-invitation-form-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Band } from '../../interfaces/band';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { BandService } from '../../services/band.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { IUserRole } from '../../interfaces/i-user-role';
import { UserRole } from '../../enums/user-role';
import { ManagingBandAction } from '../../enums/managing-band-action';
import { BandUpdateFormDialogComponent } from '../band-update-form-dialog/band-update-form-dialog.component';
import { AppComponent } from '../../app.component';
import { BandCreateFormDialogComponent } from '../band-create-form-dialog/band-create-form-dialog.component';
import { BandDeleteDialogComponent } from '../band-delete-dialog/band-delete-dialog.component';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-manage-bands',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormField,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    FormSuspenseComponent,
    LoggedInUserMenuComponent,
    ReactiveFormsModule,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-bands.component.html',
  styleUrl: './manage-bands.component.css'
})
export class ManageBandsComponent {
  protected readonly bandService = inject(BandService);
  protected readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);
  protected readonly cookieService = inject(CookieService);
  readonly router = inject(Router);

  userRoleObject!: IUserRole;
  loading = signal(false);
  readonly dialog = inject(MatDialog);
  protected userNicknameControl = new FormControl('', Validators.required);
  longText!: string;
  private static bands: Band[] = [];
  readonly bandsAreListed = signal(false);
  filteredUsers = signal<User[]>([]);
  allBandsAreListedAsAdmin = false;
  bandsAreFilteredByDirector = false;
  displayedColumns: string[] = ['name', 'director', 'musicalGenre', 'action'];
  protected dataSource = new MatTableDataSource<Band, MatPaginator>([]);

  /** It is used to filter users in the autocomplete input */
  @ViewChild('filterInput') input!: ElementRef<HTMLInputElement>;

  constructor() {
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
          if (this.userRoleObject.role===UserRole.ROLE_ADMIN)
            this.allBandsAreListedAsAdmin = true;
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
            this.router.navigateByUrl('/login');
          } else {
            window.alert("Error intentando obtener usuario autenticado y rol");
          }
        }
      });
  }

  protected fetchBands(): void {
    /** this local arrow function constant doesn't return anything and it is used when the user is an admin
     * and it is used to set all bands in the dataSource attribute **/
    const setAllBands = () => {
      this.bandService.listAllBands()
        .subscribe({
          next: (value) => {
            ManageBandsComponent.bands = value;
            this.dataSource = new MatTableDataSource<Band, MatPaginator>(ManageBandsComponent.bands);
            this.allBandsAreListedAsAdmin = true;
            this.bandsAreListed.set(true);
            this.loading.set(false);
          },
          error: (err) => {
            if (err.status === 401) { // if the user is not authenticated, then redirect to login page
              window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a '/login'");
              this.cookieService.delete('navigation');
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              this.loading.set(false);
              this.router.navigateByUrl('/login');
            } else if (err.status === 403) {
              // if user is authenticated but doesn't have any authority to perform the operation then an alert is shown
              window.alert("No tienes permisos para realizar esta operación");
            } else {
              window.alert("Error en la operación de obtener las bandas: ".concat(err.message));
            }
            this.loading.set(false);
          },
        });
    }

    /** this constant function doesn't return anything and it is used when the user
     * is a member of a band and it is used to set all bands in the dataSource attribute */
    const setBandsByMember = (nickname: string) => {
      this.bandService.listBandsByMemberUserNickname(nickname)
        .subscribe({
          next: (value) => {
            ManageBandsComponent.bands = value;
            this.dataSource = new MatTableDataSource<Band, MatPaginator>(ManageBandsComponent.bands);
            this.allBandsAreListedAsAdmin = false;
            this.bandsAreListed.set(true);
            if (this.bandsAreFilteredByDirector)
              this.bandsAreFilteredByDirector = false;
            this.loading.set(false);
          },
          error: (err) => {
            if (err.status === 401) {
              window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a '/login'");
              this.loading.set(false);
              this.cookieService.delete('navigation');
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              this.router.navigateByUrl('/login');
            } else if (err.status === 403) {
              window.alert("No tienes permisos para realizar esta operación");
              this.loading.set(false);
            } else {
              window.alert("Error en la operación de obtener las bandas: ".concat(err.message));
              this.loading.set(false);
              this.router.navigateByUrl('/login');
            }
          },
        });
    }

    if (this.userRoleObject.role.toString() === 'ROLE_ADMIN') {  // check the logged in user role
      setAllBands();
      this.longText = "Las siguientes son todas las bandas registradas en el sistema que puedes visualizar como admin.";
    } else {
      setBandsByMember(this.userRoleObject.nickname.trim());
      this.longText = "Las siguientes son las bandas en las que eres miembro, puedes visualizar su información.";
    }
  }

  protected filterBandsByUserAsDirector(director : string) {
    this.loading.set(true);
    this.allBandsAreListedAsAdmin = false;
    this.bandsAreFilteredByDirector = true;
    this.longText = "Las siguientes son las bandas que dirijes. Puedes visualizar, actualizar o borrar su información."
    this.dataSource = new MatTableDataSource<Band, MatPaginator>(
      ManageBandsComponent.bands.filter(value => value.director===director)
    );
    this.loading.set(false);
  }

  protected filterBandsByUserAsMember(member : string) {
    this.loading.set(true);
    this.allBandsAreListedAsAdmin = false;
    this.bandsAreFilteredByDirector = true;
    this.longText = "Las siguientes son las bandas en las que eres miembro, puedes visualizar su información."
    this.dataSource = new MatTableDataSource<Band, MatPaginator>(
      ManageBandsComponent.bands.filter(value => value.users?.findIndex(u => u.nickname===member)!==-1)
    );
    this.loading.set(false);
  }

  /** It set (again) saved users into filteredUsers attribute, wich correspond to a filter users signal  */
  filterUsers() {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredUsers.set(
      this.filteredUsers()
        .filter(user => {
          const substring = user
            .nickname
            .toLowerCase()
            .normalize("NFD")
            // characters with tildes (and other accents) are converted to their plain, unaccented counterparts,
            // through normalize() and regular expression /[\\u0300-\\u036f]/g allowing for case-insensitive and
            // accent-insensitive comparisons or searches
            .replace(/[\u0300-\u036f]/g, "")
            .substring(0, filterValue.length);
          return substring === filterValue;
        })
    );
  }

  handleMenuItem(menuItem: string) {
    if (menuItem === 'listar') {
      this.loading.set(true);
      this.fetchBands();
    }
    if (menuItem === 'estadísticas') {
      this.router.navigate(['/dashboard/bandas/estadisticas']);
    }
  }

  onFilterUsersInputFocus() {
    this.userService.listAll()
      .subscribe({
        next: (value) => {
          this.filteredUsers.set(
            value.filter(element => {
              return element.nickname !== this.userRoleObject.nickname;
            }
            ));
        },
        error: () => {
          window.alert("Error en la operación de obtener los usuario(s)");
        },
      });
  }

  getManagingBandEnumType() {
    return ManagingBandAction;
  }

  openFormDialog(action: ManagingBandAction, data?: any) {
    if (action === ManagingBandAction.TO_CREATE) {
      this.dialog.open(BandCreateFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      });
    } else if (action === ManagingBandAction.TO_ADD_MEMBER_TO_BAND) {
      this.bandService.listBandsByDirector(this.userRoleObject.nickname)
        .subscribe({
          next: (value) => {
            if (value.length>0) {
              this.dialog.open(MembershipInvitationFormDialogComponent, {
                data: {
                  bands: value,
                  userNickname: this.userNicknameControl.value as string
                },
                enterAnimationDuration: 4,
                hasBackdrop: true
              });
            } else {
              window.alert("Aún no eres director de al menos una banda");
            }
          },
          error: (err) => {
            if (err.status === 401) { // if the user is not authenticated, then redirect to login page
              window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a NUESTRO '/login'");
              this.cookieService.delete('navigation');
              localStorage.removeItem('accessToken');
              AppComponent.userIsAuthenticated.set(false);
              this.loading.set(false);
              this.router.navigateByUrl('/login');
            } else if (err.status === 403) {
              // if user is authenticated but doesn't have any authority to perform the operation then an alert is shown
              window.alert("No tienes permisos para realizar esta operación");
            } else {
              window.alert("Error desconocido en la operación de obtener todas las bandas");
            }
          },
        });
    } else if (action === ManagingBandAction.TO_UPDATE) {
      this.dialog.open(BandUpdateFormDialogComponent,
        {
          data,
          enterAnimationDuration: 4,
          hasBackdrop: true
        }
      );
    } else {
      this.dialog.open(BandDeleteDialogComponent,
        {
          data,
          enterAnimationDuration: 4,
          hasBackdrop: true
        }
      );
    }
  }

  translateGenreToESString(genreStr: string) {
    switch (genreStr) {
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

  get _bands() {
    return ManageBandsComponent.bands;
  }
}
