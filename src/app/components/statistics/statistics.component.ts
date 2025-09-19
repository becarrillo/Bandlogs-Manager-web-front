import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, model, signal, WritableSignal } from '@angular/core';
import { AppComponent } from '../../app.component';
import { BandService } from '../../services/band.service';
import { AuthService } from '../../services/auth.service';
import { IUserRole } from '../../interfaces/i-user-role';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormSuspenseComponent } from '../form-suspense/form-suspense.component';
import { Band } from '../../interfaces/band';


@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormSuspenseComponent,
    MatSlideToggleModule,
    NgxChartsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent {
  private readonly authService = inject(AuthService);
  private readonly bandService = inject(BandService);
  readonly router = inject(Router);

  protected userRoleObject!: IUserRole;
  private bands : Band[] = [];
  private resource: WritableSignal<{ name: string; value: number }[]> = signal([]);
  readonly resourceIsFilteredToCurrentMonth = model(false);
  readonly loading = signal(true);
  readonly view: [number, number] = [900, 400];

  constructor() {
    this.authService
      .getAuthenticatedUserRole()
      .subscribe({
        next: (value) => {
          this.userRoleObject = value;
          this.setAllResults();
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido al login");
            this.router.navigateByUrl('/login');
          } else if (err.status === 500) {
            window.alert("Error interno del servidor");
          } else {
            window.alert("Error general intentando obtener usuario autenticado y rol");
          }
        }
      });
  }

  getBandsLength() {
    return this.bands.length;
  }

  onSelect(ev: any) {
    console.log("Change to: ", ev);
  }

  onToggleChange() {
    if (!this.resourceIsFilteredToCurrentMonth())
      this.setResultsInCurrentMonth();
    else
      this.setAllResults();
  }

  private setAllResults() {
    this.resource.set([]);
    if (!this.loading())
      this.loading.set(true);
    this.bandService
      .listBandsByMemberUserNickname(this.userRoleObject.nickname)
      .subscribe({
        next: (value) => {
          this.bands = value;
          this.bands.forEach(b => {
            const count = b.events?.length!;
            this.resource.update(value => {
              return [...value, { name: b.name, value: count }]
            });
          });
          this.loading.set(false);
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.removeItem('accessToken');
            AppComponent.userIsAuthenticated.set(false);
            window.alert("Sesión expirada, vuelve a ingresar. Serás redirigido al login");
            this.router.navigateByUrl('/login');
          } else if (err.status === 500) {
            window.alert("Error interno del servidor");
          } else {
            window.alert("Error general intentando obtener usuario listado de tus bandas");
          }
        }
      });
  }

  private setResultsInCurrentMonth() {
    this.resource.set([]);
    this.loading.set(true);
    this.bands.forEach(b => {
      const today = this.getDate();
      const events = b.events!.length===0 ? [] : b.events?.filter(e => today.getMonth()===new Date(e.date).getMonth());
      const count = events?.length!;
      this.resource.update(value => {
        return [...value, { name: b.name, value: count }]
      });
    });
    this.loading.set(false);
  }

  getDate() {
    return new Date();
  }

  protected get results(): WritableSignal<{ name: string; value: number }[]> {
    return this.resource;
  }
}
