import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
  bandService = inject(BandService);
  userService = inject(UserService);
  authService = inject(AuthService);
  cookieService = inject(CookieService);
  router = inject(Router);

  userRoleObject!: IUserRole;
  loading = signal(false);
  readonly dialog = inject(MatDialog);
  protected userNicknameControl = new FormControl('', [Validators.required]);
  longText!: string
  protected allBands!: Band[];
  filteredUsers = signal<User[]>([]);
  displayedColumns: string[] = ['name', 'director', 'musicalGenre', 'action'];
  dataSource = new MatTableDataSource<Band, MatPaginator>([]);

  /** It is used to filter users in the autocomplete input */
  @ViewChild('filterInput') input!: ElementRef<HTMLInputElement>;

  constructor() {
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
        },
        error: (err) => {
          window.alert("Error intentando obtener usuario autenticado y rol");
          if (err.status===401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
            this.router.navigateByUrl('/login');
          }
        }
      });
    this.cookieService.set('navigation', '/dashboard/bandas');
    // for redirect after successful user login when try to visit this page and not being logged in
  }

  handleMenuItem(menuItem: string) {
    if (menuItem === 'listar') {
      this.fetchBands();
      this.loading.set(true);
    }
    if (menuItem === 'crear') {
      window.alert("Ir a crear");
    }
  }

  private fetchBands(): void {
    /** this local arrow function constant doesn't return anything and it is used when the user is an admin
     * and it is used to set all bands in the dataSource attribute **/
    const setAllBands = () => {
      this.bandService.listAllBands()
        .subscribe({
          next: (value) => {
            this.allBands = value;
            this.dataSource = new MatTableDataSource<Band, MatPaginator>(this.allBands);
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
     * is a director of a band and it is used to set all bands in the dataSource attribute */
    const setBandsByMember = (nickname: string) => {
      console.log(this.userRoleObject.nickname, " is authUser");
      this.bandService.listBandsByMemberUserNickname(nickname)
        .subscribe({
          next: (value) => {
            this.loading.set(false);
            this.allBands = value;
            this.dataSource = new MatTableDataSource<Band, MatPaginator>(this.allBands);
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
    
    if (this.userRoleObject.role===UserRole.ROLE_ADMIN) {  // check the logged in user role
      setAllBands();
      this.longText = "Las siguientes son todas las bandas registradas en el sistema.";
    } else {
      setBandsByMember(this.userRoleObject.nickname);
      this.longText = "Las siguientes son las bandas en las que eres director (es probable que las hayas creado). "
      + "Puedes hacer click en el nombre de la misma para agregar nuevos miembros, editar o eliminar la banda";;
    }
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

  onFilterUsersInputFocus() {
    this.userService.listAll()
      .subscribe({
        next: (value) => {
          this.filteredUsers.set(
            value.filter(element => {
              return element.nickname!==this.userRoleObject.nickname;
            }
          ));
        },
        error: (err) => {
          window.alert("Error en la operación de obtener los usuario(s)");
        },
      });
  }

  getManagingBandEnumType() {
    return ManagingBandAction;
  }

  openFormDialog(action : ManagingBandAction, data : any) {
    if (action === ManagingBandAction.TO_CREATE) {
      this.dialog.open(BandCreateFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      });
      return;

    } else if (action === ManagingBandAction.TO_ADD_MEMBER_TO_BAND) {
      this.dialog.open(MembershipInvitationFormDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
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
}
