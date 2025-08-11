import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WHATSAPP_COUNTRY_CODES } from '../../constants';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { UserRole } from '../../enums/user-role';
import { UserService } from '../../services/user.service';
import { UserRegistrationSnackBarComponent } from '../user-registration-snack-bar/user-registration-snack-bar.component';


@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormSuspenseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRegistrationComponent {
  userService = inject(UserService);
  hide = signal(true);
  loading = signal(false);
  userRegistrationForm = new FormBuilder().group({
    firstname: [
      '',
      [
        Validators.required, Validators.minLength(3),
        Validators.pattern(new RegExp("[a-zA-Z]+"))] // At least 3 characters, search some letter
      ],
    lastname: [null, [Validators.pattern(new RegExp("[a-zA-Z]+"))]], // Optional field, search some letter
    countryCode: [
      this.getCountryCodes()[3], // Default to Colombia
      [Validators.required, Validators.minLength(2), Validators.maxLength(4)]
    ],
    phoneNumber: ['', [Validators.required, Validators.pattern(new RegExp("[0-9]{10}"))]], // 10 digits for phone number
    nickname: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))]] // At least 8 characters, one uppercase, one lowercase, one number
  });
  private _snackBar = inject(MatSnackBar);

  toggleHidePassword(ev : Event) {
    ev.preventDefault();
    this.hide() ? (
      this.hide.set(false)
    ) : (
      this.hide.set(true)
    );
  }

  getCountryCodes() : (string | null)[] {
    return WHATSAPP_COUNTRY_CODES;
  }

  onSubmit(ev : Event) {
    ev.preventDefault();
    if (this.userRegistrationForm.valid) {
      this.loading.set(true);
      this.userService.registerUser({   // To send the form data to backend service
        firstname: this.userRegistrationForm.value.firstname!,
        lastname: this.userRegistrationForm.value.lastname!,
        phoneNumber: (this.userRegistrationForm.value.countryCode!)
            .concat(this.userRegistrationForm.value.phoneNumber!),
        nickname: this.userRegistrationForm.value.nickname!,
        password: this.userRegistrationForm.value.password!,
        role: UserRole.ROLE_USER // Default role for registration
      }).subscribe({
        next: (response) => {
          // Handles successful registration
          this.loading.set(false);
          this.openSnackBar(
            "1 registro exitoso: "
              .concat(response.firstname + ' ' + response.lastname + " / " + `(@${response.nickname})`)
          );
        },
        error: (error) => {
          // Handles error
          this.loading.set(false);
          this.openSnackBar("Así falló el registro Usuario: ".concat(error));
          
          throw new Error(error.message);
        }
      });
    }
    this.userRegistrationForm.reset();
  }

  openSnackBar(message : string) {
    // This method can be used to open a snackbar with a message
    // indicating that the registration was successful or failed.

    this._snackBar.openFromComponent(UserRegistrationSnackBarComponent, {
          duration: 4500,
          verticalPosition: "top",
          horizontalPosition: "right"
    });

    UserRegistrationSnackBarComponent.setHtmlSpanResultMessage(message);
  }
}
