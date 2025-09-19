import {  Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoggedInUserMenuComponent } from '../logged-in-user-menu/logged-in-user-menu.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { Router, RouterLink } from '@angular/router';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    LoggedInUserMenuComponent,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  cookieService = inject(CookieService);
  router = inject(Router);
  protected allUsers : User[] | null = null;
  userRoleObject! : IUserRole;
  loading = signal(false);
  longText = "Realiza acciones de administrador sobre usuarios de la plataforma.";
  menuItemSelectionIsConsult = signal(false);
  searchUserForm = new FormGroup({
    searchUserControl: new FormControl<string>('', {
      validators: [
        Validators.required,
        Validators.minLength(3)
      ],
      nonNullable: true
    })
  });
  displayedColumns: string[] = ['userId', 'firstname', 'lastname', 'nickname', 'phoneNumber', 'role'];
  dataSource! : MatTableDataSource<User, MatPaginator>;

  constructor() {
    this.authService.getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
        },
        error: (err) => {
          window.alert("Error: ".concat(err.message));
          AppComponent.userIsAuthenticated.set(false);
          this.cookieService.delete('accessToken');
          this.router.navigateByUrl('/login');
        }
      });
    this.cookieService.set('navigation', '/dashboard/usuarios');
    // for redirect after successful user login when try to visit this page and not being logged in
  }

  handleMenuItem(menuItem: string) {
    switch (menuItem) {
      case "consultar":
        this.menuItemSelectionIsConsult.set(true);
        break;
      case "listar":
        this.loading.set(true);
        this.fetchUsers();
    }
  }

  fetchUsers() : void {
    this.userService.listAll()
      .subscribe({
        next: (value) => {
          this.allUsers = value;
          this.dataSource = new MatTableDataSource<User>(this.allUsers);
          this.loading.set(false);
        },
        error: (err) => {
          window.alert("Error: ".concat(err.message));
          if (err.status===401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            this.cookieService.delete('navigation');
            this.loading.set(false);
            this.router.navigateByUrl('/login');
          }
        }
      });
  }

  getSectionName() {
    return "users";
  }

  onSearchUser() {
    this.loading.set(true);
    const nickname = this.searchUserForm.value.searchUserControl!;
    if (nickname.length >= 3) {
      this.userService
          .getUserByNickname(nickname)
          .subscribe({
            next: (value) => {
              value!==undefined && value!==null ? (
                this.allUsers = [value],
                this.dataSource = new MatTableDataSource<User>(this.allUsers)
              ) : (
                window.alert("No se encontró el usuario: ".concat(nickname))
              );
              this.loading.set(false);
            },
            error: (err) => {
              window.alert("Error: ".concat(err.message));
              if (err.status===401) {
                localStorage.removeItem('accessToken');
                AppComponent.userIsAuthenticated.set(false);
                this.cookieService.delete('navigation');
                this.loading.set(false);
                this.router.navigateByUrl('/login');
              }
              this.loading.set(false);
            }
          });
    } else {
      window.alert("Por favor, ingresa un nickname válido con al menos 3 caracteres.");
      this.loading.set(false);
    }
  }
}
