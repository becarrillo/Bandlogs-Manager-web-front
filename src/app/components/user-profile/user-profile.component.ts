import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { FormControl, Validators } from '@angular/forms';
import { Band } from '../../interfaces/band';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { BandService } from '../../services/band.service';
import { CookieService } from 'ngx-cookie-service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UserUpdateFormDialogComponent } from '../user-update-form-dialog/user-update-form-dialog.component';
import { FormSuspenseComponent } from "../form-suspense/form-suspense.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule, FormSuspenseComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  userService = inject(UserService);
  bandService = inject(BandService);
  readonly dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private cookieService = inject(CookieService);
  user : User | null = null;
  bandControl = new FormControl<string>('', [Validators.minLength(3)]);
  bands : Band[] = [];
  loading = signal(false);

  constructor() {
    this.cookieService.delete('loggedInUsername');
    this.route.paramMap.subscribe(params => {
      const nickname = params.get('nombre-de-usuario');
      if (nickname!==null) {
        this.userService.getUserByNickname(nickname)
          .subscribe({
            next: (value) => {
              this.user = value;
            },
            error: (err) => {
              if (err.status===401) {
                localStorage.removeItem('accessToken');
                this.cookieService.delete('navigation');
                window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
                this.router.navigateByUrl('/login');
              }
            }
          });
        this.cookieService.set(
          'navigation',
          '/dashboard/usuarios/usuario;nombre-de-usuario='.concat(nickname)
        );
      }
    });
    if (this.getLoggedInUsername()!==undefined) {
      this.bandService
        .listBandsByDirector(this.getLoggedInUsername())
        .subscribe(value => {
          this.bands = value.filter(b => b.users?.filter(u => u.userId!==this.user!.userId).length===0);
        });
    }
  }

  getUserInitials(firstname:string, lastname:string) {
    return firstname[0].toUpperCase() + lastname[0].toUpperCase();
  }

  getLoggedInUsername() {
    return this.cookieService.get('loggedInUsername');
  }

  onBandSelectionChange(ev : MatSelectChange) {
    const band = this.bands.find(b => b.name===ev.value);
    this.bandService.patchMemberUserToBand(band!.bandId, this.user!);
  }

  openDialog() {
    this.dialog.open(UserUpdateFormDialogComponent, {
      data: {
        user: this.user,
        loading: this.loading
      },
      enterAnimationDuration: 4,
      hasBackdrop: true
    })
  }
}
