import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WHATSAPP_COUNTRY_CODES } from '../../constants';
import { MatSelectModule } from '@angular/material/select';
import { Band } from '../../interfaces/band';
import { BandService } from '../../services/band.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-membership-invitation-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membership-invitation-form-dialog.component.html',
  styleUrl: './membership-invitation-form-dialog.component.css'
})
export class MembershipInvitationFormDialogComponent {
  private readonly userService = inject(UserService);
  private readonly bandService = inject(BandService);
  readonly dialogRef = inject(MatDialogRef<MembershipInvitationFormDialogComponent>);
  protected readonly data = inject<{bands: Band[], userNickname: string}>(MAT_DIALOG_DATA);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  submitIsEnabled = signal(false);
  readonly bands = this._formBuilder.group<any>({});

  private _snackBar = inject(MatSnackBar);
  
  constructor() {
    this.data.bands.forEach(b => {
      this.bands.addControl(b.name, new FormControl(false));
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  enableSubmit() {
    this.submitIsEnabled.set(true);
  }

  getCountryCodes() {
    return WHATSAPP_COUNTRY_CODES;
  }

  getUserNickname() {
    return this.data.userNickname
  }

  onSubmit() {
    const confirm = window
      .confirm(
        "¿Estás seguro de realizar la acción? el usuario será agregado a la(s) banda(s) que has seleccionado"
      );
    if (confirm) {
      this.data.bands.forEach(b => {  // looking for validate with control boolean value by control name
        const control = (this.bands.controls as any)[b.name];
        if (control.value) {
          this.userService
              .getUserByNickname(this.getUserNickname())
              .subscribe(user => {
                this.bandService
                    .patchMemberUserToBand(b.bandId, user)
                    .subscribe({
                      next: (band) => {
                        this.openSnackBar(
                          `El usuario ${user.nickname} es ahora un miembro de ${band.name}.\n Cantidad de miembros: ${band.users?.length}`);
                        this.dialogRef.close();
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      },
                      error: (err) => {
                        this.openSnackBar("Error al agregar el miembro a la(s) banda(s). No se pudo completar la operación");
                        throw new Error(err.message);
                      }
                    });
              });
        }
      });
    }
  }

  private openSnackBar(message: string) {
    this._snackBar.open(
      message,
      "Cerrar",
      {
        duration: 4500,
        verticalPosition: "top",
        horizontalPosition: "center"
      });
    this.dialogRef.close();
  }
}
