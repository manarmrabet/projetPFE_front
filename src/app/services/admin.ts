import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Role, UserDTO, Site, ApiResponse, MenuItemDTO } from '../models/user.model'; 
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private adminUrl = 'http://localhost:8080/api/admin/users';
  private roleUrl = 'http://localhost:8080/api/admin/roles'; 
  private siteUrl = 'http://localhost:8080/api/sites';
  private menuUrl = 'http://localhost:8080/api/menu-items/me'; // URL vers votre nouveau controller

  // Récupère les menus autorisés pour l'utilisateur connecté
  getAuthorizedMenus(): Observable<MenuItemDTO[]> {
    return this.http.get<ApiResponse<MenuItemDTO[]>>(this.menuUrl).pipe(
      map(res => res.data || [])
    );
  }

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<ApiResponse<UserDTO[]>>(this.adminUrl).pipe(
      map(res => res.data)
    );
  }

  createUser(user: UserDTO): Observable<UserDTO> {
    return this.http.post<ApiResponse<UserDTO>>(this.adminUrl, user).pipe(
      map(res => res.data)
    );
  }

  updateUser(id: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<ApiResponse<UserDTO>>(`${this.adminUrl}/${id}`, user).pipe(
      map(res => res.data)
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(this.roleUrl).pipe(
      map(res => res.data)
    );
  }

  getSites(): Observable<Site[]> {
    return this.http.get<ApiResponse<Site[]>>(this.siteUrl).pipe(
      map(res => res.data)
    );
  }
}