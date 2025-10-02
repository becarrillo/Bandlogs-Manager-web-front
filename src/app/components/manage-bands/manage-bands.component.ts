import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, WritableSignal } from '@angular/core';
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
import { SearchUserFormFieldComponent } from '../search-user-form-field/search-user-form-field.component';


@Component({
  selector: 'app-manage-bands',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    RouterLink,
    SearchUserFormFieldComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-bands.component.html',
  styleUrl: './manage-bands.component.css'
})
export class ManageBandsComponent {
  protected readonly bandService = inject(BandService);
  protected readonly authService = inject(AuthService);
  protected readonly cookieService = inject(CookieService);
  readonly router = inject(Router);

  menuItemSelectionIsConsult = signal(false);
  userRoleObject!: IUserRole;
  loading = signal(false);
  readonly dialog = inject(MatDialog);
  protected bandNameControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  longText!: string;
  private static bands: Band[] = [];
  readonly bandsAreListed = signal(false);
  filteredBands: WritableSignal<Band[]> = signal([]);
  allBandsAreListedAsAdmin = false;
  bandsAreFilteredByDirector = false;
  displayedColumns: string[] = ['name', 'director', 'musicalGenre', 'action'];
  protected dataSource = new MatTableDataSource<Band, MatPaginator>([]);
  protected searchUserInputValue = '';

  constructor() {
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
          if (this.userRoleObject.role === UserRole.ROLE_ADMIN)
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

    if (this.userRoleObject.role.toString() === 'ROLE_ADMIN') {  // check the logged in user role
      setAllBands();
      this.longText = "Las siguientes son todas las bandas registradas en el sistema que puedes visualizar como admin.";
    } else {
      this.setBandsByMember(this.userRoleObject.nickname.trim());
      this.longText = "Las siguientes son las bandas en las que eres miembro, puedes visualizar su información.";
    }
  }

  protected filterBandsByUserAsDirector(director: string) {
    this.loading.set(true);
    this.allBandsAreListedAsAdmin = false;
    this.bandsAreFilteredByDirector = true;
    this.longText = "Las siguientes son las bandas que dirijes. Puedes visualizar, actualizar o borrar su información."
    this.dataSource = new MatTableDataSource<Band, MatPaginator>(
      ManageBandsComponent.bands.filter(value => value.director === director)
    );
    this.loading.set(false);
  }

  protected filterBandsByUserAsMember(member: string) {
    this.loading.set(true);
    this.allBandsAreListedAsAdmin = false;
    this.longText = "Las siguientes son las bandas en las que eres miembro, puedes visualizar su información."
    if (this.bandsAreFilteredByDirector) {
      this.loading.set(true);
      this.setBandsByMember(member);
    } else {
      this.dataSource = new MatTableDataSource<Band, MatPaginator>(
        ManageBandsComponent.bands.filter(value => value.users?.findIndex(u => u.nickname === member) !== -1)
      );
      this.loading.set(false);
    }
  }

  handleMenuItem(menuItem: string) {
    if (menuItem === "listar") {
      if (this.menuItemSelectionIsConsult())
        this.menuItemSelectionIsConsult.set(false);
      this.loading.set(true);
      this.fetchBands();
    }
    if (menuItem === "consultar")
      this.menuItemSelectionIsConsult.set(true);
    if (menuItem === "estadísticas") {
      this.router.navigate(['/dashboard/bandas/estadisticas']);
    }
  }

  onFilterBandsInputFocus() {
    if (this.userRoleObject.role.toString()==='ROLE_ADMIN') {
      if (ManageBandsComponent.bands.length>1) {
        this.filteredBands.set(ManageBandsComponent.bands);
      } else {
        this.bandService
            .listAllBands()
            .subscribe(values => {
              ManageBandsComponent.bands = values;
              this.filteredBands.set(ManageBandsComponent.bands);
            });
      }
    } else {
      if (ManageBandsComponent.bands.length>1) {
        this.filteredBands.set(ManageBandsComponent.bands);
      } else {
        this.bandService
            .listBandsByMemberUserNickname(this.userRoleObject.nickname)
            .subscribe(values => {
              ManageBandsComponent.bands = values;
              this.filteredBands.set(ManageBandsComponent.bands);
            });
      }
    }
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
            next: (values) => {
              if (values.length > 0) {
                const bands = values.filter(v => {
                  const users = v.users!;
                  users.findIndex(user => user.nickname===this.searchUserInputValue)===-1;
                });
                if (bands.length===0) {
                  window.alert("No tienes bandas dirigidas donde puedas invitar a "+this.searchUserInputValue);
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

  onSearchBand() {
    var name = this.bandNameControl.value;
    if (name!==null && name.length >= 1) {
      name = name.includes(' ') ? name.toLowerCase().trim() : name.toLowerCase();
      this.loading.set(true);
      this.bandService
          .listBandsByNameContaining(name)
          .subscribe({
            next: (value) => {
              ManageBandsComponent.bands = value;
              this.dataSource = new MatTableDataSource<Band, MatPaginator>(ManageBandsComponent.bands);
              this.bandsAreListed.set(true);
              console.log(ManageBandsComponent.bands);
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
              } else if (err.status === 403) {  // if user is authenticated but
                // doesn't have any authority to perform the operation then an alert is shown
                window.alert("No tienes permisos para realizar esta operación");
                this.loading.set(false);
              } else if (err.status === 404) {
                window.alert("No se encontró ninguna banda con ese nombre");
                this.loading.set(false);
              } else {
                console.error(err.message);
                this.loading.set(false);
              }
            }
          })
    } else {
      window.alert("Por favor, ingresa un texto válido con al menos 1 caracter.");
    }
  }

  onSearchUser(nickname : string) {
    this.searchUserInputValue = nickname;
  }

  private setBandsByMember(nickname: string) {
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

  protected get managingBandActionEnumType() {
    return ManagingBandAction;
  }
}
