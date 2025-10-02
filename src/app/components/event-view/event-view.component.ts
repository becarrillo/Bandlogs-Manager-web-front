import { Component, inject } from '@angular/core';
import { AppComponent } from '../../app.component';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EventDeleteDialogComponent } from '../event-delete-dialog/event-delete-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';
import { ManagingEventAction } from '../../enums/managing-event-action';
import { EventUpdateFormDialogComponent } from '../event-update-form-dialog/event-update-form-dialog.component';
import { SongProgressionViewDialogComponent } from '../song-progression-view-dialog/song-progression-view-dialog.component';
import { MusicalUtilService } from '../../services/musical-util.service';
import { LATIN_STRING_PITCHES } from '../../constants';
import { Pitch } from '../../enums/pitch';
import { Song } from '../../interfaces/song';
import { BandService } from '../../services/band.service';
import { AddSongsToEventFormDialogComponent } from '../add-songs-to-event-form-dialog/add-songs-to-event-form-dialog.component';


@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.css'
})
export class EventViewComponent {
  private readonly eventService = inject(EventService);
  protected readonly authService = inject(AuthService);
  private readonly bandService = inject(BandService);
  protected readonly musicalUtilService = inject(MusicalUtilService);
  protected readonly route = inject(ActivatedRoute);
  protected dialog = inject(MatDialog);
  protected loggedInUserRole!: IUserRole;
  protected bandId!: number;
  private event!: Event;
  eventRepertoireColumns: string[] = ['title', 'tonality', 'action'];
  readonly latinStrTonalityPitch = this.musicalUtilService.formatChordPitch;

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.bandId = Number(params.get('id-de-banda')!);
      const paramStr = params.get('id-de-evento');
      if (paramStr !== null) {
        this.eventService
          .getEventById(paramStr)
          .subscribe({
            next: (value) => {
              this.event = value;
            },
            error: (err) => {
              if (err.status === 401) {
                localStorage.removeItem('accessToken');
                AppComponent.userIsAuthenticated.set(false);
                window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'")
              } else if (err.status === 500) {
                window.alert("Error de servidor");
              } else {
                window.alert("Error al intentar obtener un evento: ".concat(err.message));
              }
            },
          });
      }
    });
    this.authService
      .getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.loggedInUserRole = value;
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido a '/login'")
          } else if (err.status === 500) {
            window.alert("Error de servidor");
          } else {
            window.alert("Error desconocido al intentar obtener usuario-rol");
          }
        },
      });
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

  getLatinStrPitches() {
    return LATIN_STRING_PITCHES;
  }

  getLatinStrTonality(pitchStr: string, tonalitySuffix: string) {
    var result = '';
    const pitch = this.convertStringToPitch(pitchStr);
    const split = LATIN_STRING_PITCHES.at(pitch.valueOf())?.split('/');

    if (split !== undefined && (pitch === Pitch.A_SHARP || pitch === Pitch.D_SHARP || pitch === Pitch.G_SHARP)) {
      result += split?.at(1)!;
    }
    else if (pitch === Pitch.C_SHARP || pitch === Pitch.F_SHARP) {
      result += split?.at(0)!;
    }
    else {
      result += LATIN_STRING_PITCHES.at(pitch.valueOf());
    }
    return result.concat(tonalitySuffix ?? '');
  }

  getManagingEventActionEnumType() {
    return ManagingEventAction;
  }

  openDialog(action: ManagingEventAction, data?: any) {
    if (action === ManagingEventAction.TO_DELETE) {
      this.dialog.open(EventDeleteDialogComponent, {
        data: { event: this.event },
        enterAnimationDuration: 2,
        hasBackdrop: true
      });
    }
    else if (action === ManagingEventAction.TO_EDIT) {
      this.dialog.open(EventUpdateFormDialogComponent, {
        data: { bandId: this.bandId, loggedInUserRole: this.loggedInUserRole, event: this.event },
        enterAnimationDuration: 3,
        hasBackdrop: true
      });
    } else if (action === ManagingEventAction.TO_VIEW_PROGRESSION_OF_SONG) {
      this.dialog.open(SongProgressionViewDialogComponent, {
        data,
        enterAnimationDuration: 4,
        hasBackdrop: true
      });
    } else {
      this.dialog.open(AddSongsToEventFormDialogComponent, {
        data: { bandId: this.bandId, loggedInUserRole: this.loggedInUserRole, event: this.event, toAddSongs: true },
        enterAnimationDuration: 3,
        hasBackdrop: true
      });
    }
  }

  removeSong(song: Song) {
    const confirm = window.confirm("¿Estás seguro de que deseas retirar esta canción del evento?");
    if (!confirm) return;
    const event = this.event;
    event['repertoire'] = this.event.repertoire.filter(value => {
      return value.songId!==song.songId
    });
    this.eventService
        .updateEvent(this.event.eventId!, event)
        .subscribe({
          next: (value) => {
            this.bandService
                .patchEventToBand(this.bandId, value)
                .subscribe({
                  next: () => {
                    window.location.reload()
                  },
                  error: (err) => {
                    onError(err);
                  }
                });
          },
          error: (err) => {
            onError(err);
          }
        })
    const onError = (err: any) => {
      if (err.status === 500) {
        window.alert('Error interno del servidor. Inténtalo de nuevo más tarde.');
      } else if (err.status === 401) {
        window.alert('Sesión expirada. Serás redirigido al login.');
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        window.location.pathname = "/login";
      } else {
        window.alert('Error desconocido, no se pudo realizar la eliminación');
      }
    }
  }

  get _event() {
    return this.event;
  }
}
