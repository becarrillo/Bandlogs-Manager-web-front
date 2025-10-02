import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SongCreateFormComponent } from '../song-create-form/song-create-form.component';
import { Event } from '../../interfaces/event';
import { BandService } from '../../services/band.service';
import { EventService } from '../../services/event.service';
import { LATIN_STRING_PITCHES } from '../../constants';
import { Song } from '../../interfaces/song';
import { Pitch } from '../../enums/pitch';
import { MusicalUtilService } from '../../services/musical-util.service';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-songs-to-event-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
    MatDialogModule,
    SongCreateFormComponent
  ],
  templateUrl: './add-songs-to-event-form-dialog.component.html',
  styleUrl: './add-songs-to-event-form-dialog.component.css'
})
export class AddSongsToEventFormDialogComponent {
  protected readonly data = inject<{ bandId: number; loggedInUserRole: string; event: Event; toAddSongs: true }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<AddSongsToEventFormDialogComponent>);
  private readonly bandService = inject(BandService);
  private readonly eventService = inject(EventService);
  protected readonly musicalUtilService = inject(MusicalUtilService);
  readonly loading = signal(false);

  onSubmit(repertoire: { title: string, tonality: string, progression: string[] }[]) {
    this.loading.set(true);
    const pitchIndex = (tonality: string) => LATIN_STRING_PITCHES.findIndex(value => {
      if (value.includes('/')) {
        const split = value.split('/');
        return tonality.includes(split.at(0)!) || tonality.includes(split.at(1)!);
      }
      return tonality.includes(value);
    });

    var newSongs: Omit<Song, 'songId'>[] = [];
    for (let song of repertoire) {
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
      if (tonalitySuffix.length === 0)
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
      });
    }
    const event: Event = this.data.event;
    event['repertoire'] = event.repertoire.concat(newSongs);
    console.log(JSON.stringify(event));
    this.eventService
      .updateEvent(event.eventId!, event)
      .subscribe({
        next: () => {
          this.bandService
            .patchEventToBand(this.data.bandId, event)
            .subscribe({
              next: () => {
                this.loading.set(false);
                this.dialogRef.close();
                window.location.reload();
              },
              error: (err) => {
                onError(err);
              }
            })
        },
        error: (err) => {
          onError(err);
        }
      });
    const onError = (err: any) => {
      console.error('Error updating event:', err);
    }
  }
}
