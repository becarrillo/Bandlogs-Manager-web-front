import {
  ChangeDetectionStrategy,
  Component, CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  model,
  OnChanges,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SongService } from '../../services/song.service';
import { MusicalUtilService } from '../../services/musical-util.service';


@Component({
  selector: 'app-song-key-transposition',
  standalone: true,
  imports: [FormsModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './song-key-transposition.component.html',
  styleUrls: ['./song-key-transposition.component.css'],
})
export class SongKeyTranspositionComponent implements OnChanges, OnInit {
  readonly songService = inject(SongService);
  readonly musicalUtilService = inject(MusicalUtilService);
  readonly harmonicKeys: string[] = ['La', 'Sib', 'Si', 'Do', 'Do#', 'Re', 'Mib', 'Mi', 'Fa', 'Fa#', 'Sol', 'Lab'];
  songInfo = input<{
    songId: number | null;
    title: string | null
    tonality: string | null;
    progression: string[] | null
  }>();
  @Output('selectedKey')
  readonly key = new EventEmitter<string>();
  readonly keywords = signal<string[]>([]);
  readonly tonality = model<string>();

  ngOnInit(): void {
    if (this.songInfo()?.tonality!==undefined) {
      this.tonality.set(this.songInfo()!.tonality!);
    }
    if (this.songInfo()?.progression!==undefined) {
      this.keywords.set(this.songInfo()!.progression!);
    }
  }

  ngOnChanges(): void {
    if (this.songInfo()?.tonality!==undefined) {
      this.tonality.set(this.songInfo()!.tonality!);
    }
    if (this.songInfo()?.progression) {
      this.keywords.set(this.songInfo()!.progression!);
    }
  }

  getLatinNotationKey(keyword: string): string {
    const pitchStr = keyword.replace(
        keyword.substring(keyword.indexOf(';')),
        ''
    );
    return this.harmonicKeys
        ?.at(
          this.musicalUtilService
              .getPitchIndex(
                  this.musicalUtilService
                      .stringToPitch(
                        pitchStr
                      )
              )
        )!.concat(keyword.substring(keyword.indexOf(';')+1));
  }
    

  selectKey(key: string): void {
    const tonality : string = this.tonality()!==undefined ? this.tonality()! : '';
    const pitchStr = this.harmonicKeys.find(value => tonality.startsWith(value));
    const confirm = window
      .confirm(
        `
          ¿Estás seguro que deseas cambiar la tonalidad a 
          ${key}${tonality.length>=2 ? tonality.replace(pitchStr!, '') : ''}? 
          Esto cambiará la tonalidad de la canción y la progresión de acordes.
        `
      );
    if (!confirm) {
      return;
    }
    this.key.emit(key);
  }
}
