import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading = false;
  errorMessage = '';

  readonly demoUsers = [
    'admin@abastifarma.pe / Admin123*',
    'operaciones@abastifarma.pe / Admin123*',
    'almacen@abastifarma.pe / Admin123*',
    'botica.lima@abastifarma.pe / Admin123*',
    'botica.arequipa@abastifarma.pe / Admin123*'
  ];

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.getRawValue();

    this.authService
      .login(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (user) => {
          this.notificationService.show(`Bienvenido, ${user.nombreCompleto}.`, 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }
}
