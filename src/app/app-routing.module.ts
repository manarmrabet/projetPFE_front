import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { SignInComponent } from './pages/auth/signin/signin';
import { UserManagement } from './pages/admin/user-management/user-management';

const routes: Routes = [
  // 1. Redirection de la racine vers /login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // 2. Pages "GUEST" (Login sans sidebar)
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        component: SignInComponent
      }
    ]
  },
  // 3. Pages "ADMIN" (Dashboard avec sidebar)
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard-v1',
        loadComponent: () => import('./pages/dashboard-v1/dashboard-v1').then((c) => c.DashboardV1Component)
      },
      {
        path: 'user-management',
        component: UserManagement
      }

    ]
  },
  // 4. Sécurité : Tout le reste va au login
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
