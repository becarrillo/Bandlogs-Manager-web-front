import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../interfaces/user';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-user-update-form-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogContent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-update-form-dialog.component.html',
  styleUrl: './user-update-form-dialog.component.css'
})
export class UserUpdateFormDialogComponent implements OnInit {
  protected readonly data = inject<{user: User, loading: WritableSignal<boolean>}>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<UserUpdateFormDialogComponent>);
  protected readonly userService = inject(UserService);
  readonly router = inject(Router);
  protected userUpdateForm = new FormBuilder().group({
    firstname: new FormControl<string>(this.data.user.firstname),
    lastname: new FormControl<string>(this.data.user.lastname),
    nickname: new FormControl<string>(this.data.user.nickname),
    enablePasswordCheckbox: new FormControl<boolean>(false), // Control for hiding the password field
    password: new FormControl<string>(
      '',
      [Validators.minLength(8), Validators.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))]),
      // Password field with validation
    phoneNumber: new FormControl<string>(this.data.user.phoneNumber)
  });
  hidePassworddToggler = signal(true);

  _snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.userUpdateForm.controls.password?.disable(); // Initially disable the password field
    // This ensures that the password field is not editable unless the checkbox is checked
  }

  onSubmit() {
    this.dialogRef.close();
    this.data.loading.set(true);
    this.dialogRef.afterClosed()
          .subscribe(v => {
            var updatedUser : User;
            if (this.userUpdateForm.value.enablePasswordCheckbox) {
              // If the checkbox is checked, include the new password in the update
              updatedUser = {
                userId: this.data.user.userId,
                firstname: this.userUpdateForm.value.firstname!,
                lastname: this.userUpdateForm.value.lastname!,
                nickname: this.userUpdateForm.value.nickname!,
                phoneNumber: this.userUpdateForm.value.phoneNumber!,
                password: this.userUpdateForm.value.password!,
                role: this.data.user.role // Keep the same role
              };
            } else {
              // If the checkbox is not checked, do not include a new password in the update
              updatedUser = {
                userId: this.data.user.userId,
                firstname: this.userUpdateForm.value.firstname!,
                lastname: this.userUpdateForm.value.lastname!,
                nickname: this.userUpdateForm.value.nickname!,
                phoneNumber: this.userUpdateForm.value.phoneNumber!,
                password: this.data.user.password, // Keep the same password if not updating
                role: this.data.user.role // Keep the same role
              };
            }
            // Prepare the updated user object based on the form values
            this.userService.updateUser(updatedUser).subscribe({
              next: () => {
                this.data.loading.set(false);
                this._snackBar.open("Modificación realizada con éxito", "Cerrar", {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.dialogRef.close(updatedUser);
                // Handle success, e.g., close the dialog or show a success message
                this.router.navigateByUrl('/dashboard'); // Navigate to the dashboard or another page
              },
              error: (err) => {
                onError(err)
              }
            });
            this.data.loading.set(false);
            // Assuming you have a method in your service to update the user
          });
    const onError = (err: any) => {
      console.error(err);
      this.data.loading.set(false);
      if (err.status === 401) {
        localStorage.removeItem('accessToken');
        AppComponent.userIsAuthenticated.set(false);
        // Handle error, e.g., show an error message
        this._snackBar.open("Error al modificar el usuario, Tu sesión ha expirado. Por favor, inicia sesión de nuevo", "Cerrar", {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.dialogRef.close();
        this.router.navigateByUrl('/login');
      } else if (err.status === 500) {
        // Handle error, e.g., show an error message
        this._snackBar.open("Error del servidor. Intenta nuevamente más tarde.", "Cerrar", {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        window.alert("");
      } else {
        console.error("Error: ".concat(err.message));
        window.alert("Error desconocido");
      }
    }
  }

  toggleHidePassword(ev : Event) {
    ev.preventDefault();
    this.hidePassworddToggler() ? (
      this.hidePassworddToggler.set(false)
    ) : (
      this.hidePassworddToggler.set(true)
    );
  }

  togglePasswordField() {
    const passwordFieldIsEnabled = this.userUpdateForm.get('enablePasswordCheckbox')?.value;
    !passwordFieldIsEnabled ? (
      this.userUpdateForm.controls.password?.setValue(''), // Clear the password field if disabled
      this.userUpdateForm.controls.password?.disable()
    ) : (
      this.userUpdateForm.controls.password?.setValidators([Validators.minLength(8), Validators.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))]),
      this.userUpdateForm.controls.password?.updateValueAndValidity(),
      this.userUpdateForm.controls.password?.enable()
    );
    // Toggle the password field based on the checkbox value
  }
}
