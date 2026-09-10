import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/ecommerce.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <!-- Hero Runway Section -->
      <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="badge-gold mb-3">AUTUMN / WINTER 2026 COLLECTION</span>
          <h1 class="hero-title gold-gradient-text">TIMLESS ELEGANCE & HAUTE COUTURE</h1>
          <p class="hero-subtitle">Discover handcrafted luxury garments engineered with silk, cashmere, and fine Italian leather.</p>
          <div class="hero-actions mt-4">
            <a routerLink="/products" [queryParams]="{category: 'all'}" class="luxury-btn-primary">
              EXPLORE COLLECTION
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'women'}" class="luxury-btn-outline">
              VIEW RUNWAY
            </a>
          </div>
        </div>
      </section>

      <!-- Category Spotlight Grid -->
      <section class="category-grid-section">
        <div class="section-header">
          <span class="subtitle">ATELIER CATEGORIES</span>
          <h2 class="title font-serif">Curated Masterpieces</h2>
        </div>
        <div class="categories-container">
          <a routerLink="/products" [queryParams]="{category: 'men'}" class="category-card">
            <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800" alt="Men's Collection">
            <div class="card-overlay">
              <span class="cat-subtitle">ATELIER</span>
              <h3 class="cat-title">Men's Suits & Outerwear</h3>
            </div>
          </a>

          <a routerLink="/products" [queryParams]="{category: 'women'}" class="category-card">
            <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800" alt="Women's Evening Gowns">
            <div class="card-overlay">
              <span class="cat-subtitle">HAUTE COUTURE</span>
              <h3 class="cat-title">Women's Evening Wear</h3>
            </div>
          </a>

          <a routerLink="/products" [queryParams]="{category: 'accessories'}" class="category-card">
            <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800" alt="Leather Accessories">
            <div class="card-overlay">
              <span class="cat-subtitle">LEATHER GOODS</span>
              <h3 class="cat-title">Fine Accessories & Bags</h3>
            </div>
          </a>
        </div>
      </section>

      <!-- Featured Luxury Products Carousel / Grid -->
      <section class="featured-products-section">
        <div class="section-header">
          <span class="subtitle">SELECTED PIECES</span>
          <h2 class="title font-serif">Featured Runway Arrivals</h2>
        </div>

        <div class="products-grid">
          <div *ngFor="let product of featuredProducts()" class="product-card glass-card">
            <div class="product-image-wrap">
              <img [src]="product.images[0]" [alt]="product.name" />
              <button 
                class="wishlist-btn" 
                (click)="toggleWishlist($event, product.id)"
                [class.active]="ecommerceService.isProductWishlisted(product.id)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            <div class="product-info">
              <span class="category-tag">{{ product.category?.name || 'COUTURE' }}</span>
              <a [routerLink]="['/product', product.id]" class="product-name font-serif">{{ product.name }}</a>
              <div class="product-price">
                <span class="current-price font-serif">\${{ product.salePrice || product.price }}</span>
                <span class="old-price" *ngIf="product.salePrice">\${{ product.price }}</span>
              </div>
              <a [routerLink]="['/product', product.id]" class="view-details-btn">
                VIEW DETAILS
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
    }

    .hero-section {
      position: relative;
      height: 85vh;
      min-height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 24px;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920') center/cover no-repeat;
      filter: brightness(0.4) saturate(1.2);
      transform: scale(1.05);
      transition: transform 10s ease;
    }

    .hero-section:hover .hero-bg {
      transform: scale(1);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(10,10,12,0.9) 100%);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 900px;
    }

    .hero-title {
      font-size: 3.5rem;
      line-height: 1.1;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: #b0b0c5;
      font-weight: 300;
      margin-bottom: 30px;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .section-header {
      text-align: center;
      margin: 60px 0 40px;
    }

    .section-header .subtitle {
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      color: var(--color-gold-primary);
      display: block;
      margin-bottom: 8px;
    }

    .section-header .title {
      font-size: 2.4rem;
      color: #fff;
    }

    .category-grid-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .categories-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .category-card {
      position: relative;
      height: 480px;
      border-radius: 4px;
      overflow: hidden;
      display: block;
    }

    .category-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .category-card:hover img {
      transform: scale(1.08);
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 60%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 32px;
    }

    .cat-subtitle {
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: var(--color-gold-light);
    }

    .cat-title {
      font-family: var(--font-serif);
      font-size: 1.8rem;
      color: #fff;
      margin-top: 4px;
    }

    .featured-products-section {
      max-width: 1400px;
      margin: 40px auto 100px;
      padding: 0 24px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 30px;
    }

    .product-card {
      position: relative;
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--box-shadow-luxury);
      border-color: var(--color-border-glow);
    }

    .product-image-wrap {
      position: relative;
      height: 380px;
      overflow: hidden;
      background: #111;
    }

    .product-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .product-card:hover .product-image-wrap img {
      transform: scale(1.05);
    }

    .wishlist-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0,0,0,0.6);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: var(--transition-smooth);
    }

    .wishlist-btn.active, .wishlist-btn:hover {
      background: var(--color-gold-primary);
      color: #000;
    }

    .product-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .category-tag {
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      color: var(--color-gold-light);
      text-transform: uppercase;

    }

    .product-name {
      font-size: 1.25rem;
      color: #fff;
      margin: 6px 0 10px;
    }

    .product-price {
      display: flex;
      gap: 12px;
      align-items: baseline;
      margin-bottom: 16px;
    }

    .current-price {
      font-size: 1.3rem;
      color: var(--color-gold-primary);
    }

    .old-price {
      font-size: 0.9rem;
      text-decoration: line-through;
      color: #666;
    }

    .view-details-btn {
      margin-top: auto;
      border: 1px solid rgba(255,255,255,0.15);
      color: #d0d0d0;
      text-align: center;
      padding: 10px;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      transition: var(--transition-smooth);
    }

    .view-details-btn:hover {
      border-color: var(--color-gold-primary);
      color: var(--color-gold-primary);
      background: rgba(212,175,55,0.05);
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.2rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);

  constructor(
    public ecommerceService: EcommerceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.ecommerceService.fetchProducts(undefined, undefined, undefined).subscribe(products => {
      this.featuredProducts.set(products.slice(0, 4));
    });
  }

  toggleWishlist(event: MouseEvent, productId: string) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    this.ecommerceService.toggleWishlist(productId).subscribe();
  }
}
