import { Component, inject } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-event-delete-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './event-delete-dialog.component.html',
  styleUrl: './event-delete-dialog.component.css'
})
export class EventDeleteDialogComponent {
  private eventService = inject(EventService);
  protected data = inject<{event : Event}>(MAT_DIALOG_DATA);
  protected dialogRef = inject(MatDialogRef<EventDeleteDialogComponent>);

  /** @param event Musical band's event or scheduled commitment */
    protected onDeleteConfirm(event : Event) {
      const confirm = window.confirm("¿Estás seguro de eliminar el evento?");
      if (confirm) {
        this.eventService
          .deleteEvent(event);
      }
    }
}
