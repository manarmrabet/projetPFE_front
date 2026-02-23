import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { SignInComponent } from './pages/auth/signin/signin';
import { UserManagement } from './pages/admin/user-management/user-management';

// ATTENTION : Vérifiez bien si votre fichier s'appelle auth.guard ou auth-guard
import { AuthGuard } from './guards/auth-guard';


const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      { path: 'login', component: SignInComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard-v1',
        loadComponent: () => import('./pages/dashboard-v1/dashboard-v1').then((c) => c.DashboardV1)
      },
      {
        path: 'user-management',
        component: UserManagement,
        // On remet le guard ici pour qu'il lise les "data" (roles)
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN','ROLE_USER', 'ROLE_VIEWER', 'ROLE_WAREHOUSE_WORKER'] }
      },

    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
