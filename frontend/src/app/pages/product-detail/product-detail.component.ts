import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/ecommerce.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-detail-page" *ngIf="product()">
      <div class="detail-container">
        <!-- Gallery Images -->
        <div class="gallery-section">
          <div class="main-image-wrap glass-card">
            <img [src]="selectedImage()" [alt]="product()?.name" />
          </div>
          <div class="thumbnails-grid" *ngIf="product()?.images && product()!.images.length > 1">
            <button 
              *ngFor="let img of product()!.images" 
              (click)="selectedImage.set(img)"
              [class.active]="selectedImage() === img"
              class="thumb-btn"
            >
              <img [src]="img" alt="Thumbnail" />
            </button>
          </div>
        </div>

        <!-- Product Information & Order Actions -->
        <div class="info-section">
          <div class="header-tags">
            <span class="badge-gold">{{ product()?.category?.name }}</span>
            <span class="stock-badge" *ngIf="isAvailableInSelectedSize()">IN STOCK</span>
          </div>

          <h1 class="product-title font-serif">{{ product()?.name }}</h1>

          <div class="price-bar" *ngIf="product() as prod">
            <span class="price font-serif">₹{{ ecommerceService.getEffectivePrice(prod) }}</span>
            <span class="old-price" *ngIf="ecommerceService.isSaleActive(prod)">₹{{ prod.price }}</span>
            <span class="badge-gold ml-2" *ngIf="ecommerceService.isSaleActive(prod)" style="background:#d4af37; color:#000; font-weight:700; padding:4px 10px; border-radius:2px;">
              {{ ecommerceService.getSaleCountdownLabel(prod) }}
            </span>
          </div>

          <p class="description">{{ product()?.description }}</p>

          <!-- Size Selector -->
          <div class="size-picker mt-4">
            <div class="size-header">
              <label>SELECT SIZE:</label>
              <span class="size-guide">SIZE & FIT GUIDE</span>
            </div>
            <div class="size-options">
              <button 
                *ngFor="let s of product()?.stock" 
                (click)="selectedSize.set(s.size)"
                [class.selected]="selectedSize() === s.size"
                [class.out-of-stock]="s.quantity === 0"
                [disabled]="s.quantity === 0"
                class="size-btn"
              >
                {{ s.size }}
                <span class="stock-count" *ngIf="s.quantity > 0 && s.quantity <= 5">({{ s.quantity }} left)</span>
              </button>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="quantity-picker mt-4">
            <label>QUANTITY:</label>
            <div class="quantity-controls">
              <button (click)="decreaseQty()">-</button>
              <span>{{ quantity() }}</span>
              <button (click)="increaseQty()">+</button>
            </div>
          </div>

          <!-- Add to Cart & Wishlist Actions -->
          <div class="action-buttons mt-5">
            <button (click)="addToCart()" class="luxury-btn-primary add-cart-btn">
              ADD TO SHOPPING BAG
            </button>

            <button (click)="toggleWishlist()" class="luxury-btn-outline wishlist-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isWishlisted() ? '#d4af37' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <!-- Luxury Services Highlights -->
          <div class="luxury-perks glass-card mt-5">
            <div class="perk-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span>Complimentary worldwide express shipping & white-glove packaging</span>
            </div>
            <div class="perk-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span>30-Day complimentary returns & concierge styling services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page {
      max-width: 1300px;
      margin: 0 auto;
      padding: 60px 24px 100px;
    }

    .detail-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .main-image-wrap {
      height: 600px;
      overflow: hidden;
      border-radius: 4px;
    }

    .main-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnails-grid {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }

    .thumb-btn {
      width: 80px;
      height: 80px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
      transition: var(--transition-smooth);
    }

    .thumb-btn.active, .thumb-btn:hover {
      border-color: var(--color-gold-primary);
    }

    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-tags {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .stock-badge {
      color: #55efc4;
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      font-weight: 600;
    }

    .product-title {
      font-size: 2.8rem;
      color: #fff;
      margin: 16px 0;
    }

    .price-bar {
      display: flex;
      gap: 16px;
      align-items: baseline;
      margin-bottom: 24px;
    }

    .price {
      font-size: 2.2rem;
      color: var(--color-gold-primary);
    }

    .old-price {
      font-size: 1.2rem;
      text-decoration: line-through;
      color: #666;
    }

    .description {
      color: #b0b0c5;
      font-size: 1.05rem;
      line-height: 1.8;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 20px 0;
    }

    .size-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .size-header label, .quantity-picker label {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      color: #888;
    }

    .size-guide {
      font-size: 0.7rem;
      color: var(--color-gold-light);
      cursor: pointer;
      text-decoration: underline;
    }

    .size-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .size-btn {
      padding: 12px 20px;
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      border-radius: 2px;
      transition: var(--transition-smooth);
      position: relative;
    }

    .size-btn.selected {
      border-color: var(--color-gold-primary);
      background: rgba(212,175,55,0.15);
      color: var(--color-gold-light);
    }

    .size-btn.out-of-stock {
      opacity: 0.4;
      text-decoration: line-through;
      cursor: not-allowed;
    }

    .stock-count {
      font-size: 0.6rem;
      color: #ffaa00;
      margin-left: 4px;
    }

    .quantity-controls {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 2px;
      margin-left: 16px;
    }

    .quantity-controls button {
      padding: 8px 16px;
      color: #fff;
      font-size: 1.1rem;
    }

    .quantity-controls span {
      padding: 0 16px;
      color: var(--color-gold-primary);
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
    }

    .add-cart-btn {
      flex-grow: 1;
      padding: 16px;
      font-size: 0.9rem;
    }

    .wishlist-action-btn {
      padding: 16px;
    }

    .luxury-perks {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .perk-item {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #9a9ab0;
      font-size: 0.85rem;
    }

    @media (max-width: 900px) {
      .detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal<number>(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ecommerceService: EcommerceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.ecommerceService.getProduct(id).subscribe(p => {
          this.product.set(p);
          if (p.images && p.images.length > 0) this.selectedImage.set(p.images[0]);
          if (p.stock && p.stock.length > 0) this.selectedSize.set(p.stock[0].size);
        });
      }
    });
  }

  isAvailableInSelectedSize(): boolean {
    const p = this.product();
    if (!p || !p.stock) return false;
    const stockItem = p.stock.find(s => s.size === this.selectedSize());
    return stockItem ? stockItem.quantity > 0 : false;
  }

  increaseQty() {
    this.quantity.update(q => q + 1);
  }

  decreaseQty() {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  isWishlisted(): boolean {
    const p = this.product();
    return p ? this.ecommerceService.isProductWishlisted(p.id) : false;
  }

  toggleWishlist() {
    const p = this.product();
    if (!p) return;
    if (!this.authService.isLoggedIn()) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    this.ecommerceService.toggleWishlist(p.id).subscribe();
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    if (!this.authService.isLoggedIn()) {
      alert('Please sign in to add items to your shopping bag.');
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.selectedSize()) {
      alert('Please select a size first.');
      return;
    }

    this.ecommerceService.addToCart(p.id, this.selectedSize(), this.quantity()).subscribe({
      next: () => {
        alert(`${p.name} (Size: ${this.selectedSize()}) added to your shopping bag!`);
        this.router.navigate(['/cart']);
      },
      error: (err) => alert(err?.error?.error || 'Failed to add to cart')
    });
  }
}
