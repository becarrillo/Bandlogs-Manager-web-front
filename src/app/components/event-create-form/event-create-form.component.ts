import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../services/event.service';
import { BandService } from '../../services/band.service';
import { ActivatedRoute } from '@angular/router';
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
import { SongViewComponent } from '../song-view/song-view.component';


@Component({
  selector: 'app-event-create-form',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
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
  eventService = inject(EventService);
  bandService = inject(BandService);
  private route = inject(ActivatedRoute);
  cookieService = inject(CookieService);
  protected bandSignal = signal<Band | undefined>(undefined);
  protected eventCreateForm = new FormBuilder().group({
    date: new FormControl<Date | null>(null, [Validators.required]),
    location: new FormControl<string | null>(''),
    description: new FormControl<string | null>('', [Validators.required, Validators.minLength(5)]),
    repertoire: new FormControl<string[]>([])
  });
  protected songCreateForm: FormGroup<{
    title: FormControl<string | null>,
    pitch: FormControl<string | null>,
    tonality: FormControl<string | null>,
    progression: FormControl<string[] | null>
  }> = new FormGroup({
    title: new FormControl<string | null>(null),
    pitch: new FormControl<string | null>(null),
    tonality: new FormControl<string | null>(null),
    progression: new FormControl<string[] | null>(null)
  });
  protected songsSignal = signal<{title: string, tonality: string, progression: string[]}[]>([]);

  dialog = inject(MatDialog);

  readonly reactiveKeywords = signal(this.songsSignal().map(value => value.title));

  announcer = inject(LiveAnnouncer);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const bandId = params.get('id-de-banda');
      if (bandId!== null) {
        this.bandService.getBandById(parseInt(decodeURI(bandId))).subscribe({
          next: (band: Band) => {
            this.bandSignal.set(band);
          },
          error: (err) => {
            console.error('Error al obtener la banda:', err);
            if (err.status === 404) {
              window.alert('Banda no encontrada. Por favor, verifica el ID de la banda.');
            }
            else if (err.status === 500) {
              window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
            } else if (err.status===401) {
              window.alert('No tienes permiso para acceder a esta banda. Por favor, inicia sesión.');
              localStorage.removeItem('accessToken');
              this.cookieService.delete('navigation');
              AppComponent.userIsAuthenticated.set(false);
              window.location.pathname = "/login";
            } else {
              console.error('Error desconocido:', err);
            }
            window.alert('No se pudo cargar la información de la banda. Inténtalo de nuevo más tarde.');
          }
        });
      }
    });

    effect(() => {
      const repertoire = this.songsSignal();
      this.reactiveKeywords.update(value => [...value, ...repertoire.map(value => value.title)]);
    }, { allowSignalWrites: true });
  }

  protected addSong(song : {title: string, tonality: string, progression: string[]}) {
    this.songsSignal.update(value => {
      return [...value, song]
    });
  }

  protected getSongByTitle(title : string) {
    return this.songsSignal()
        .find(value => {
          return value.title===title;
        });
  }

  private getPitch(ordinal : number, resultType : 'string' | 'Pitch') {
    switch(ordinal) {
      case 0:
        return resultType==='Pitch' ? Pitch.A : "A";
      case 1:
        return resultType==='Pitch' ? Pitch.A_SHARP : "A_SHARP";
      case 2:
        return resultType==='Pitch' ? Pitch.B : "B";
      case 3:
        return resultType==='Pitch' ? Pitch.C : "C";
      case 4:
        return resultType==='Pitch' ? Pitch.C_SHARP : "C_SHARP";
      case 5:
        return resultType==='Pitch' ? Pitch.D : "D";
      case 6:
        return resultType==='Pitch' ? Pitch.D_SHARP : "D_SHARP";
      case 7:
        return resultType==='Pitch' ? Pitch.E : "E";
      case 8:
        return resultType==='Pitch' ? Pitch.F : "F";
      case 9:
        return resultType==='Pitch' ? Pitch.F_SHARP : "F_SHARP";
      case 10:
        return resultType==='Pitch' ? Pitch.G : "G";
      default:
        return resultType==='Pitch' ? Pitch.G_SHARP : "G_SHARP";
    }
  }

  onDateChange() {
    window.alert(this.eventCreateForm.value.date);
  }

  sendEvent() {
    const pitchIndex = (tonality : string) => LATIN_STRING_PITCHES.findIndex(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        return tonality.includes(split.at(0)!) || tonality.includes(split.at(1)!)
      }
      return tonality.includes(value)
    });

    var repertoire : Omit<Song, 'songId'>[] = [];
    for (let song of this.songsSignal()) {
      repertoire.push({
        title: song.title,
        pitch: this.getPitch(pitchIndex(song.tonality), 'Pitch') as Pitch,
        tonalitySuffix: LATIN_STRING_PITCHES.find(value => {
          var result = '';
          if (value.includes('/')) {
            const split = value.split('/');
            song.tonality.includes(split.at(0)!) ? (
              result = song.tonality.substring((split.at(0)!).length)
            ) : (
              result = song.tonality.substring((split.at(1)!).length)
            );
          }
          return result;
        }) || '',
        progression: song.progression.map(value => {
          return LATIN_STRING_PITCHES.find(value1 => {
            var result = '';
            if (value1.includes('/')) {
              var index! : number;
              const split = value1.split('/');
              if (value.includes(split.at(0)!)) {
                index = LATIN_STRING_PITCHES.indexOf(split.at(0)!);
                value.replace(split.at(0)!, this.getPitch(index, 'string') as string)
                result = value;
              }
              if (value.includes(split.at(1)!)) {
                index = LATIN_STRING_PITCHES.indexOf(split.at(1)!);
                value.replace(split.at(1)!, this.getPitch(index, 'string') as string)
                result = value;
              }
            } else {
              if (value.includes(value1))
                result = value;
            };

            return result;
          }) || '';
        })
      })
    }

    for (let cancion of repertoire) {
      console.log({
        title: cancion.title,
        pitch: cancion.pitch,
        tonalitySuffux: cancion.tonalitySuffix,
        progression: cancion.progression
      });
    }
    
    /**if (this.eventCreateForm.valid) {
      const eventData : Event = {
        description: this.eventCreateForm.value.description || '',
        date: this.eventCreateForm.value.date!,
        location: this.eventCreateForm.value.location || '',
        band: this.bandSignal(),
        repertoire,
        state: EventState.PLANNED
      } as Event;
      this.eventService.addEvent(eventData).subscribe({
        next: () => {
          window.alert('Evento creado exitosamente.');
          this.eventCreateForm.reset();
        },
        error: (err) => {
          console.error('Error al crear el evento:', err);
          window.alert('No se pudo crear el evento. Inténtalo de nuevo más tarde.');
          if (err.status===401) {
            localStorage.removeItem('accessToken');
            this.cookieService.delete('navigation');
            AppComponent.userIsAuthenticated.set(false);
            window.location.pathname = "/login";
          }
        }
      });
    } else {
      window.alert('Por favor, completa todos los campos requeridos correctamente.');
    }**/
  }

  alertGroup() {
    window.alert(this.eventCreateForm.value.description);
    window.alert(this.eventCreateForm.value.date);
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

  setSongCreateForm(ev : FormGroup<{title: FormControl<string | null>, pitch: FormControl<string | null>, tonality: FormControl<string | null>, progression: FormControl<string[] | null>;}>) {
    this.songCreateForm = ev;
  }
}
