import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BandService } from '../../services/band.service';
import { MatButtonModule } from '@angular/material/button';
import { Band } from '../../interfaces/band';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-band-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormSuspenseComponent,
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

  onDeleteConfirm(band : Band) {
    this.deletionInProgress.set(true);
    this.bandService.deleteBand(band).subscribe({
      next: () => {
        this.deletionInProgress.set(false);
        window.alert(`La banda ${band.name} ha sido eliminada correctamente.`);
        this.dialogRef.close();
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al eliminar la banda:', err);
        this.deletionInProgress.set(false);
        if (err.status===401) {
          localStorage.removeItem('accessToken');
          AppComponent.userIsAuthenticated.set(false);
          this.dialogRef.close();
          window.alert("Tu sesión expiró, por favor vuelve a autenticarte, se te redirigirá a '/login'");
          this.router.navigateByUrl('/login');
        } else {
          window.alert(`No se pudo eliminar la banda ${band.name}.`);
          this.dialogRef.close();
        }
      }
    });
  }  
}
