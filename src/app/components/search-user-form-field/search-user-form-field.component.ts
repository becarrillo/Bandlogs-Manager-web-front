import { Component, ElementRef, EventEmitter, inject, input, Output, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../interfaces/user';
import { ManagingBandAction } from '../../enums/managing-band-action';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-search-user-form-field',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './search-user-form-field.component.html',
  styleUrl: './search-user-form-field.component.css'
})
export class SearchUserFormFieldComponent {
  private readonly userService = inject(UserService);
  readonly dialog = inject(MatDialog);
  readonly cookieService = inject(CookieService);
  protected userNicknameControl = new FormControl('', Validators.required);
  readonly loggedInUsername = input<string>();
  readonly filteredUsers = signal<User[]>([]);
  
  @Output('searchUser') protected readonly searchUserEvent = new EventEmitter<string>();
  readonly loading = signal(false);

  /* It is used to filter users in the autocomplete input */
  @ViewChild('filterUserInput') userInput!: ElementRef<HTMLInputElement>;

  /** It set (again) saved users into filteredUsers attribute, wich correspond to a filter users signal  */
  filterUsers() {
    const filterValue = this.userInput.nativeElement.value.toLowerCase();
    this.filteredUsers.set(
      this.filteredUsers()
        .filter(user => {
          const substring = user
            .nickname
            .toLowerCase()
            .normalize("NFD")
            // characters with tildes (and other accents) are converted to their plain, unaccented counterparts,
            // through normalize() and regular expression /[\\u0300-\\u036f]/g allowing for case-insensitive and
            // accent-insensitive comparisons or searches
            .replace(/[\u0300-\u036f]/g, "")
            .substring(0, filterValue.length);
          return substring === filterValue;
        })
    );
  }

  onFilterUsersInputFocus() {
    this.userService.listAll()
        .subscribe({
          next: (value) => {
            this.filteredUsers.set(
              value.filter(element => {
                  return element.nickname !== this.loggedInUsername()!;
                }
              ));
          },
          error: (err) => {
            onError(err);
          },
        });
    const onError = (err: any) => {
      console.error(err);
      window.alert("Error en la operación de obtener los usuario(s)");
    }
  }

  sendUserNicknameToParent() {
    this.searchUserEvent.emit(this.userNicknameControl.value as string);
  }

  protected get managingBandActionEnumType() {
    return ManagingBandAction;
  }
}
