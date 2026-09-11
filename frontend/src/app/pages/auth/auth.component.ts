import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Alert } from '../../utils/alert.utils';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="badge-gold">JHULKI ATELIER</span>
          <h1 class="font-serif auth-title">{{ isLoginMode() ? 'Sign In' : 'Create Account' }}</h1>
          <p class="auth-sub">Access your haute couture orders, wishlist, and exclusive concierge services.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form mt-4">
          <div class="form-group" *ngIf="!isLoginMode()">
            <label>FULL NAME</label>
            <input type="text" [(ngModel)]="fullName" name="fullName" placeholder="e.g. Sophia Laurent" required />
          </div>

          <div class="form-group mt-3">
            <label>EMAIL ADDRESS</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="client@jhulki.com" required />
          </div>

          <div class="form-group mt-3">
            <label>PASSWORD</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>

          <div class="form-group mt-3" *ngIf="!isLoginMode()">
            <label>ACCOUNT TYPE</label>
            <select [(ngModel)]="role" name="role">
              <option value="CUSTOMER">Customer / Shopper</option>
              <option value="ADMIN">Admin Portal Access</option>
            </select>
          </div>

          <button type="submit" [disabled]="loading()" class="luxury-btn-primary submit-btn mt-4">
            {{ loading() ? 'AUTHENTICATING...' : (isLoginMode() ? 'SIGN IN' : 'CREATE CLIENT ACCOUNT') }}
          </button>
        </form>

        <div class="auth-footer mt-4">
          <button (click)="toggleMode()" class="toggle-mode-btn">
            {{ isLoginMode() ? "Don't have an account? Sign up" : 'Already registered? Sign in' }}
          </button>
        </div>

        <!-- Demo Accounts Helper -->
        <div class="demo-box glass-card mt-4">
          <p class="demo-title">DEMO CONCIERGE CREDS:</p>
          <div class="demo-item">
            <span>Admin:</span> <code>admin@jhulki.com</code> / <code>AdminPass123!</code>
          </div>
          <div class="demo-item">
            <span>Customer:</span> <code>client@jhulki.com</code> / <code>CustomerPass123!</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 40px;
    }

    .auth-header {
      text-align: center;
    }

    .auth-title {
      font-size: 2.4rem;
      color: #fff;
      margin: 10px 0 6px;
    }

    .auth-sub {
      font-size: 0.85rem;
      color: #9a9ab0;
    }

    .form-group label {
      display: block;
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: #888;
      margin-bottom: 6px;
    }

    .form-group input, .form-group select {
      width: 100%;
      background: #000;
      border: 1px solid var(--color-border-subtle);
      color: #fff;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 0.9rem;
      outline: none;
    }

    .form-group input:focus {
      border-color: var(--color-gold-primary);
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
    }

    .auth-footer {
      text-align: center;
    }

    .toggle-mode-btn {
      color: var(--color-gold-light);
      font-size: 0.8rem;
      text-decoration: underline;
    }

    .demo-box {
      padding: 14px;
      background: rgba(0,0,0,0.5);
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .demo-title {
      color: var(--color-gold-primary);
      font-weight: 600;
      margin-bottom: 4px;
      letter-spacing: 0.1em;
    }

    .demo-item {
      color: #aaa;
      margin-top: 2px;
    }

    .demo-item code {
      color: #fff;
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 2px;
    }
  `]
})
export class AuthComponent {
  isLoginMode = signal(true);
  loading = signal(false);

  email = '';
  password = '';
  fullName = '';
  role = 'CUSTOMER';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode.update(v => !v);
  }

  onSubmit() {
    if (!this.email || !this.password) {
      Alert.warning('Required Fields Missing', 'Please fill in email and password.');
      return;
    }

    this.loading.set(true);

    if (this.isLoginMode()) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.loading.set(false);
          Alert.success('Welcome Back', `Welcome back, ${res.user.fullName}!`);
          if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          Alert.error('Authentication Failed', err?.error?.error || 'Invalid credentials. Please try again.');
        }
      });
    } else {
      if (!this.fullName) {
        Alert.warning('Required Field', 'Please enter your full name.');
        this.loading.set(false);
        return;
      }
      this.authService.signup({
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        role: this.role
      }).subscribe({
        next: (res) => {
          this.loading.set(false);
          Alert.success('Account Created', `Account created successfully for ${res.user.fullName}!`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading.set(false);
          Alert.error('Registration Failed', err?.error?.error || 'Signup failed');
        }
      });
    }
  }
}
