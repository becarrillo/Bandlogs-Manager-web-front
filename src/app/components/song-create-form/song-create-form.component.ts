import { Component, ElementRef, EventEmitter, inject, OnInit, Output, signal, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { LATIN_STRING_PITCHES, SUFFIXES } from '../../constants';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { map, Observable, startWith } from 'rxjs';
import { Pitch } from '../../enums/pitch';
import { MusicalUtilService } from '../../services/musical-util.service';


@Component({
  selector: 'app-song-create-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './song-create-form.component.html',
  styleUrl: './song-create-form.component.css'
})
export class SongCreateFormComponent implements OnInit {
  musicalUtilService = inject(MusicalUtilService);
  protected newSongForm = new FormBuilder().group({
    title: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    pitch: new FormControl<string | { pitch: Pitch, suffix: string } | null>(null),
    tonality: new FormControl<string>('', [Validators.required]),
    progression: new FormControl<string[]>({ value: [], disabled: true }),
    progressionChordOption: new FormControl<string>('')
  });
  readonly latinStrChordPitch = this.musicalUtilService.formatChordPitch;
  protected readonly filteredTonalityOptions = signal(this.getLatinStrTonalityOptions());
  protected progressionOptions = signal<{ pitch: string; suffix: string; }[]>(this.getChords());
  protected reactiveRepertoire = signal<{ title: string, tonality: string, progression: string[] }[]>([]);

  @Output('repertoire')
  protected repertoireOutput = new EventEmitter<{ title: string, tonality: string, progression: string[] }[]>();

  @Output()
  resetStepperEvent = new EventEmitter<boolean>();

  @ViewChild('chordEntry') progressionChordInput!: ElementRef<HTMLInputElement>;
  readonly reactiveKeywords = signal<string[]>([]);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  filteredProgressionOptions!: Observable<{ pitch: string; suffix: string; }[]>;

  ngOnInit(): void {
    this.filteredProgressionOptions = this.newSongForm.controls.progressionChordOption.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.progressionOptions(), value || ''))
    );
  }

  private _filter(options: { pitch: string; suffix: string; }[], value: string) {
    return options
      .filter(option => option.pitch
        .concat(option.suffix)
        .toLowerCase()
        .includes(value.toLowerCase())
      )
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
      this.newSongForm.controls.progressionChordOption.setValue('');
      // Clear the input value
      event.chipInput!.clear();
    }
  }

  cancelStagedSong(song: { title: string, tonality: string, progression: string[] }) {
    this.reactiveRepertoire.update(value => {
      return value.filter(v => v !== song);
    })
  }

  getLatinStrTonalityOptions() {
    const arr = this.getSingleLatinStrTonalityPitches();
    return arr.map(pitch => {
      return SUFFIXES.map(suffix => {
        return { pitch, suffix };
      })
    }).flat();
  }

  getLatinStrPitches() {
    return LATIN_STRING_PITCHES;
  }

  getChords() {
    return LATIN_STRING_PITCHES.map(pitch => {
      return SUFFIXES.map(suffix => {
        return { pitch, suffix };
      })
    }).flat();
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
        return this.newSongForm.value.tonality!.startsWith('Do#') && index === 8 ? 'Fa' : value;
      }
    });
  }

  toStageSong() {
    const song = {
      title: this.newSongForm.value.title!,
      tonality: this.newSongForm.value.tonality!,
      progression: this.newSongForm.value.progression!
    }

    this.reactiveRepertoire.update(value => {
      return [...value, song]
    });
    this.filteredTonalityOptions.set(this.getLatinStrTonalityOptions());
    this.reactiveKeywords.set([]);
    
    this.newSongForm.reset();
    this.newSongForm.controls.progression.disable();
  }

  onSubmit() {
    this.repertoireOutput.emit(this.reactiveRepertoire());
  }

  removeReactiveChordKeyword(keyword: string) {
    this.reactiveKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      return [...keywords];
    });
  }

  removeStagedReactiveRepertoireChord(songTitle: string, index: number) {
    this.reactiveRepertoire.update(value => {
      value.find(s => s.title === songTitle)?.progression.splice(index, 1);
      return [...value];
    });
  }

  onProgressionChordKeywordSelected(ev: MatAutocompleteSelectedEvent): void {
    this.reactiveKeywords.update(keywords => [...keywords, ev.option.viewValue]);
    this.newSongForm.controls.progression.setValue([]);
    ev.option.deselect();
    this.filteredProgressionOptions = this.newSongForm.controls.progressionChordOption.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.getChords(), value || '')
      )
    );
    this.progressionChordInput.nativeElement.setAttribute('value', '');
  }

  onTonalityInputKeyDown(ev: Event) {
    const inputValue = (ev.target as HTMLInputElement).value;
    if (inputValue.length>=1 && this.newSongForm.controls.tonality.disabled)
      this.newSongForm.controls.tonality.enable();
    this.filteredTonalityOptions.set(
      this.getLatinStrTonalityOptions().filter(option => {
        return option.pitch.concat(option.suffix).toLowerCase().includes(inputValue.toLowerCase());
      })
    );
  }

  toggleDisabledOrNotProgressionControl() {
    this.newSongForm.controls.tonality.valid ? (
      this.newSongForm.controls.progression.enable()
    ) : (
      this.newSongForm.controls.progression.disable()
    );
  }
}
