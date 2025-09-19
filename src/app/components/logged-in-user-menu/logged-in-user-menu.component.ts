import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logged-in-user-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './logged-in-user-menu.component.html',
  styleUrl: './logged-in-user-menu.component.css'
})
export class LoggedInUserMenuComponent {
  section = input.required<string>();
  
  @Output() menuItemEmitter = new EventEmitter<string>();

  onMenuButtonClick(menuItem : string) {
    this.menuItemEmitter.emit(menuItem);
  }
}
