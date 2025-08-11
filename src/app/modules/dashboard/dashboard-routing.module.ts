import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../components/dashboard-index/dashboard-index.component')
      .then(m => m.DashboardIndexComponent)
  },
  {
    path: 'bandas',
    loadComponent: () => import('../../components/manage-bands/manage-bands.component')
      .then(m => m.ManageBandsComponent)
  },
  {
    path: 'bandas/:id-de-banda',
    loadComponent: () => import('../../components/band-view/band-view.component')
      .then(m => m.BandViewComponent)
  },
  {
    path: 'bandas/:id-de-banda/eventos/agregar',
    loadComponent: () => import('../../components/event-create-form/event-create-form.component')
      .then(m => m.EventCreateFormComponent)
  },
  {
    path: 'repertorio/cancion',
    loadComponent: () => import('../../components/song-view/song-view.component')
      .then(m => m.SongViewComponent)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('../../components/manage-users/manage-users.component')
      .then(m => m.ManageUsersComponent)
  },
  {
    path: 'usuarios/usuario',
    loadComponent: () => import('../../components/user-profile/user-profile.component')
      .then(c => c.UserProfileComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
