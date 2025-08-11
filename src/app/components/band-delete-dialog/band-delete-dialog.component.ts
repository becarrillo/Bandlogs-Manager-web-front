import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BandService } from '../../services/band.service';
import { MatButtonModule } from '@angular/material/button';
import { Band } from '../../interfaces/band';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-band-delete-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './band-delete-dialog.component.html',
  styleUrl: './band-delete-dialog.component.css'
})
export class BandDeleteDialogComponent {
  protected data = inject<{ band: Band }>(MAT_DIALOG_DATA);
  protected bandService = inject(BandService);
  dialogRef = inject(MatDialogRef<BandDeleteDialogComponent>);
  router = inject(Router);

  deletionInProgress = signal(false);

  onDeleteConfirm() {
    this.deletionInProgress.set(true);
    this.bandService.deleteBand(this.data.band).subscribe({
      next: () => {
        this.deletionInProgress.set(false);
        this.dialogRef.close(true);
        window.alert(`La banda ${this.data.band.name} ha sido eliminada correctamente.`);
        this.router.navigateByUrl('/dashboard/bandas');
      },
      error: (err) => {
        console.error('Error al eliminar la banda:', err);
        this.deletionInProgress.set(false);
        if (err.status===401) {
          localStorage.removeItem('accessToken');
          AppComponent.userIsAuthenticated.set(false);
          window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a '/login'");
          this.router.navigateByUrl('/login');
        } else {
          window.alert(`No se pudo eliminar la banda ${this.data.band.name}.`);
        }
      }
    });
  }  
}
