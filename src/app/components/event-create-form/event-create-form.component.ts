import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BandService } from '../../services/band.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Band } from '../../interfaces/band';
import { Song } from '../../interfaces/song';
import { MatIconModule } from '@angular/material/icon';
import { AppComponent } from '../../app.component';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SongCreateFormComponent } from '../song-create-form/song-create-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CookieService } from 'ngx-cookie-service';
import { MatChipsModule } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { LATIN_STRING_PITCHES } from '../../constants';
import { Pitch } from '../../enums/pitch';
import { Event } from '../../interfaces/event';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MusicalUtilService } from '../../services/musical-util.service';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';


@Component({
  selector: 'app-event-create-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormSuspenseComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SongCreateFormComponent
  ],
  templateUrl: './event-create-form.component.html',
  styleUrl: './event-create-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCreateFormComponent {
  private readonly bandService = inject(BandService);
  readonly musicalUtilService = inject(MusicalUtilService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  readonly _snackbar = inject(MatSnackBar);
  cookieService = inject(CookieService);

  protected bandSignal = signal<Band | undefined>(undefined);
  protected eventCreateForm = new FormBuilder().group({
    date: new FormControl<Date | null>(null, [Validators.required]),
    location: new FormControl<string | null>(null),
    description: new FormControl<string | null>('', [Validators.required, Validators.minLength(5)]),
    repertoire: new FormControl<string[]>([])
  });
  protected songCreateForm: FormGroup<{
    title: FormControl<string | null>,
    pitch: FormControl<string | { pitch: Pitch, suffix: string } | null>,
    tonality: FormControl<string | null>,
    progression: FormControl<string[] | null>,
    progressionChordOption: FormControl<string | null>
  }> = new FormGroup({
    title: new FormControl<string | null>(null, Validators.required),
    pitch: new FormControl<string | { pitch: Pitch, suffix: string } | null>(null, Validators.required),
    tonality: new FormControl<string | null>(null, Validators.required),
    progression: new FormControl<string[] | null>(null, Validators.required),
    progressionChordOption: new FormControl<string | null>('')
  });
  protected songsSignal = signal<{ title: string, tonality: string, progression: string[] }[]>([]);

  readonly reactiveKeywords = signal(this.songsSignal().map(value => value.title));
  readonly loading = signal<boolean>(false);

  announcer = inject(LiveAnnouncer);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const bandId = params.get('id-de-banda');
      if (bandId !== null) {
        const bandIdAsInt = parseInt(decodeURI(bandId));
        this.bandService.getBandById(bandIdAsInt).subscribe({
          next: (band: Band) => {
            this.bandSignal.set(band);
            this.cookieService.set(
              'navigation',
              `/dashboard/bandas/banda/${bandIdAsInt}/eventos/agregar`
            );
          },
          error: (err) => {
            if (err.status === 404) {
              window.alert('Banda no encontrada. Por favor, verifica el ID de la banda.');
            }
            else if (err.status === 500) {
              window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
            } else if (err.status === 401) {
              window.alert('No tienes permiso para acceder a esta banda. Por favor, inicia sesión.');
              localStorage.removeItem('accessToken');
              this.cookieService.delete('navigation');
              AppComponent.userIsAuthenticated.set(false);
              this.router.navigateByUrl("/login");
            } else {
              window.alert('Error desconocido, No se pudo cargar la información de la banda.');
            }
          }
        });
      }
    });

    effect(() => {
      const repertoire = this.songsSignal();
      this.reactiveKeywords.update(value => [...value, ...repertoire.map(value => value.title)]);
    }, { allowSignalWrites: true });
  }

  protected getSongByTitle(title: string) {
    return this.songsSignal()
      .find(value => {
        return value.title === title;
      });
  }

  onSubmit(repertoire: { title: string, tonality: string, progression: string[] }[]) {
    this.loading.set(true);
    this.setRepertoire(repertoire);
    const pitchIndex = (tonality: string) => LATIN_STRING_PITCHES.findIndex(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        return tonality.includes(split.at(0)!) || tonality.includes(split.at(1)!);
      }
      return tonality.includes(value);
    });

    var newSongs: Omit<Song, 'songId'>[] = [];
    for (let song of this.songsSignal()) {
      var tonalitySuffix = '';
      LATIN_STRING_PITCHES.forEach(value => {
        if (value.includes('/')) {
          const split = value.split('/');
          if (song.tonality.startsWith(split.at(0)!) && (song.tonality.includes('b') || song.tonality.includes('#'))) {
            tonalitySuffix = song.tonality.replace(split.at(0)!, '');
          }
          if (song.tonality.startsWith(split.at(1)!))
            tonalitySuffix = song.tonality.replace(split.at(1)!, '');
        } else {
          if (song.tonality.startsWith(value)) {
            if (song.tonality.includes('b'))
              tonalitySuffix = song.tonality.replace(value + 'b', '');
            else if (song.tonality.includes('#'))
              tonalitySuffix = song.tonality.replace(value + '#', '');
            else
              tonalitySuffix = song.tonality.replace(value, '');
          }
        }
      });
      if (tonalitySuffix.length===0)
        tonalitySuffix = ' ';

      newSongs.push({
        title: song.title,
        pitch: this.musicalUtilService.getPitch(pitchIndex(song.tonality), 'Pitch') as Pitch,
        tonalitySuffix,
        progression: song.progression.map(value => {
          var latinStrPitch = LATIN_STRING_PITCHES.find(value1 => {
            if (value1.includes('/')) {
              const split = value1.split('/');
              return (
                (value.startsWith(split.at(0)!) || value.startsWith(split.at(1)!)) &&
                (value1.includes('#') || value1.includes('b'))
              );
            } else {
              return value.startsWith(value1) && !value.includes('#') && !value.includes('b')
            }
          });
          const index = LATIN_STRING_PITCHES.indexOf(latinStrPitch!);

          var chordName: string = '';
          var split: string[] | null = null;
          if (latinStrPitch?.includes('/')) {
            split = latinStrPitch.split('/');
            if (value.startsWith(split.at(0)!))
              latinStrPitch = split.at(0)!;
            if (value.startsWith(split.at(1)!))
              latinStrPitch = split.at(1)!;
            split = null;
          }
          chordName = (this.musicalUtilService.getPitch(
            index,
            'string'
          ) as string).concat(';').concat(value.replace(latinStrPitch!, ''));
          return chordName;
        })
      })
    }

    var date!: Date;
    if (typeof this.eventCreateForm.value.date !== 'undefined' && this.eventCreateForm.value.date !== null)
      date = this.eventCreateForm.value.date;
    var description!: string;
    if (typeof this.eventCreateForm.value.description !== 'undefined' && this.eventCreateForm.value.description !== null)
      description = this.eventCreateForm.value.description;
    var location: string | null = null;
    if (typeof this.eventCreateForm.value.location !== 'undefined' && this.eventCreateForm.value.location !== null)
      location = this.eventCreateForm.value.location;
    const eventData: Omit<Event, 'eventId'> = {
      description,
      date,
      location,
      repertoire: newSongs
    };
    this.bandService
        .patchEventToBand(this.bandSignal()?.bandId!, eventData)
        .subscribe({
          next: () => {
            this.eventCreateForm.reset();
            this.loading.set(false);
            window.alert("Se creó el evento con éxito");
            this.router.navigateByUrl('/dashboard/bandas/'+this.bandSignal()?.bandId!);
          },
          error: (err) => {
            onError(err)
          }
        });
    const onError = (err : any) => {
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        this.cookieService.delete('navigation');
        AppComponent.userIsAuthenticated.set(false);
        window.alert("Sesión expirada, serás redirigido al login");
        this.router.navigateByUrl('/login');
      } else if (err.status===403) {
        window.alert(
          "No tienes suficientes permisos para crear el evento en la banda específica"
        );
        this.loading.set(false);
      } else if (err.status===500) {
        window.alert("Error interno del servidor")
      } else {
        console.error('Error trying to create the event: ', err);
        window.alert(
          'Error desconocido, no se pudo crear el evento. Inténtalo de nuevo más tarde.'
        );
      }
    }
  }

  removeReactiveKeyword(keyword: string) {
    this.reactiveKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from reactive form`);
      return [...keywords];
    });
  }

  private setRepertoire(repertoire: { title: string, tonality: string, progression: string[] }[]) {
    if (repertoire.length >= 1)
      this.songsSignal.set(repertoire);
  }
}
