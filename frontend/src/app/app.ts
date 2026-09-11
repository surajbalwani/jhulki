import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { getApiUrl } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="app-root-container">
      <app-navbar></app-navbar>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Luxury Footer -->
      <footer class="luxury-footer">
        <div class="footer-container">
          <div class="footer-col">
            <span class="footer-brand font-serif">JHULKI</span>
            <p class="footer-tagline">Exquisite tailoring & haute couture for the discerning connoisseur.</p>
          </div>

          <div class="footer-col">
            <h4 class="footer-title font-serif">ATELIER COLLECTIONS</h4>
            <a routerLink="/products" [queryParams]="{category: 'men'}">Men's Atelier</a>
            <a routerLink="/products" [queryParams]="{category: 'women'}">Women's Runway</a>
            <a routerLink="/products" [queryParams]="{category: 'accessories'}">Fine Accessories</a>
            <a routerLink="/products" [queryParams]="{category: 'chaniya-choli'}">Chaniya Choli</a>
            <a routerLink="/products" [queryParams]="{category: 'kurta'}">Kurta Sets</a>
          </div>

          <div class="footer-col">
            <h4 class="footer-title font-serif">CLIENT CONCIERGE</h4>
            <a routerLink="/profile">My Account & Addresses</a>
            <a routerLink="/cart">Shopping Bag</a>
            <a routerLink="/wishlist">Saved Wishlist</a>
            <a routerLink="/auth">Sign In / Register</a>
            <button (click)="openApiModal()" class="api-config-link">⚡ Config API Endpoint</button>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-security-strip mb-2">
            <span class="security-badge">🔒 256-BIT SSL ENCRYPTED & HTTPS SECURED PAYMENT GATEWAY</span>
          </div>
          <span>&copy; 2026 JHULKI HAUTE COUTURE PRIVATE LIMITED. ALL RIGHTS RESERVED. (REGISTERED ENTITY)</span>
        </div>
      </footer>

      <!-- API Configuration Modal -->
      <div class="modal-backdrop" *ngIf="showApiModal()">
        <div class="modal-card glass-card">
          <div class="modal-header">
            <h3 class="font-serif gold-text">Vercel Backend API Configuration</h3>
            <button (click)="showApiModal.set(false)" class="close-btn">&times;</button>
          </div>
          <p style="font-size:0.85rem; color:#aaa; margin:12px 0;">
            Current Active API URL: <strong class="gold-text">{{ currentApiUrl() }}</strong>
          </p>
          <div class="form-group">
            <label style="font-size:0.75rem; color:#ccc;">Enter Next.js Vercel Backend URL</label>
            <input 
              type="text" 
              [(ngModel)]="inputApiUrl" 
              placeholder="https://your-backend.vercel.app/api" 
              style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:4px; margin-top:6px;" 
            />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
            <button (click)="showApiModal.set(false)" class="luxury-btn-outline" style="padding:8px 16px;">Cancel</button>
            <button (click)="saveApiUrl()" class="luxury-btn-primary" style="padding:8px 16px;">Save & Reload</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-root-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-bg-dark);
    }

    .main-content {
      flex: 1;
    }

    .luxury-footer {
      background: #08080a;
      border-top: 1px solid var(--color-border-subtle);
      padding: 60px 24px 30px;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1300px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 50px;
    }

    .footer-brand {
      font-size: 2rem;
      letter-spacing: 0.3em;
      color: var(--color-gold-light);
      display: block;
      margin-bottom: 12px;
    }

    .footer-tagline {
      color: #777788;
      font-size: 0.9rem;
      max-width: 320px;
    }

    .footer-title {
      font-size: 1.1rem;
      color: #fff;
      margin-bottom: 16px;
      letter-spacing: 0.05em;
    }

    .footer-col a, .api-config-link {
      display: block;
      color: #9a9ab0;
      font-size: 0.85rem;
      margin-bottom: 10px;
      transition: var(--transition-smooth);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-align: left;
    }

    .footer-col a:hover, .api-config-link:hover {
      color: var(--color-gold-primary);
    }

    .footer-bottom {
      max-width: 1300px;
      margin: 40px auto 0;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
      text-align: center;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: #555;
    }

    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      width: 90%;
      max-width: 500px;
      padding: 24px;
      background: #0d0d12;
      border: 1px solid var(--color-border-glow);
      border-radius: 8px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }
  `]
})
export class App {
  showApiModal = signal(false);
  currentApiUrl = signal(getApiUrl());
  inputApiUrl = getApiUrl();

  openApiModal() {
    this.currentApiUrl.set(getApiUrl());
    this.inputApiUrl = getApiUrl();
    this.showApiModal.set(true);
  }

  saveApiUrl() {
    if (this.inputApiUrl.trim()) {
      localStorage.setItem('jhulki_api_url', this.inputApiUrl.trim());
      window.location.reload();
    }
  }
}
