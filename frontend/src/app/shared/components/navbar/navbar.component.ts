import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EcommerceService } from '../../../services/ecommerce.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top Bar Notice -->
    <div class="luxury-topbar">
      <span>COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER ₹5,000</span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="luxury-header">
      <div class="header-container">
        <!-- Mobile Sidebar Toggle -->
        <button class="icon-btn mobile-menu-btn" (click)="toggleSidebar()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>

        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo">
          <span class="logo-title">JHULKI</span>
          <span class="logo-subtitle">HAUTE COUTURE</span>
        </a>

        <!-- Desktop Navigation Categories -->
        <nav class="desktop-nav">
          <a routerLink="/products" [queryParams]="{category: 'all'}" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">ALL COLLECTIONS</a>
          <!-- MEN Dropdown (Kurta, Suits & Outerwear) -->
          <div class="nav-dropdown-wrap">
            <a routerLink="/products" [queryParams]="{category: 'men'}" routerLinkActive="active" class="dropdown-trigger">
              MEN
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>
            <div class="luxury-dropdown-menu">
              <a routerLink="/products" [queryParams]="{category: 'men'}" routerLinkActive="active">ALL MEN'S</a>
              <a routerLink="/products" [queryParams]="{category: 'kurta'}" routerLinkActive="active">HAUTE KURTA SETS</a>
            </div>
          </div>
          
          <!-- WOMEN Dropdown (Chaniya Choli & Blouse) -->
          <div class="nav-dropdown-wrap">
            <a routerLink="/products" [queryParams]="{category: 'women'}" routerLinkActive="active" class="dropdown-trigger">
              WOMEN
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>
            <div class="luxury-dropdown-menu">
              <a routerLink="/products" [queryParams]="{category: 'women'}" routerLinkActive="active">ALL WOMEN'S</a>
              <a routerLink="/products" [queryParams]="{category: 'chaniya-choli'}" routerLinkActive="active">CHANIYA CHOLI</a>
              <a routerLink="/products" [queryParams]="{category: 'blouse'}" routerLinkActive="active">BLOUSE & CORSETS</a>
            </div>
          </div>

          <a routerLink="/products" [queryParams]="{category: 'accessories'}" routerLinkActive="active">ACCESSORIES</a>
          
          <!-- MORE Dropdown (Kids & Couple) -->
          <div class="nav-dropdown-wrap">
            <span class="dropdown-trigger">
              MORE
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
            <div class="luxury-dropdown-menu">
              <a routerLink="/products" [queryParams]="{category: 'kids'}" routerLinkActive="active">KIDS ATELIER</a>
              <a routerLink="/products" [queryParams]="{category: 'couple'}" routerLinkActive="active">COUPLE SETS</a>
            </div>
          </div>
        </nav>

        <!-- Action Icons & Profile -->
        <div class="header-actions">
          <!-- Search Bar Input Toggle -->
          <div class="search-box" [class.expanded]="searchActive()">
            <input 
              type="text" 
              placeholder="Search luxury pieces..." 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="onSearch()"
            />
            <button class="icon-btn" (click)="toggleSearch()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <!-- Wishlist -->
          <a routerLink="/wishlist" class="icon-btn position-relative" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="badge" *ngIf="ecommerceService.wishlistItems().length > 0">
              {{ ecommerceService.wishlistItems().length }}
            </span>
          </a>

          <!-- Cart Drawer / Link -->
          <a routerLink="/cart" class="icon-btn position-relative" title="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="badge" *ngIf="ecommerceService.cartItems().length > 0">
              {{ ecommerceService.cartItems().length }}
            </span>
          </a>

          <!-- Admin Link -->
          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="admin-chip">
            ADMIN PORTAL
          </a>

          <!-- Profile / Auth -->
          <a *ngIf="authService.isLoggedIn()" routerLink="/profile" class="icon-btn" title="Account Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </a>

          <a *ngIf="!authService.isLoggedIn()" routerLink="/auth" class="luxury-btn-outline nav-login-btn">
            SIGN IN
          </a>
        </div>
      </div>
    </header>

    <!-- Category Sidebar Drawer (Mobile & Desktop Overlay) -->
    <div class="sidebar-backdrop" [class.open]="sidebarOpen()" (click)="toggleSidebar()"></div>
    <aside class="luxury-sidebar" [class.open]="sidebarOpen()">
      <div class="sidebar-header">
        <span class="sidebar-title">CATEGORIES & SECTIONS</span>
        <button class="icon-btn" (click)="toggleSidebar()">&times;</button>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-group">
          <label>COLLECTIONS</label>
          <a routerLink="/products" [queryParams]="{category: 'all'}" (click)="toggleSidebar()">All Haute Couture</a>
          <a routerLink="/products" [queryParams]="{category: 'men'}" (click)="toggleSidebar()">Men's Atelier</a>
          <a routerLink="/products" [queryParams]="{category: 'women'}" (click)="toggleSidebar()">Women's Runway</a>
          <a routerLink="/products" [queryParams]="{category: 'accessories'}" (click)="toggleSidebar()">Fine Accessories</a>
          <a routerLink="/products" [queryParams]="{category: 'kids'}" (click)="toggleSidebar()">Kids' Atelier</a>
          <a routerLink="/products" [queryParams]="{category: 'couple'}" (click)="toggleSidebar()">Couple Sets</a>
        </div>

        <div class="sidebar-group mt-4" *ngIf="authService.isLoggedIn()">
          <label>MY ACCOUNT</label>
          <a routerLink="/profile" (click)="toggleSidebar()">Profile & Addresses</a>
          <a routerLink="/wishlist" (click)="toggleSidebar()">Wishlist</a>
          <a routerLink="/cart" (click)="toggleSidebar()">Shopping Bag</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="toggleSidebar()" class="gold-text">Admin Dashboard</a>
          <button (click)="logout(); toggleSidebar()" class="logout-btn">Sign Out</button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .luxury-topbar {
      background: #000;
      border-bottom: 1px solid rgba(212,175,55,0.2);
      color: #d4af37;
      text-align: center;
      padding: 6px 16px;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .luxury-header {
      background: rgba(10, 10, 12, 0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
    }

    .logo-title {
      font-family: var(--font-serif);
      font-size: 1.8rem;
      letter-spacing: 0.35em;
      font-weight: 700;
      color: #fff;
    }

    .logo-subtitle {
      font-size: 0.55rem;
      letter-spacing: 0.5em;
      color: var(--color-gold-primary);
      margin-top: 2px;
    }

    .desktop-nav {
      display: flex;
      gap: 32px;
    }

    .desktop-nav a {
      font-size: 0.75rem;
      letter-spacing: 0.18em;
      font-weight: 500;
      color: #a0a0b5;
      transition: var(--transition-smooth);
      padding-bottom: 4px;
    }

    .desktop-nav a:hover, .desktop-nav a.active {
      color: var(--color-gold-light);
      border-bottom: 1px solid var(--color-gold-primary);
    }

    .nav-dropdown-wrap {
      position: relative;
      display: inline-block;
    }

    .dropdown-trigger {
      font-size: 0.75rem;
      letter-spacing: 0.18em;
      font-weight: 500;
      color: #a0a0b5;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding-bottom: 4px;
      transition: var(--transition-smooth);
    }

    .nav-dropdown-wrap:hover .dropdown-trigger {
      color: var(--color-gold-light);
    }

    .luxury-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 170px;
      background: #0d0d11;
      border: 1px solid var(--color-border-glow);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      padding: 10px 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: var(--transition-smooth);
      z-index: 150;
    }

    .nav-dropdown-wrap:hover .luxury-dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .luxury-dropdown-menu a {
      display: block;
      padding: 8px 18px;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      color: #ccc;
      border-bottom: none;
    }

    .luxury-dropdown-menu a:hover {
      background: rgba(212, 175, 55, 0.1);
      color: var(--color-gold-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .icon-btn {
      color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      transition: var(--transition-smooth);
    }

    .icon-btn:hover {
      color: var(--color-gold-primary);
      transform: translateY(-1px);
    }

    .position-relative {
      position: relative;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--color-gold-primary);
      color: #000;
      font-size: 0.6rem;
      font-weight: 700;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-chip {
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid var(--color-gold-primary);
      color: var(--color-gold-light);
      padding: 5px 12px;
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      border-radius: 2px;
      font-weight: 600;
    }

    .nav-login-btn {
      padding: 6px 16px;
      font-size: 0.7rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid transparent;
      border-radius: 20px;
      padding: 2px 8px;
      transition: var(--transition-smooth);
    }

    .search-box.expanded {
      border-color: var(--color-border-glow);
      background: rgba(0,0,0,0.4);
    }

    .search-box input {
      border: none;
      background: none;
      color: #fff;
      font-size: 0.8rem;
      outline: none;
      width: 0;
      transition: var(--transition-smooth);
    }

    .search-box.expanded input {
      width: 140px;
      padding-left: 8px;
    }

    .mobile-menu-btn {
      display: none;
    }

    /* Sidebar Drawer Styles */
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      transition: var(--transition-smooth);
    }
    .sidebar-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .luxury-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 320px;
      background: #0d0d11;
      border-right: 1px solid var(--color-border-subtle);
      z-index: 201;
      transform: translateX(-100%);
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }
    .luxury-sidebar.open {
      transform: translateX(0);
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-title {
      font-size: 0.7rem;
      letter-spacing: 0.25em;
      color: var(--color-gold-light);
      font-weight: 600;
    }

    .sidebar-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sidebar-group label {
      display: block;
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: #666;
      margin-bottom: 12px;
    }

    .sidebar-group a, .logout-btn {
      display: block;
      padding: 10px 0;
      color: #ccc;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .sidebar-group a:hover {
      color: var(--color-gold-primary);
    }

    .logout-btn {
      width: 100%;
      text-align: left;
      color: #ff6b6b;
      margin-top: 8px;
    }

    @media (max-width: 900px) {
      .desktop-nav { display: none; }
      .mobile-menu-btn { display: flex; }
    }
  `]
})
export class NavbarComponent {
  searchActive = signal(false);
  sidebarOpen = signal(false);
  searchQuery = '';

  constructor(
    public authService: AuthService,
    public ecommerceService: EcommerceService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.ecommerceService.fetchCart().subscribe();
      this.ecommerceService.fetchWishlist().subscribe();
    }
  }

  toggleSearch() {
    this.searchActive.update(v => !v);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
    }
  }

  logout() {
    this.authService.logout();
  }
}
