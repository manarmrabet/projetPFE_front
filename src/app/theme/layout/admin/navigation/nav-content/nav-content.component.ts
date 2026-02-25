import { Component, OnInit, inject, output, signal } from '@angular/core';
import { Location, LocationStrategy, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { environment } from 'src/environments/environment';
import { NavigationItem } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { AdminService } from 'src/app/services/admin';

@Component({
  selector: 'app-nav-content',
  standalone: true,
  imports: [SharedModule, NavGroupComponent, CommonModule, RouterModule],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private adminService = inject(AdminService);

  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  // public props
  navigation: NavigationItem[] = []; // Initialisé vide
  windowWidth: number;
  NavMobCollapse = output();

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit() {
    // 1. Charger les menus dynamiquement depuis la base de données
    this.loadDynamicNavigation();

    if (this.windowWidth < 992) {
      setTimeout(() => {
        document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
        const navPs = document.querySelector('#nav-ps-gradient-able') as HTMLElement;
        if (navPs) {
          navPs.style.height = '100%';
        }
      }, 500);
    }
  }

  /**
   * Appelle l'API MenuItemController pour obtenir les menus du rôle actuel
   */
  loadDynamicNavigation() {
  const token = localStorage.getItem('token');
  
  // Si pas de token, on attend un peu (cas du login immédiat)
  if (!token) {
    setTimeout(() => this.loadDynamicNavigation(), 500);
    return;
  }

  this.adminService.getAuthorizedMenus().subscribe({
    next: (menuDTOs) => {
      if (!menuDTOs || menuDTOs.length === 0) {
        console.warn("Aucun menu reçu du serveur.");
        return;
      }
      
      const dynamicGroup: NavigationItem = {
        id: 'navigation',
        title: 'Mon Projet',
        type: 'group',
        icon: 'icon-navigation',
        children: menuDTOs.map(m => ({
          id: `menu-${m.menuItemId}`,
          title: m.label,
          type: 'item',
          url: m.link,
          icon: m.icon || 'feather icon-circle',
          classes: 'nav-item'
        }))
      };
      
      this.navigation = [dynamicGroup];
    },
    error: (err) => {
      console.error('Erreur lors du chargement du menu dynamique:', err);
      // Optionnel : rediriger vers login si c'est une 403 persistante
    }
  });
}

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.NavMobCollapse.emit();
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}