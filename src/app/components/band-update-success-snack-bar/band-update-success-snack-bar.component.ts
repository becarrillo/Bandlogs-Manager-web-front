import { Component, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-band-update-success-snack-bar',
  standalone: true,
  imports: [],
  templateUrl: './band-update-success-snack-bar.component.html',
  styleUrl: './band-update-success-snack-bar.component.css'
})
export class BandUpdateSuccessSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
