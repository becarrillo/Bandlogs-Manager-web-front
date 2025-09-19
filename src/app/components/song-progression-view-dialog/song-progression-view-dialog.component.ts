import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, model, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { LATIN_STRING_PITCHES, SUFFIXES } from '../../constants';
import { MusicalUtilService } from '../../services/musical-util.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SongService } from '../../services/song.service';
import { Song } from '../../interfaces/song';
import { AppComponent } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { Pitch } from '../../enums/pitch';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { MatInputModule } from '@angular/material/input';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event';
import { BandService } from '../../services/band.service';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-song-progression-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    FormSuspenseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './song-progression-view-dialog.component.html',
  styleUrl: './song-progression-view-dialog.component.css'
})
export class SongProgressionViewDialogComponent implements OnInit {
  private readonly data = inject<{ bandId: number; event: Event; song: Song; title: string; tonality: string; }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<SongProgressionViewDialogComponent>);
  private readonly bandService = inject(BandService);
  private readonly eventService = inject(EventService);
  private readonly songService = inject(SongService);
  protected readonly router = inject(Router);
  private readonly musicalUtilService = inject(MusicalUtilService);
  protected readonly reactiveProgression = signal<string[]>(this.data.song.progression);
  readonly latinTonalityStrPitch = this.musicalUtilService.formatChordPitch;
  readonly stringToPitch = this.musicalUtilService.stringToPitch;
  readonly filteredProgressionOptions = signal<{ pitch: string; suffix: string; }[]>(this.getChords());
  readonly chordName = model('');
  protected chordIndex = 0;
  protected readonly chordNameInputIsShown = signal(false);
  readonly formFieldAction = signal('');
  readonly loading = signal(false);

  ngOnInit(): void {
    this.chordName.subscribe(value => {
      this.filteredProgressionOptions.set(this._filter(this.getChords(), value));
    });
  }

  private _filter(options: { pitch: string; suffix: string; }[], value: string) {
    return options.filter(option => option.pitch
      .concat(option.suffix)
      .toLowerCase()
      .includes(value.toLowerCase())
    );
  }

  addChord() {
    const { pitchStr, suffix } = this.generateServerStandardChord()!;
    const progression = this.data.song.progression;
    progression.push((pitchStr as string).concat(';').concat(suffix));
    const song = this.data.song;
    if (song.tonalitySuffix===null)
      song['tonalitySuffix'] = '';
    song['progression'] = progression;
    const event = this.data.event;
    event
      .repertoire[event.repertoire.findIndex(value => value.songId === song.songId)] = song;
      console.log(JSON.stringify(event));
    this.eventService
        .updateEvent(event.eventId!, event)
        .subscribe({
          next: (value) => {
            this.bandService
              .patchEventToBand(this.data.bandId, value)
              .subscribe({
                next: () => {
                  this.reactiveProgression.set(progression);
                  window.alert("Acorde agregado exitosamente.");
                  this.loading.set(false);
                  this.chordName.set('');
                  this.chordNameInputIsShown.set(false);
                  this.formFieldAction.set('');
                },
                error: (err) => {
                  onError(err)
                },
              });
          },
          error: (err) => {
            onError(err)
          },
        });
    const onError = (err: any) => {
      console.error(err);
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        window.alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        this.dialogRef.close();
        this.router.navigateByUrl('/login');
      } else if (err.status === 500) {
        window.alert("Error del servidor. Intenta nuevamente más tarde.");
      } else {
        console.error("Error: ".concat(err.message));
        window.alert("Error desconocido");
      }
    }
  }

  /**
   * Converts a string to Pitch enum value
   * @param pitchStr The string representation of the pitch
   * @returns The corresponding Pitch enum value
   * @throws Error if string doesn't match any Pitch enum value
   */
  convertStringToPitch(pitchStr: string): Pitch {
    const pitch = (Pitch as any)[pitchStr];
    if (pitch === undefined) {
      throw new Error(`Invalid pitch string: ${pitchStr}`);
    }
    return pitch;
  }

  updateChord() {
    const pitch = (tonality: string) => {
      return this.musicalUtilService
        .getPitch(latinPitchIndex(tonality), 'Pitch') as Pitch
    }
    const latinPitchIndex = (tonality: string) => LATIN_STRING_PITCHES.findIndex(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        return tonality.includes(split.at(0)!) || tonality.includes(split.at(1)!);
      }
      return tonality.includes(value);
    });

    const { pitchStr, suffix } = this.generateServerStandardChord()!;
    this.data.song.progression[this.chordIndex] = (pitchStr as string).concat(';').concat(suffix);
    this.reactiveProgression.set(this.data.song.progression);
    const song = {
      songId: this.data.song.songId!,
      title: this.data.song.title,
      pitch: pitch(this.data.tonality),
      tonalitySuffix: this.data.song.tonalitySuffix ?? '',
      progression: this.data.song.progression
    } as Song;

    const repertoire = this.data.event.repertoire.map(value => {
      if (value.songId === song.songId)
        value = song;
      return value;
    });
    const event = this.data.event;
    event['repertoire'] = repertoire;
    console.log(JSON.stringify(event));

    this.eventService
      .updateEvent(this.data.event.eventId!, event)
      .subscribe({
        next: (value) => {
          this.bandService
            .patchEventToBand(this.data.bandId, value)
            .subscribe({
              next: () => {
                this.loading.set(false);
                this.chordName.set('');
                this.chordNameInputIsShown.set(false);
                this.formFieldAction.set('');
              },
              error: (err) => {
                console.error(err);
                if (err.status === 401) {
                  localStorage.removeItem('accessToken');
                  AppComponent.userIsAuthenticated.set(false);
                  window.alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                  this.loading.set(false);
                  this.dialogRef.close();
                  this.router.navigateByUrl('/login');
                } else if (err.status === 400) {
                  window.alert("Error en los datos enviados.");
                } else if (err.status === 500) {
                  window.alert("Error del servidor. Intenta nuevamente más tarde.");
                } else {
                  console.error("Error: ".concat(err.message));
                  window.alert("Error desconocido");
                }
              },
            })

        },
        error: (err) => {
          console.error(err);
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            this.loading.set(false);
            this.dialogRef.close();
            this.router.navigateByUrl('/login');
          } else if (err.status === 404) {
            window.alert("La canción que intentas editar no existe o ha sido eliminada.");
          } else if (err.status === 400) {
            window.alert("Error en los datos enviados. Revisa la progresión de acordes e intenta nuevamente.");
          } else if (err.status === 500) {
            window.alert("Error del servidor. Intenta nuevamente más tarde.");
          } else {
            console.error("Error: ".concat(err.message));
            window.alert("Error desconocido");
          }
        }
      });
  }

  private generateServerStandardChord() {
    if (this.chordName().length === 0) {
      window.alert("Por favor, ingresa un nombre de acorde válido.");
      return;
    }
    this.loading.set(true);
    this.formFieldAction.set('edit');
    var pitchStr!: Pitch | string;
    var suffix = '';
    LATIN_STRING_PITCHES.forEach(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        if (this.chordName().startsWith(split.at(0)!) || this.chordName().startsWith(split.at(1)!)) {
          const index = LATIN_STRING_PITCHES.findIndex(value1 => value1 === value);
          pitchStr = (this.musicalUtilService.getPitch(index, 'string') as string);
          suffix = this.chordName().startsWith(split.at(0)!) ? (
            this.chordName().replace(split.at(0)!, '')
          ) : (
            this.chordName().replace(split.at(1)!, '')
          );
        }
      }
      if (this.chordName().startsWith(value)) {
        const index = LATIN_STRING_PITCHES.findIndex(value1 => value1 === value);
        pitchStr = this.musicalUtilService.getPitch(index, 'string');
        suffix = this.chordName().replace(value, '');
      }
    });
    if (pitchStr === undefined) {
      window.alert("Por favor, ingresa un nombre de acorde válido.");
      this.loading.set(false);
      return;
    }
    return { pitchStr, suffix }
  }

  getChords() {
    return LATIN_STRING_PITCHES.map(pitch => {
      return SUFFIXES.map(suffix => {
        return { pitch, suffix };
      })
    }).flat();
  }

  private getSingleLatinStrTonalityPitches() {
    console.log(this.data.tonality);
    return LATIN_STRING_PITCHES.map((value, index) => {
      if (value.includes('/')) {
        const tonalityIsBemol = this.data.tonality.startsWith('Sib') || this.data.tonality.startsWith('Mib') || this.data.tonality.startsWith('Lab');
        const split = value.split('/');
        return (index === 1 || index === 4 || index === 6 || index === 11) && tonalityIsBemol ? (
          split.at(1)!
        ) : (
          split.at(0)!
        );
      }
      return value;
    });
  }

  getOrdinal(pitchStr: string) {
    const pitch = this.convertStringToPitch(pitchStr);
    return pitch as number;
  }

  getPitch(ordinal: number, resultType: 'Pitch') {
    return this.musicalUtilService.getPitch(ordinal, resultType);
  }

  removeChord() {
    this.loading.set(true);
    if (this.data.song.progression.length === 0) {
      window.alert("La progresión de acordes ya está vacía.");
      return;
    }
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este acorde de la progresión?");
    if (!confirm) return;

    var progression = this.data.song.progression;
    progression = progression.filter((value, i) => {
      return this.chordIndex !== i;
    });
    const song = this.data.song;
    song['progression'] = progression;
    this.reactiveProgression.set(song.progression);
    const event: Event = this.data.event;
    event['repertoire'][this.chordIndex] = song;
    event['repertoire'] = event.repertoire.map(value => {
      if (value.tonalitySuffix === null)
        value['tonalitySuffix'] = '';
      return value;
    });
    
    this.eventService
      .updateEvent(this.data.event.eventId!, event)
      .subscribe({
        next: (value) => {
          this.bandService
            .patchEventToBand(this.data.bandId, value)
            .subscribe({
              next: (value) => {
                console.log(JSON.stringify(value));
                this.dialogRef.close();
                this.loading.set(false);
              },
              error: (err) => {
                onError(err);
              }
            });
        },
        error: (err) => {
          onError(err);
        },
      });
    const onError = (err: any) => {
      console.error(err);
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        window.alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        this.dialogRef.close();
        this.router.navigateByUrl('/login');
      } else if (err.status === 400) {
        window.alert("Error en los datos enviados. Revisa la progresión de acordes e intenta nuevamente.");
      } else if (err.status === 500) {
        window.alert("Error del servidor. Intenta nuevamente más tarde.");
      } else {
        console.error("Error: ".concat(err.message));
        window.alert("Error desconocido");
      }
    }
  }

  protected get title() {
    return this.data.title;
  }

  protected get tonality() {
    return this.data.tonality;
  }
}
