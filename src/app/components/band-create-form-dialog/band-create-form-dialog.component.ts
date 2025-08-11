import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MUSICAL_GENRES } from '../../constants';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MusicalGenre } from '../../enums/musical-genre';
import { MatOptionModule } from '@angular/material/core';
import { BandService } from '../../services/band.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-band-create-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './band-create-form-dialog.component.html',
  styleUrl: './band-create-form-dialog.component.css'
})
export class BandCreateFormDialogComponent {
  bandService = inject(BandService);
  userService = inject(UserService);
  protected router = inject(Router);
  protected data = inject<
    {
      loggedInUsername: string,
      loading: WritableSignal<boolean>,
      cookieService: CookieService
    }>(MAT_DIALOG_DATA);
  protected bandCreateForm = new FormBuilder().group({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(4)]),
    musicalGenre: new FormControl<MusicalGenre>(MusicalGenre.OTHER, [Validators.required])
  });
  dialogRef = inject(MatDialogRef<BandCreateFormDialogComponent>)
  loading = signal(false);

  _snackBar = inject(MatSnackBar);
  
  getMusicalGenres() {
      return MUSICAL_GENRES;
    }
  
    onMusicalGenreSelection(ev : MatSelectChange) {
      this.bandCreateForm.controls.musicalGenre.setValue((ev.value as MusicalGenre).valueOf());
    }
  
    translateGenreToESString(genreStr : string) {
      switch (genreStr) {
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

    onSubmit() {
      if (this.bandCreateForm.valid) {
        this.loading.set(true);
        // Logic to handle form submission, e.g., call a service to create a band
        var directorUser! : User;
        this.userService
            .getUserByNickname(this.data.loggedInUsername)
            .subscribe({
              next: (user) => {
                directorUser = user;
                this.data.cookieService.set('navigation', '/dashboard/bandas');
              },
              error: (err) => {
                console.error('Error fetching user:', err);
                this._snackBar.open('Error al obtener el usuario', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['error-snackbar']
                });
                this.loading.set(false);
              }
            });
        this.bandService
            .saveBand({
              name: this.bandCreateForm.value.name!,
              musicalGenre: this.bandCreateForm.value.musicalGenre!
            })
            .subscribe({
              next: (response) => {
                this.patchMemberUserToBand(response.bandId, directorUser);
                this._snackBar.open(`Banda "${response.name}" creada exitosamente`, 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
              },
              error: (error) => {
                console.error('Error creating band:', error);
                if (error.status === 401) {
                  localStorage.removeItem('accessToken');
                  AppComponent.userIsAuthenticated.set(false);
                  window.alert(
                    "No estás autenticado (sesión expirada), para realizar la acción vuelve a ingresar"
                  );
                  this.dialogRef.close();
                  this.data.loading.set(false);
                  this.router.navigateByUrl('/login');
                } else {
                  this._snackBar.open('Hubo un error generado al crear la banda', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                  });
                  this.bandCreateForm.reset();
                  this.data.loading.set(false);
                }
              }
            });
      } else {
        console.error('Form is invalid');
      }
    }

    private patchMemberUserToBand(bandId: number, user: User) {
      this.bandService
          .patchMemberUserToBand(bandId, user)
          .subscribe({
            next: () => {
              this.bandCreateForm.reset();
              this.data.loading.set(false);
              this.loading.set(false);
              this.dialogRef.close();
            },
            error: (error) => {
              console.error('Error adding director user to band:', error);
              this._snackBar.open('Error al agregar el director a la banda', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          });
    }
}
