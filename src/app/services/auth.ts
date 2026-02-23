import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

// On définit exactement ce que le token contient pour éviter les erreurs de type
interface JwtPayload {
  sub: string;
  authorities?: string[];
  roles?: string[];
  exp?: number;
}

export interface UserDTO {
  userName: string;
  authorities: string[];
  token?: string;
}

interface LoginResponse {
  token: string;
  // Ajoute d'autres propriétés si ton backend en renvoie (ex: email, id)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = this.decodeToken(token);
        this.currentUserSubject.next(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  login(credentials: Record<string, string>): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/signin`, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          const user = this.decodeToken(response.token);
          this.currentUserSubject.next(user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // On renvoie l'erreur complète pour que le composant puisse l'afficher
        return throwError(() => error);
      })
    );
  }

  private decodeToken(token: string): UserDTO {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // On récupère les rôles peu importe le nom dans le JWT (authorities ou roles)
      const rolesFromToken = decoded.authorities || decoded.roles || [];

      // On s'assure que c'est bien un tableau pour le .map()
      const rolesArray: string[] = Array.isArray(rolesFromToken) ? rolesFromToken : [rolesFromToken];

      const formattedRoles = rolesArray.map((role: string) => {
        let formatted = role.trim().toUpperCase();
        formatted = formatted.replace(/\s+/g, '_');
        return formatted.startsWith('ROLE_') ? formatted : `ROLE_${formatted}`;
      });

      return {
        userName: decoded.sub || '',
        authorities: formattedRoles,
        token: token
      };
    } catch (error) {
      console.error("Erreur de décodage du token", error);
      return { userName: '', authorities: [], token: '' };
    }
  }

  public get currentUserValue(): UserDTO | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.authorities) return false;
    const target = role.toUpperCase().trim();
    const targetWithPrefix = target.startsWith('ROLE_') ? target : `ROLE_${target}`;
    return user.authorities.includes(targetWithPrefix);
  }

  public clearStorage(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }
}
