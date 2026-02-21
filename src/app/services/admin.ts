import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, UserDTO } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private adminUrl = 'http://localhost:8080/api/admin/users';
  private roleUrl = 'http://localhost:8080/api/roles';

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.adminUrl);
  }

  createUser(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.adminUrl, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.roleUrl);
  }
}
