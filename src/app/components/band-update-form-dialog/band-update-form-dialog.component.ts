import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Band } from '../../interfaces/band';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MusicalGenre } from '../../enums/musical-genre';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from "@angular/material/core";
import { MUSICAL_GENRES } from '../../constants';
import { BandService } from '../../services/band.service';
import { UserService } from '../../services/user.service';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { User } from '../../interfaces/user';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { AppComponent } from '../../app.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BandUpdateSuccessSnackBarComponent } from '../band-update-success-snack-bar/band-update-success-snack-bar.component';
import { BandViewComponent } from '../band-view/band-view.component';

@Component({
  selector: 'app-band-update-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatOptionModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './band-update-form-dialog.component.html',
  styleUrl: './band-update-form-dialog.component.css'
})
export class BandUpdateFormDialogComponent {
  protected data = inject<{ band: Band }>(MAT_DIALOG_DATA);
  protected bandService = inject(BandService);
  protected userService = inject(UserService);
  protected readonly dialogRef = inject(MatDialogRef<BandUpdateFormDialogComponent>);
  readonly _snackBar = inject(MatSnackBar);
  readonly router = inject(Router);
  protected bandUpdateForm = new FormBuilder().group({
    name: new FormControl<string>(this.data.band.name, [Validators.minLength(4)]),
    musicalGenre: new FormControl<MusicalGenre>(this.data.band.musicalGenre),
    director: new FormControl<string>(this.data.band.director)
  });
  filteredUsers = signal<User[]>([]);
  readonly loading = signal(false);

  /** It is used to filter users in the autocomplete input */
  @ViewChild('filterInput') input!: ElementRef<HTMLInputElement>;

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

  getMusicalGenres() {
    return MUSICAL_GENRES;
  }

  onMusicalGenreSelection(ev: MatSelectChange) {
    this.bandUpdateForm.controls.musicalGenre.setValue((ev.value as MusicalGenre).valueOf());
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

  onFilterUsersInputFocus() {
    this.userService
      .listAll()
      .subscribe(value => {
        this.filteredUsers.set(value)
      });
  }

  onSubmit() {
    this.loading.set(true);
    const directorUsername = this.bandUpdateForm.controls.director.value;
    if (directorUsername !== null) {
      this.userService
        .getUserByNickname(directorUsername)
        .subscribe({
          next: (user) => {
            const bandId: number = this.data.band.bandId;
            const usernameIsOldDirector = user.nickname === this.data.band.director;
            var newBandDirectorUserAsMember: User | null = null;
            newBandDirectorUserAsMember = user;
            var users: User[];
            users = [...this.data.band.users!, newBandDirectorUserAsMember!];
            const band = {
              bandId,
              name: this.bandUpdateForm.value.name!,
              musicalGenre: this.bandUpdateForm.value.musicalGenre!,
              director: this.bandUpdateForm.value.director!,
              users
            } as Band;
            // Update band
            this.bandService.updateBand(bandId, band)
              .subscribe({
                next: (value) => {
                  this._snackBar.openFromComponent(BandUpdateSuccessSnackBarComponent, {
                    announcementMessage: `Banda "${value.name}" actualizada correctamente`,
                    duration: 4500,
                    verticalPosition: "bottom",
                    horizontalPosition: "center"
                  });
                  BandViewComponent._band = value;
                  this.loading.set(false);
                  this.dialogRef.close();
                },
                error: (err) => {
                  onError(err);
                },
              });

          },
          error: (err) => {
            onError(err);
          },
        });
    }
    const onError = (err: any) => {
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
        this.dialogRef.close();
        this.router.navigateByUrl('/login');
      } else if (err.status === 500) {
        window.alert("Error interno del servidor")
      }
      console.error(err.message);
      window.alert(err.message);
      this.loading.set(false);
    }
  }
}
