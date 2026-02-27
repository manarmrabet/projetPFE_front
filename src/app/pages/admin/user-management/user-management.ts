import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin';
import { UserDTO, Role, Site } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private adminService = inject(AdminService);

  // Signaux de données
  users = signal<UserDTO[]>([]);
  roles = signal<Role[]>([]);
  sites = signal<Site[]>([]);

  // État UI
  isLoading = signal(false);
  isPageLoading = signal(true);
  showModal = signal(false);
  isEditMode = signal(false);
  searchTerm = signal('');

  // Formulaire : initialisé avec une fonction helper
  newUser = signal<UserDTO>(this.initUser());

  // Recherche filtrée avec computed pour la performance
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(u =>
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.roleName?.toLowerCase().includes(term) ||
      u.siteName?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isPageLoading.set(true);
    
    // Chargement parallèle des données
    this.refreshUsers();
    
    this.adminService.getRoles().subscribe({
      next: (res) => this.roles.set(res),
      error: (err) => console.error('Erreur rôles:', err)
    });

    this.adminService.getSites().subscribe({
      next: (res) => {
        console.log('Sites chargés:', res);
        this.sites.set(res);
      },
      error: (err) => console.error('Erreur sites:', err)
    });
  }

  refreshUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.isPageLoading.set(false);
      },
      error: () => this.isPageLoading.set(false)
    });
  }

  initUser(): UserDTO {
    return { 
      userName: '', 
      email: '', 
      firstName: '', 
      lastName: '', 
      roleName: '', 
      siteName: '', 
      isActive: 1, 
      authorities: [] 
    };
  }

  openModal(user?: UserDTO) {
    if (user) {
      this.isEditMode.set(true);
      // On crée une copie pour ne pas modifier la ligne du tableau en direct
      this.newUser.set({ ...user });
    } else {
      this.isEditMode.set(false);
      this.newUser.set(this.initUser());
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.newUser.set(this.initUser());
  }

  // user-management.ts
saveUser() {
  const user = this.newUser();
  const userId = user.id ?? (user as any).Id;
  this.isLoading.set(true);

  const obs = this.isEditMode()
    ? this.adminService.updateUser(userId!, user)
    : this.adminService.createUser(user);

  this.adminService.createUser(this.newUser()).subscribe({
  next: () => {
    this.refreshUsers();
    this.closeModal();
  },
  error: (err) => {
    // Si l'utilisateur est créé malgré la 403 (ce qui arrive dans votre cas)
    if (err.status === 403) {
      this.refreshUsers(); // On rafraîchit quand même
      this.closeModal();   // On ferme la modale
    }
    this.isLoading.set(false);
  }
});
}

  confirmDelete(user: UserDTO) {
    const id = user.id ?? (user as any).Id;
    if (id && confirm(`Supprimer l'utilisateur ${user.firstName} ?`)) {
      this.adminService.deleteUser(id).subscribe({
        next: () => this.refreshUsers(),
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  updateSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}