import { Component, inject } from '@angular/core';
import { MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-registration-snack-bar',
  standalone: true,
  imports: [
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel
  ],
  styles: `
    #snackContainer {

    }
  `,
  templateUrl: './user-registration-snack-bar.component.html',
  styleUrl: './user-registration-snack-bar.component.css'
})
export class UserRegistrationSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);

  static setHtmlSpanResultMessage(resultMessage : string) {
    document.getElementById('resultMessage')!.textContent = resultMessage;
  }
}
