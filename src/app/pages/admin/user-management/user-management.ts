import { Component, OnInit, inject, signal } from '@angular/core'; // Ajout de signal ici
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Nécessaire pour [(ngModel)]
import { AdminService } from '../../../services/admin'; // Vérifie bien le chemin vers ton service
import { UserDTO, Role } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ajout de FormsModule pour corriger l'erreur ngModel
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private adminService = inject(AdminService); // On utilise le bon nom de classe

  // Signaux d'état (importés de @angular/core)
  users = signal<UserDTO[]>([]);
  roles = signal<Role[]>([]);
  step = signal(1);
  isLoading = signal(false);

  newUser = signal<UserDTO>({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    roleName: ''
  });

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.adminService.getUsers().subscribe(res => this.users.set(res));
    this.adminService.getRoles().subscribe(res => this.roles.set(res));
  }

  saveUser() {
    this.isLoading.set(true);
    this.adminService.createUser(this.newUser()).subscribe({
      next: () => {
        this.refreshData();
        this.resetForm();
        this.isLoading.set(false);
        alert('Succès : Utilisateur créé !');
      },
      error: () => this.isLoading.set(false)
    });
  }

  confirmDelete(user: UserDTO) {
    if (user.userId && confirm(`Supprimer ${user.userName} ?`)) {
      this.adminService.deleteUser(user.userId).subscribe(() => this.refreshData());
    }
  }

  resetForm() {
    this.step.set(1);
    this.newUser.set({ userName: '', email: '', firstName: '', lastName: '', roleName: '' });
  }
}
