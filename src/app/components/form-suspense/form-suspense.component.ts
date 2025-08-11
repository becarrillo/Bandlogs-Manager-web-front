import { Component, input, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-form-suspense',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  providers: [],
  templateUrl: './form-suspense.component.html',
  styleUrl: './form-suspense.component.css'
})
export class FormSuspenseComponent {
  text = input<string>();
}
