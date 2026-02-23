import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Field, form, required } from '@angular/forms/signals';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth';

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
  private authService = inject(AuthService);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);
  isLoading = signal(false);

  loginModal = signal({
    username: '',
    password: ''
  });

  loginForm = form(this.loginModal, (schemaPath) => {
    required(schemaPath.username, { message: 'Nom d\'utilisateur requis' });
    required(schemaPath.password, { message: 'Mot de passe requis' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    this.error.set('');

    const data = this.loginModal();

    // Validation basique avant envoi
    if (data.username.trim() !== '' && data.password.trim() !== '') {
      this.isLoading.set(true);

      this.authService.login(data).subscribe({
        next: () => {
          this.isLoading.set(false);

          /**

           * Plus besoin de vérifier les rôles, redirection directe vers le dashboard unique.
           * Le AuthGuard s'occupera de protéger les routes spécifiques par la suite.
           */
          this.router.navigate(['/dashboard-v1']);
        },
        error: (backendError) => {
          this.isLoading.set(false);

          if (backendError.status === 401) {
            this.error.set('Identifiants incorrects.');
          } else {
            this.error.set('Utilisateur non enregistré ou erreur serveur.');
          }

          this.cd.detectChanges();
        }
      });
    } else {
      this.error.set('Veuillez remplir correctement les champs.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
