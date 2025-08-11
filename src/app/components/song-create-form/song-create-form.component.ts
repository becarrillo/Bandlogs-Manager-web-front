import { Component, ElementRef, EventEmitter, Output, signal, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-song-create-form',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule
],
  templateUrl: './song-create-form.component.html',
  styleUrl: './song-create-form.component.css'
})
export class SongCreateFormComponent {
  protected songCreateForm = new FormBuilder().group({
      title: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
      pitch: new FormControl<string>('', [Validators.required]),
      tonality: new FormControl<string>('', [Validators.required]),
      progression: new FormControl<string[]>([])
  });
  protected songs : { title: string, tonality: string, progression: string[]}[] = [];

  @Output('song')
  protected output = new EventEmitter<{ title: string, tonality: string, progression: string[]}>();

  @Output('songCreateForm')
  songCreateFormOutput = new EventEmitter<typeof this.songCreateForm>();

  readonly reactiveKeywords = signal<string[]>([]);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredOptions!: string[];

  @ViewChild('songTonalityInput') tonalityInput!: ElementRef<HTMLInputElement>;

  addReactiveChordKeyword(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    var kewywordIsValid = false;
    LATIN_STRING_PITCHES.forEach(p => {
      const split = p.split('/');
      if (p===value || value.includes(split.at(0)!) || value.includes(split.at(1)!) || value.includes(p))
        kewywordIsValid = true;
    });
    if (kewywordIsValid) {
      this.reactiveKeywords.update(keywords => [...keywords, value]);

      // Clear the input value
      event.chipInput!.clear();
    }
  }

  filter(): void {
    const options : string[] = [];
    for (let chord of this.getChords()) {
      options.push(this.formatChordPitch(LATIN_STRING_PITCHES.indexOf(chord.pitch)).concat(chord.suffix));
    }
    const filterValue = this.tonalityInput.nativeElement.value.toLowerCase();

    this.filteredOptions = options.filter(o => o.toLowerCase().includes(filterValue));
  }

  getChords() {
    const chords : {pitch : string, suffix: string}[] = [];
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

  onSubmit() {
    this.output.emit(
      {
        title: this.songCreateForm.value.title!,
        tonality: this.songCreateForm.value.tonality!,
        progression: this.songCreateForm.value.progression!
      }
    );
    /**this.songs.push(
      {
        title: this.songCreateForm.value.title!,
        tonality: this.songCreateForm.value.tonality!,
        progression: this.songCreateForm.value.progression!
      }
    );**/
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

  onSelected(event: MatAutocompleteSelectedEvent): void {
    this.reactiveKeywords.update(keywords => [...keywords, event.option.viewValue]);
    this.songCreateForm.controls.progression.setValue([]);
    event.option.deselect();
  }

  toggleDisableProgressionControl() {
    (this.songCreateForm.value.pitch?.length!)>0 ? (
      this.songCreateForm.controls.progression.enable()
    ) : (
      this.songCreateForm.controls.progression.disable()
    );
  }

  /** Converts and translates pitch ordinal number to latin system musical notation string */
  formatChordPitch(ordinal : number) {
    switch (ordinal) {
      case 0: 
        return "La"
        break;
      case 1: 
        if (
          !this.songCreateForm.value.pitch?.includes('Re#') &&
          !this.songCreateForm.value.pitch?.includes('La#') &&
          !this.songCreateForm.value.pitch?.includes('Sol#')
          ) {
            return "La#"
          }
        return "Sib"
        break;
      case 2:
        return "Si"
        break;
      case 3:
        return "Do"
        break;
      case 4:
        if (
          this.songCreateForm.value.pitch?.includes('Sol') ||
          this.songCreateForm.value.pitch?.includes('La') ||
          this.songCreateForm.value.pitch?.includes('Re') &&
          this.songCreateForm.value.pitch?.includes('#')
        ) {
          return "Reb"
        }
        return "Do#"
        break;
      case 5:
        return "Re"
        break;
      case 6:
        if (
          !this.songCreateForm.value.pitch?.includes('Fa#') &&
          !this.songCreateForm.value.pitch?.includes('Do#')
        ) {
          return "Mib"
        }
        return "Re#"
        break;
      case 7:
        return "Mi"
        break;
      case 8:
        return "Fa"
        break;
      case 9:
        if (
          (this.songCreateForm.value.pitch?.includes('Re#') ||
          this.songCreateForm.value.pitch?.includes('Fa#') ||
          this.songCreateForm.value.pitch?.includes('Sol#'))
        ) {
          return "Solb";
        }
        return "Fa#";
        break;
      case 10:
        return "Sol"
        break;
      default:
        if (
          this.songCreateForm.value.pitch?.includes('Re#') ||
          this.songCreateForm.value.pitch?.includes('Sol#') ||
          this.songCreateForm.value.pitch?.includes('La#')
        ) {
          return "Sol#"
        }
        return "Lab";
    }
  }
}
