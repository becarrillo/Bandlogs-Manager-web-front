import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { LoginFailureSnackBarComponent } from '../login-failure-snack-bar/login-failure-snack-bar.component';
import { AppComponent } from '../../app.component';
import { CommonModule } from '@angular/common';
import { IToken } from '../../interfaces/i-token';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    FormSuspenseComponent
  ],
  providers: [AuthService, CookieService],
  templateUrl: './login.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  protected cookieService = inject(CookieService);
  readonly loginForm = new FormGroup({
    nickname: new FormControl<string | null>(
      '',
      [Validators.required, Validators.minLength(4)]
    ),
    password: new FormControl<string | null>(
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(30)]
    )
  });
  hide = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  disableSubmitBtn() : boolean {
    return (
      this.loginForm.controls.nickname.invalid || this.loginForm.controls.password.invalid
    )
  }

  updateErrorMessage(control : FormControl<string | null>) {
    if (control.hasError('required')) {
      this.errorMessage.set("Ingresa valor válido alguno");
    } else {
      this.errorMessage.set('Cantidad insuficiente o excedente de caracteres');
    }
  }
  
  onSubmit() {
    const nickname = this.loginForm.value.nickname!;
    const password = this.loginForm.value.password!;
    if (this.loginForm.controls.nickname.valid && this.loginForm.controls.password.valid)
      this.loading.set(true);
    this.authService.login({nickname, password})
      .subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', (response as unknown as IToken).accessToken);
          this.cookieService.set("loggedInUsername", nickname);
          const navigation = this.cookieService.get('navigation');
          AppComponent.userIsAuthenticated.set(true);
          this.loading.set(false);
          if (navigation!==undefined && navigation.length > 0) {
            this.router.navigateByUrl(navigation);
          } else {
            this.cookieService.set('navigation', '/');
            this.router.navigateByUrl('/dashboard');
          }
        },
        error: (err) => {
          AppComponent.userIsAuthenticated.set(false);
          this.openErrorSnackBar();
          this.loading.set(false);
          throw new Error(err);
        }
      }
    );
  }

  private openErrorSnackBar() {
    this._snackBar.openFromComponent(LoginFailureSnackBarComponent, {
      announcementMessage: "Error de inicio de sesión",
      duration: 4500,
      verticalPosition: "top",
      horizontalPosition: "right"
    });
  }

  toggleHidePassword(ev : Event) {
    ev.preventDefault();
    this.hide() ? (
      this.hide.set(false)
    ) : (
      this.hide.set(true)
    );
  }
}
