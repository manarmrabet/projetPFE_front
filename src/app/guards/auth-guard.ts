import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.currentUserValue;

    // 1. Vérification de session
    if (!user || !user.authorities || user.authorities.length === 0) {
      this.authService.clearStorage();
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRoles = route.data['roles'] as string[] | undefined;

    // 2. Si la route est publique (pas de rôles requis)
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    // 3. Vérification de l'accès (Comparaison robuste)
    const hasAccess = expectedRoles.some(expected =>
      user.authorities.some(possessed =>
        possessed.trim().toUpperCase() === expected.trim().toUpperCase()
      )
    );

    if (hasAccess) {
      return true;
    }

    // 4. Gestion des redirections en cas d'échec d'accès à une page spécifique
    console.error('ECHEC DE CORRESPONDANCE :', {
      attendu_par_la_route: expectedRoles,
      recu_du_backend: user.authorities
    });

    const isAdmin = this.authService.hasRole('ROLE_ADMIN');

    // On vérifie si l'utilisateur possède l'un des rôles "User" (incluant Viewer et Warehouse)
    const isStandardUser =
      this.authService.hasRole('ROLE_RESPONSABLE_MAGASIN') ||
      this.authService.hasRole('ROLE_VIEWER') ||
      this.authService.hasRole('ROLE_CONSULTATION') ||
      this.authService.hasRole('ROLE_MAGASINIER');

    // Dans auth-guard.ts, remplace la partie finale par :
const isAuthorizedUser = user.authorities.length > 0;

if (isAdmin) {
  if (state.url !== '/dashboard-v1') this.router.navigate(['/dashboard-v1']);
} else if (isAuthorizedUser) {
  // Si l'utilisateur a un rôle valide (comme ROLE_MANGER), on ne le déconnecte pas
  // On le redirige simplement s'il essaie d'accéder à une zone interdite
  if (state.url.includes('user-management')) {
      this.router.navigate(['/dashboard-v1']);
  }
} else {
  console.warn("Aucun rôle trouvé. Déconnexion.");
  this.authService.logout();
}
    return false;
  }
}
