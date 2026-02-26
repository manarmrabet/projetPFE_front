import { Component, inject, OnInit, signal } from '@angular/core';
import { MenuItemDTO, Role } from 'src/app/models/user.model';
import { AdminService } from 'src/app/services/admin';
import { RoleMappingService } from 'src/app/services/role-mapping';

@Component({
  selector: 'app-role-permissions',
  imports: [],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.scss',
})
export class RolePermissions implements OnInit{
  private roleService = inject(AdminService); // Pour charger les rôles
  private mappingService = inject(RoleMappingService);

  roles = signal<Role[]>([]);
  allMenus = signal<MenuItemDTO[]>([]);
  selectedRoleId = signal<number | null>(null);
  selectedMenuIds = signal<number[]>([]); // IDs des menus cochés

  // role-permissions.component.ts

ngOnInit() {
  // Charger tous les rôles (AdminService renvoie probablement déjà le tableau directement)
  this.roleService.getRoles().subscribe(roles => this.roles.set(roles));

  // Charger tous les menus
  // Ici, 'menus' est déjà un MenuItemDTO[] car le service a fait le travail de map(res => res.data)
  this.mappingService.getAllMenus().subscribe({
    next: (menus) => this.allMenus.set(menus),
    error: (err) => console.error('Erreur menus:', err)
  });
}

onRoleChange(roleId: number) {
  if (!roleId) {
    this.selectedRoleId.set(null);
    return;
  }
  this.selectedRoleId.set(roleId);

  // Charger les IDs des menus pour ce rôle
  this.mappingService.getRoleMenuIds(roleId).subscribe({
    next: (ids) => this.selectedMenuIds.set(ids), // 'ids' est déjà un number[]
    error: (err) => console.error('Erreur IDs:', err)
  });
}
  toggleMenu(menuId: number) {
    const current = this.selectedMenuIds();
    if (current.includes(menuId)) {
      this.selectedMenuIds.set(current.filter(id => id !== menuId));
    } else {
      this.selectedMenuIds.set([...current, menuId]);
    }
  }

  save() {
    if (!this.selectedRoleId()) return;
    this.mappingService.saveMapping(this.selectedRoleId()!, this.selectedMenuIds())
      .subscribe(() => alert('Permissions mises à jour avec succès !'));
  }

}
