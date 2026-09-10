import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent],
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
            <a routerLink="/products" [queryParams]="{category: 'accessories'}">Leather Goods</a>
            <a routerLink="/products" [queryParams]="{category: 'footwear'}">Footwear</a>
          </div>

          <div class="footer-col">
            <h4 class="footer-title font-serif">CLIENT CONCIERGE</h4>
            <a routerLink="/profile">My Account & Addresses</a>
            <a routerLink="/cart">Shopping Bag</a>
            <a routerLink="/wishlist">Saved Wishlist</a>
            <a routerLink="/auth">Sign In / Register</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; 2026 JHULKI HAUTE COUTURE. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
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

    .footer-col a {
      display: block;
      color: #9a9ab0;
      font-size: 0.85rem;
      margin-bottom: 10px;
      transition: var(--transition-smooth);
    }

    .footer-col a:hover {
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

    @media (max-width: 768px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }
  `]
})
export class App {}
