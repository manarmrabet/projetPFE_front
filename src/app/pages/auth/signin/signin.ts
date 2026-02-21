import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Field, form, minLength, required } from '@angular/forms/signals';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, Field],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss']
})
export class SignInComponent {
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);
  isLoading = signal(false);

  // Modèle avec Username (chaîne) et Password
  loginModal = signal({
    username: '',
    password: ''
  });

  // Définition du formulaire
  loginForm = form(this.loginModal, (schemaPath) => {
    required(schemaPath.username, { message: 'Nom d\'utilisateur requis' });
    required(schemaPath.password, { message: 'Mot de passe requis' });
    minLength(schemaPath.password, 8, { message: '8 caractères minimum' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);

    const data = this.loginModal();

    // Vérification manuelle simple pour éviter l'erreur TS sur .valid()
    if (data.username.trim() !== '' && data.password.length >= 8) {
      this.isLoading.set(true);

      // Redirection vers dashboard-v1
      setTimeout(() => {
        this.router.navigate(['/dashboard-v1']).then(() => {
          this.isLoading.set(false);
        });
      }, 1000);
    } else {
      this.error.set('Veuillez remplir correctement les champs.');
    }

    this.cd.detectChanges();
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
