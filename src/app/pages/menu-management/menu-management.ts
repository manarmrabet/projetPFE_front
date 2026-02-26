import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminService } from 'src/app/services/admin';
import { MenuItemDTO, ApiResponse } from 'src/app/models/user.model';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './menu-management.html'
})
export class MenuManagement implements OnInit {
  private adminService = inject(AdminService);

  menus = signal<MenuItemDTO[]>([]);
  displayModal = false;
  isEditMode = false;

  newMenu: MenuItemDTO = {
    menuItemId: 0,
    label: '',
    icon: '',
    link: '',
    isTitle: 0,
    isLayout: 0,
    parentId: undefined
  };

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.adminService.getAllMenuItems().subscribe({
      next: (res: ApiResponse<MenuItemDTO[]>) => {
        this.menus.set(res.data || []);
      },
      error: (err) => console.error("Erreur de chargement", err)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.resetForm();
    this.displayModal = true;
  }

  openEditModal(item: MenuItemDTO) {
    this.isEditMode = true;
    this.newMenu = { ...item }; // Copie l'objet pour ne pas modifier la liste en direct
    this.displayModal = true;
  }

  deleteMenu(id: number) {
    if (confirm('Supprimer cet élément ?')) {
      this.adminService.deleteMenuItem(id).subscribe({
        next: () => {
          this.loadMenus();
          alert("Menu supprimé !");
        },
        error: (err) => console.error("Erreur suppression", err)
      });
    }
  }

  submitMenu() {
    const request = this.isEditMode
      ? this.adminService.updateMenuItem(this.newMenu.menuItemId, this.newMenu)
      : this.adminService.createMenuItem(this.newMenu);

    request.subscribe({
      next: () => {
        this.displayModal = false;
        this.loadMenus();
        this.resetForm();
        alert(this.isEditMode ? "Menu modifié !" : "Menu ajouté !");
      },
      error: (err) => console.error("Erreur lors de l'envoi", err)
    });
  }

  resetForm() {
    this.newMenu = {
      menuItemId: 0,
      label: '',
      icon: '',
      link: '',
      isTitle: 0,
      isLayout: 0,
      parentId: undefined
    };
  }
}
