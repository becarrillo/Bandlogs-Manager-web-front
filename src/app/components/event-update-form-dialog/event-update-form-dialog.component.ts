import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../interfaces/song';
import { AppComponent } from '../../app.component';
import { MatInputModule } from '@angular/material/input';
import { MusicalUtilService } from '../../services/musical-util.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LATIN_STRING_PITCHES, SUFFIXES } from '../../constants';
import { Pitch } from '../../enums/pitch';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { ENTER, COMMA, O } from '@angular/cdk/keycodes';
import { map, Observable, startWith } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { IUserRole } from '../../interfaces/i-user-role';
import { BandService } from '../../services/band.service';
import { SongKeyTranspositionComponent } from '../song-key-transposition/song-key-transposition.component';
import { SongService } from '../../services/song.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-event-update-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogContent,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SongKeyTranspositionComponent
  ],
  templateUrl: './event-update-form-dialog.component.html',
  styleUrl: './event-update-form-dialog.component.css'
})
export class EventUpdateFormDialogComponent implements OnInit {
  readonly data = inject<{ bandId: number; loggedInUserRole: IUserRole; event: Event; }>(MAT_DIALOG_DATA);
  private readonly bandService = inject(BandService);
  private readonly eventService = inject(EventService);
  private readonly songService = inject(SongService);
  private readonly musicalUtilService = inject(MusicalUtilService);
  protected readonly dialogRef = inject(MatDialogRef<EventUpdateFormDialogComponent>);
  readonly router = inject(Router);
  protected eventUpdateBasicForm = new FormBuilder().group({
    date: new FormControl<Date | null>(this.data.event.date, Validators.required),
    description: new FormControl<string>(this.data.event.description, [Validators.required, Validators.minLength(6)]),
    location: new FormControl<string | null>(
      this.data.event.location === undefined ? null : this.data.event.location,
      [Validators.minLength(2)]
    ),
    repertoire: new FormControl<Song[]>(this.data.event.repertoire)
  });
  protected readonly songEditForm = new FormBuilder().group({
    songId: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    title: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2)]),
    pitch: new FormControl<string | null>({ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]),
    tonalitySuffix: new FormControl<string | null>(''),
    progression: new FormControl<string[]>([], Validators.required),
    progressionChordOption: new FormControl<string | null>('', Validators.minLength(1))
  });
  readonly filteredPitchStrOptions = signal<string[]>(this.getSingleLatinStrTonalityPitches());
  protected readonly progressionOptions = signal<{ pitch: string; suffix: string; }[]>(this.getChords());
  filteredProgressionOptions!: Observable<{ pitch: string; suffix: string; }[]>;

  @ViewChild('chordEntry') progressionChordInput!: ElementRef<HTMLInputElement>;
  readonly reactiveKeywords = signal<string[]>(this.songEditForm.value.progression!);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  repertoireSignal = signal<Song[]>([]);
  eventRepertoireIsShown = false;
  protected songEditFormEnabledControlValuesCopy!: {
    songId: number | null,
    title: string | null,
    pitch: string | null,
    tonalitySuffix: string | null,
    progression: string[] | null
  }
  protected submitEventBtnIsDisabled = true;
  protected songKeyTranspositionIsOpened = false;
  readonly loading = signal(false);
  readonly pitch = this.musicalUtilService.getPitch;
  readonly pitchIndex = this.musicalUtilService.getPitchIndex;
  readonly latinStrChordPitch = this.musicalUtilService.formatChordPitch;

  ngOnInit(): void {
    this.repertoireSignal.set(this.data.event.repertoire as Song[]);
    this.eventUpdateBasicForm.valueChanges.subscribe(() => {
      this.submitEventBtnIsDisabled = false;
    });
    this.songEditForm.controls.pitch.valueChanges.subscribe(value => {
      if (value !== null && value.length >= 1) {
        this.filteredPitchStrOptions.set(
          this.getSingleLatinStrTonalityPitches().filter(option => {
            return option.toLowerCase().includes(value.toLowerCase());
          })
        );
      } else {
        this.filteredPitchStrOptions.set(this.getSingleLatinStrTonalityPitches());
      }
    });

    this.filteredProgressionOptions = this.songEditForm.controls.progressionChordOption.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProgressionOptions(this.progressionOptions(), value || ''))
    );
  }

  addReactiveChordKeyword(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    var kewywordIsValid = false;
    LATIN_STRING_PITCHES.forEach(p => {
      const split = p.split('/');
      if (p === value || value.startsWith(split.at(0)!) || value.startsWith(split.at(1)!) || value.startsWith(p))
        kewywordIsValid = true;
    });
    if (kewywordIsValid) {
      this.reactiveKeywords.update(keywords => [...keywords, value]);
      // Clear the input value
      event.chipInput!.clear();
      this.songEditForm.controls.progressionChordOption.setValue('');
    }
  }

  cancelSong(song: Song) {
    this.data.event.repertoire = this.repertoireSignal().filter(s => {
      return s !== song
    });
    this.eventService
      .updateEvent(this.data.event.eventId!, this.data.event)
      .subscribe({
        next: (value) => {
          this.repertoireSignal.set(value.repertoire as Song[]);
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'");
            this.router.navigateByUrl('/login');
          } else if (err.status === 500) {
            window.alert("Error interno del servidor");
          } else {
            window.alert("Error intentando obtener usuario autenticado y rol");
          }
        }
      });
  }

  private filterProgressionOptions(options: { pitch: string; suffix: string; }[], value: string) {
    return options
      .filter(option => option.pitch
        .concat(option.suffix)
        .toLowerCase()
        .includes(value.toLowerCase())
      )
  }

  protected findLatinTonalityStrPitch(pitch: Pitch) {
    const pitchIndex = this.pitchIndex(pitch);
    const element = LATIN_STRING_PITCHES.find((value, index) => index === pitchIndex);
    if (element?.includes('/')) {
      const split = element.split('/');
      const tonalityIsBemol = pitch === Pitch.A_SHARP || pitch === Pitch.D_SHARP || pitch === Pitch.G_SHARP;
      return tonalityIsBemol ? split?.at(1)! : split?.at(0)!;
    }
    return element;
  }

  getChords() {
    const chords: { pitch: string, suffix: string }[] = [];
    LATIN_STRING_PITCHES.forEach(pitch => {
      SUFFIXES.forEach(suffix => {
        chords.push({ pitch, suffix });
      });
    });
    return chords;
  }

  getLatinStrPitches() {
    return LATIN_STRING_PITCHES;
  }

  getOrdinal(pitch: Pitch) {
    return parseInt(pitch.valueOf().toString());
  }

  getPitch(ordinal: number) {
    return (this.pitch(ordinal, 'Pitch') as Pitch);
  }

  private getSingleLatinStrTonalityPitches() {
    return LATIN_STRING_PITCHES.map((value, index) => {
      if (value.includes('/')) {
        const split = value.split('/');
        return index === 1 || index === 6 || index === 11 ? (
          split.at(1)!
        ) : (
          split.at(0)!
        );
      } else {
        return value;
      }
    });
  }

  getTonalityFromSibling(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    // Get the parent element
    const parent = target.parentElement;
    if (!parent) return;

    return parent.parentElement?.querySelector('.song-pitch')?.textContent;
  }

  handleKeySelection(key: string) {
    this.loading.set(true);
    const tonalitySuffix = this.songEditFormEnabledControlValuesCopy.tonalitySuffix!;

    // search index of pitch substring from key selection to song transposition
    var keyIndex!: number;
    LATIN_STRING_PITCHES.forEach((value, index) => {
      if (value.includes('/')) {
        const split = value.split('/');
        if (key.startsWith(split.at(0)!) || key.startsWith(split.at(1)!))
          keyIndex = index;
      } else {
        if (key.startsWith(value))
          keyIndex = index;
      }
    });

    const newTonality = key.concat(tonalitySuffix);
    const pitch = this.musicalUtilService.getPitch(keyIndex!, 'Pitch') as Pitch;
    const event = this.data.event;
    const song = (event.repertoire as Song[])
      .find(s => s.songId === this.songEditFormEnabledControlValuesCopy.songId!)!;
    this.songService
      .transportSong(song.songId!, { pitch, suffix: tonalitySuffix })
      .subscribe({
        next: (value) => {
          const event = this.data.event;
          // Update the song in the repertoire with the returned value
          event['repertoire'] = (event.repertoire as Song[]).map(s => {
            if (s.songId === value.songId)
              return value;
            return s;
          });
          // Now update the event with the modified repertoire
          this.eventService
            .updateEvent(event.eventId!, event)
            .subscribe({
              next: (value) => {
                this.bandService
                  .patchEventToBand(this.data.bandId, value)
                  .subscribe({
                    next: () => {
                      this.data.event = value;
                      this.repertoireSignal.set(value.repertoire as Song[]);
                      this.songKeyTranspositionIsOpened = false;
                      this.loading.set(false);
                      window.location.reload();
                      this.dialogRef.close();
                    },
                    error: (err) => {
                      onError(err);
                    }
                  });
              },
              error: (err) => {
                onError(err)
              }
            });
        },
        error: (err) => {
          onError(err);
        }
      });
    const onError = (err: any) => {
      if (err.status === 500) {
        window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
      } else if (err.status === 401) {
        window.alert('Sesión expirada. Serás redirigido al login.');
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        this.router.navigateByUrl('/login');;
      } else {
        window.alert('Error desconocido, no se pudo realizar una actualización de la tonalidad.');
      }
    }
  }

  protected handleSongUpdate() {
    this.loading.set(true);
    const pitch = (pitchStr: string) => {
      return this.musicalUtilService
        .getPitch(latinPitchIndex(pitchStr), 'Pitch') as Pitch
    }
    const latinPitchIndex = (pitchStr: string) => LATIN_STRING_PITCHES.findIndex(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        return (split.at(0)!)===pitchStr || (split.at(1)!)===pitchStr;
      }
      return value===pitchStr;
    });
    var tonalitySuffix = this.songEditForm.value.tonalitySuffix!;
    /*LATIN_STRING_PITCHES.forEach(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        if (this.songEditForm.value.pitch!.startsWith(split.at(0)!) &&
          (this.songEditForm.value.pitch!.includes('b') ||
            this.songEditForm.value.pitch!.includes('#'))
        ) {
          tonalitySuffix = this.songEditForm.value.pitch!.replace(split.at(0)!, '');
        }
        if (this.songEditForm.value.pitch!.startsWith(split.at(1)!))
          tonalitySuffix = this.songEditForm.value.pitch!.replace(split.at(1)!, '');
      }
      if (this.songEditForm.value.pitch!.startsWith(value)) {
        if (this.songEditForm.value.pitch!.includes('b'))
          tonalitySuffix = this.songEditForm.value.pitch!.replace(value + 'b', '');
        else if (this.songEditForm.value.pitch!.includes('#'))
          tonalitySuffix = this.songEditForm.value.tonality!.replace(value + '#', '');
        else
          tonalitySuffix = this.songEditForm.value.tonality!.replace(value, '');
      }
    });*/
    if (tonalitySuffix === null)
      tonalitySuffix = ' ';
    const song: Song = {
      songId: this.songEditForm.value.songId!,
      title: this.songEditForm.value.title!,
      pitch: pitch(this.songEditForm.value.pitch!),
      tonalitySuffix,
      progression: this.songEditForm.value.progression!.map(value => {
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
    }
    this.songEditForm.setValue({
      songId: null,
      title: null,
      pitch: null,
      tonalitySuffix: null,
      progression: [],
      progressionChordOption: null
    });

    const repertoire: Song[] = this.eventUpdateBasicForm.value.repertoire!;
    for (let i = 0; i < this.eventUpdateBasicForm.value.repertoire!.length; i++) {
      if (repertoire.at(i)?.tonalitySuffix === null)
        repertoire[i]['tonalitySuffix'] = ' ';
      if (this.eventUpdateBasicForm.value.repertoire?.at(i)!.songId === song.songId) {
        repertoire![i] = song;
        var event: Event = {
          eventId: this.data.event.eventId!,
          date: this.data.event.date,
          description: this.data.event.description!,
          location: this.data.event.location!,
          repertoire
        }
        this.eventService
          .updateEvent(this.data.event.eventId!, event)
          .subscribe({
            next: (value) => {
              this.bandService
                .patchEventToBand(this.data.bandId, value)
                .subscribe({
                  next: () => {
                    this.data.event = value;
                    this.repertoireSignal.set(value.repertoire);
                    this.submitEventBtnIsDisabled = false;
                    this.loading.set(false);
                  },
                  error: (err) => {
                    onError(err);
                  }
                });
            },
            error: (err) => {
              onError(err)
            }
          });
        const onError = (err: any) => {
          if (err.status === 500) {
            window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
          } else if (err.status === 401) {
            window.alert('Sesión expirada. Serás redirigido al login.');
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            this.router.navigateByUrl('/login');;
          } else {
            window.alert('Error desconocido, no se pudo realizar una actualización.');
          }
          this.loading.set(false);
        }
      } else {
        repertoire[i]['pitch'] = this.musicalUtilService
          .stringToPitch(
            this.eventUpdateBasicForm.value.repertoire!.at(i)!.pitch as unknown as string
          );
      }
    }
    this.submitEventBtnIsDisabled = false;
  }

  hideTemporalSongRowInEdition(song: Song) {
    this.repertoireSignal.set((this.data.event.repertoire as Song[]).filter(s => s !== song));
  }

  navigationComeBack() {
    if (this.songEditFormHasValues()) {
      this.songEditForm.controls.title.setValue(null),
      this.songEditForm.controls.pitch.setValue(null),
      this.songEditForm.controls.tonalitySuffix.setValue(null),
      this.songEditForm.controls.progression.setValue(null),
      this.songEditForm.controls.progressionChordOption.setValue(''),
      this.repertoireSignal.set(this.data.event.repertoire)
    } else {
      if (this.songKeyTranspositionIsOpened) {
        this.repertoireSignal.set(this.data.event.repertoire as Song[]);
        this.songKeyTranspositionIsOpened = false;
      }
      else
        this.eventRepertoireIsShown = false;
    }
  }

  onProgressionChordKeywordSelected(ev: MatAutocompleteSelectedEvent): void {
    this.reactiveKeywords.update(keywords => [...keywords, ev.option.viewValue]);
    this.songEditForm.controls.progression.setValue([]);
    ev.option.deselect();
    this.filteredProgressionOptions = this.songEditForm.controls.progressionChordOption.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProgressionOptions(this.getChords(), value || ''))
    );
    this.progressionChordInput.nativeElement.setAttribute('value', '');
  }

  onEventUpdateBasicFormSubmit() {
    console.log("Evento: ", JSON.stringify(this.eventUpdateBasicForm.value))
    this.eventRepertoireIsShown = true;
  }

  removeReactiveChordKeyword(index: number) {
    this.reactiveKeywords.update(keywords => {
      keywords.splice(index, 1);
      return [...keywords];
    });
  }

  sendUpdate() {
    if (this.eventUpdateBasicForm.valid) {
      this.loading.set(true);
      const event = {
        eventId: this.data.event.eventId!,
        date: this.eventUpdateBasicForm.value.date!,
        description: this.eventUpdateBasicForm.value.description!,
        location: this.eventUpdateBasicForm.value.location!,
        repertoire: this.eventUpdateBasicForm.value.repertoire!
      } as Event;
      console.log(JSON.stringify(event));
      this.eventService
        .updateEvent(
          this.data.event.eventId!,
          event
        )
        .subscribe({
          next: (value) => {
            this.bandService
              .patchEventToBand(this.data.bandId, value)
              .subscribe({
                next: () => {
                  this.submitEventBtnIsDisabled = false;
                  window.location.reload();
                  this.loading.set(false);
                },
                error: (err) => {
                  onError(err);
                }
              });
            window.alert(`Evento con id ${value.eventId}: ${value.description} actualizado`);
            this.loading.set(false);
            this.dialogRef.close();
          },
          error: (err) => {
            onError(err)
          }
        });
    }
    const onError = (err: any) => {
      if (err.status === 500) {
        window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
      } else if (err.status === 401) {
        window.alert('Sesión expirada. Serás redirigido al login.');
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        this.router.navigateByUrl('/login');;
      } else {
        window.alert('Error desconocido, no se pudo realizar una actualización.');
      }
      this.loading.set(false);
    }
  }

  protected setReactiveKeywords(keywords: string[]) {
    this.reactiveKeywords.set(keywords.map(value => {
      const pitchSubstring = value.substring(0, value.indexOf(';')).trim();
      const pitchIndex = parseInt(this.musicalUtilService.stringToPitch(pitchSubstring).toString());
      return this.musicalUtilService.formatChordPitch(pitchIndex, this.songEditForm.value.pitch!)
        .concat(value.replace(pitchSubstring+';', ''));
    }));
  }

  private songEditFormHasValues() {
    return this.songEditForm.value.songId !== null &&
      this.songEditForm.value.title !== null &&
      this.songEditForm.value.pitch !== null &&
      this.songEditForm.value.tonalitySuffix !== null &&
      this.songEditForm.value.progression !== null;
  }


}
