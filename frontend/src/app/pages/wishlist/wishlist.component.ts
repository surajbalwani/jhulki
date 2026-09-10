import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { WishlistItem } from '../../models/ecommerce.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wishlist-page">
      <div class="header-banner">
        <span class="badge-gold">MY SAVED PIECES</span>
        <h1 class="font-serif page-title">Wishlist & Favorites</h1>
      </div>

      <div *ngIf="ecommerceService.wishlistItems().length > 0; else emptyWishlist" class="products-grid">
        <div *ngFor="let item of ecommerceService.wishlistItems()" class="product-card glass-card">
          <div class="product-image-wrap">
            <img [src]="item.product.images[0]" [alt]="item.product.name" />
            <button class="remove-btn" (click)="removeWishlist(item.productId)" title="Remove item">
              &times;
            </button>
          </div>
          <div class="product-info">
            <span class="category-tag">{{ item.product.category?.name }}</span>
            <a [routerLink]="['/product', item.productId]" class="product-name font-serif">{{ item.product.name }}</a>
            <div class="product-price font-serif">
              \${{ item.product.salePrice || item.product.price }}
            </div>
            <a [routerLink]="['/product', item.productId]" class="luxury-btn-primary add-bag-btn">
              VIEW & SELECT SIZE
            </a>
          </div>
        </div>
      </div>

      <ng-template #emptyWishlist>
        <div class="empty-wishlist glass-card">
          <h2 class="font-serif">Your Wishlist is Empty</h2>
          <p>Save your favorite haute couture garments and accessories to review later.</p>
          <a routerLink="/products" class="luxury-btn-primary mt-4">DISCOVER COLLECTIONS</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .wishlist-page {
      max-width: 1300px;
      margin: 0 auto;
      padding: 40px 24px 100px;
    }

    .header-banner {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-title {
      font-size: 2.8rem;
      color: #fff;
      margin-top: 8px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 30px;
    }

    .product-card {
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }

    .product-image-wrap {
      position: relative;
      height: 360px;
      overflow: hidden;
    }

    .product-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
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
    }

    .product-name {
      font-size: 1.2rem;
      color: #fff;
      margin: 6px 0;
    }

    .product-price {
      font-size: 1.4rem;
      color: var(--color-gold-primary);
      margin-bottom: 16px;
    }

    .add-bag-btn {
      margin-top: auto;
      font-size: 0.75rem;
      padding: 12px;
    }

    .empty-wishlist {
      text-align: center;
      padding: 80px 24px;
    }

    .empty-wishlist h2 {
      font-size: 2.2rem;
      color: var(--color-gold-light);
    }
  `]
})
export class WishlistComponent implements OnInit {
  constructor(
    public ecommerceService: EcommerceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.ecommerceService.fetchWishlist().subscribe();
    }
  }

  removeWishlist(productId: string) {
    this.ecommerceService.toggleWishlist(productId).subscribe();
  }
}
