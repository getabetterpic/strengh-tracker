import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  loginError = '';
  showPassword = false;
  requiresMfa = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  private returnUrl = toSignal(
    this.route.queryParamMap.pipe(
      map((queryParams) => queryParams.get('returnUrl'))
    ),
    { initialValue: '/workouts' }
  );

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.router.navigate([this.returnUrl()]);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]], // Can be email or phone number
      password: ['', [Validators.required, Validators.minLength(6)]],
      otpCode: [''], // Hidden MFA field
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const { identifier, password, otpCode } = this.loginForm.value;

    if (this.requiresMfa && otpCode) {
      // Handle MFA verification
      this.authService.verifyMfa(otpCode).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loginError = error.message || 'MFA verification failed';
        },
      });
    } else {
      // Handle initial login
      this.authService.login(identifier, password).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.requiresMfa) {
            this.requiresMfa = true;
            // Show MFA field in the UI
          } else {
            this.router.navigate([this.returnUrl || 'workouts']);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loginError = error.message || 'Login failed';
        },
      });
    }
  }

  // Helper method to check if the identifier is an email or phone number
  isEmail(identifier: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  }
}
