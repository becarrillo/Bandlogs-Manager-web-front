import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Band } from '../../interfaces/band';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
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
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-band-update-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatOptionModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './band-update-form-dialog.component.html',
  styleUrl: './band-update-form-dialog.component.css'
})
export class BandUpdateFormDialogComponent {
  protected data = inject<{band: Band}>(MAT_DIALOG_DATA);
  protected bandService = inject(BandService);
  protected userService = inject(UserService);
  router = inject(Router);
  protected bandUpdateForm = new FormBuilder().group({
    name: new FormControl<string>(this.data.band.name, [Validators.minLength(4)]),
    musicalGenre: new FormControl<MusicalGenre>(this.data.band.musicalGenre),
    director: new FormControl<string>(this.data.band.director)
  });
  filteredUsers = signal<User[]>([]);

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

  onMusicalGenreSelection(ev : MatSelectChange) {
    this.bandUpdateForm.controls.musicalGenre.setValue((ev.value as MusicalGenre).valueOf());
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

  onFilterUsersInputFocus() {
    this.userService
        .listAll()
        .subscribe(value => {
          this.filteredUsers.set(value)
        });
  }

  onSubmit() {
    var newMember! : User;

    const bandId : number = this.data.band.bandId;
    const directorUsername = this.bandUpdateForm.controls.director.value;
    if (directorUsername!==null && directorUsername!==this.data.band.director) {
      this.userService
          .getUserByNickname(directorUsername)
          .subscribe({
            next: (value) => {
              this.bandUpdateForm.value.director = value.nickname;
              newMember = value;
            },
            error: (err) => {
                if (err.status===401) {
                  localStorage.removeItem('accessToken');
                  AppComponent.userIsAuthenticated.set(false);
                  window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
                  this.router.navigateByUrl('/login');
                }
            },
          })
    }
    this.bandService.updateBand(bandId, {
      bandId,
      name: this.bandUpdateForm.value.name!,
      musicalGenre: this.bandUpdateForm.value.musicalGenre!,
      director: this.bandUpdateForm.value.director!,
      users: [...this.data.band.users!, newMember]
    });
  }
}
