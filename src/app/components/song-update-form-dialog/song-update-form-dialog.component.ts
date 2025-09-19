import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LATIN_STRING_PITCHES, SUFFIXES } from '../../constants';

@Component({
  selector: 'app-song-update-form-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './song-update-form-dialog.component.html',
  styleUrl: './song-update-form-dialog.component.css'
})
export class SongUpdateFormDialogComponent {
  readonly dialog = inject(MatDialog);
  protected updateSongForm = new FormGroup({
    title: new FormControl(''),
    tonality: new FormControl(''),
    progression: new FormControl('')
  });

  getChords() {
    const arr = this.getSingleLatinStrTonalityPitches();
    return arr.map((pitch, index) => {
      return SUFFIXES.map(suffix => {
        return { pitch, suffix };
      })
    }).flat();
  }

  private getSingleLatinStrTonalityPitches() {
    return LATIN_STRING_PITCHES.map((value, index) => {
      if (value.includes('/')) {
        const split = value.split('/');
        return index===1 || index===6 ? split.at(1) : split.at(0);
      } else {
        return value;
      }
    });
  }
 
  onSubmit() {
    // Handle form submission
    this.dialog.open(SongUpdateFormDialogComponent);
  }
}
