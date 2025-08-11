import { Component, inject } from '@angular/core';
import { MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-failure-snack-bar',
  standalone: true,
  imports: [
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel
  ],
  templateUrl: './login-failure-snack-bar.component.html',
  styleUrl: './login-failure-snack-bar.component.css'
})
export class LoginFailureSnackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
