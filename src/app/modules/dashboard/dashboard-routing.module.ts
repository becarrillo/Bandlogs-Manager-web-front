import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


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
    path: 'bandas/estadisticas',
    loadComponent: () => import('../../components/statistics/statistics.component')
      .then(m => m.StatisticsComponent)
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
    path: 'bandas/:id-de-banda/eventos/:id-de-evento',
    loadComponent: () => import('../../components/event-view/event-view.component')
      .then(m => m.EventViewComponent)
  },
  {
    path: 'repertorio/cancion',
    loadComponent: () => import('../../components/song-view/song-view.component')
      .then(m => m.SongViewComponent)
  },
  {
    path: 'repertorio/cancion/:id-de-cancion/modificar',
    loadComponent: () => import('../../components/song-update-form-dialog/song-update-form-dialog.component')
      .then(m => m.SongUpdateFormDialogComponent)
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
