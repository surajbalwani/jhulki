import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EcommerceService } from '../../services/ecommerce.service';
import { Product } from '../../models/ecommerce.model';
import { Alert } from '../../utils/alert.utils';

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
            <span class="price">₹{{ ecommerceService.getEffectivePrice(prod) }}</span>
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
              <span>Complimentary Pan India express shipping & white-glove packaging</span>
            </div>
            <div class="perk-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span>10-Day complimentary returns, 15-Day Exchange & concierge styling services</span>
            </div>
          </div>

          <!-- Flexible Prepaid Payment & Dispatch Guarantee Widget -->
          <div class="prepaid-policy-card glass-card mt-4" *ngIf="product()">
            <div class="policy-header-row">
              <span class="policy-badge">PREPAID PAYMENT SCHEME</span>
              <span class="guarantee-tag">⚡ 2-DAY GUARANTEED DISPATCH</span>
            </div>
            
            <h3 class="policy-title font-serif mt-2">Pay 20% Advance & Rest Upon Dispatch</h3>
            <p class="policy-sub">
              Book your bespoke luxury piece today with just 20% advance. The remaining 80% is payable only when your product is quality verified and assigned a Delhivery AWB courier tracking number.
            </p>

            <div class="advance-breakdown-box mt-3">
              <div class="breakdown-col">
                <span class="col-label">PAY TODAY (20% ADVANCE)</span>
                <span class="col-val font-serif gold-text">₹{{ getAdvanceAmount() | number:'1.2-2' }}</span>
              </div>
              <div class="breakdown-divider"></div>
              <div class="breakdown-col">
                <span class="col-label">PAY UPON DISPATCH (80% BALANCE)</span>
                <span class="col-val font-serif">₹{{ getRemainingAmount() | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Guarantee Note -->
            <div class="guarantee-note-banner mt-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span><strong>2-Day Guarantee:</strong> Guaranteed dispatch within 2 business days. If not dispatched in 2 days, full refund of advance booking on instant cancellation.</span>
            </div>

            <!-- 5-Step Order Journey Flow -->
            <div class="journey-steps-container mt-4">
              <h4 class="journey-title font-serif">Transparent Order & Delivery Journey</h4>
              
              <div class="step-timeline mt-3">
                <div class="step-item">
                  <div class="step-num font-serif">1</div>
                  <div class="step-content">
                    <span class="step-heading">20% Advance Booking</span>
                    <span class="step-desc">Pay 20% booking charge (Non-refundable after dispatch, but 100% refundable if dispatch exceeds 2 days).</span>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-num font-serif">2</div>
                  <div class="step-content">
                    <span class="step-heading">Product Check & Quality Verification</span>
                    <span class="step-desc">Atelier team hand-inspects fabric, verifies availability & size, and attaches Jhulki brand security tag.</span>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-num font-serif">3</div>
                  <div class="step-content">
                    <span class="step-heading">Delhivery Express Dispatch</span>
                    <span class="step-desc">Handed over to Delhivery courier with express shipment booking and AWB number generation.</span>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-num font-serif">4</div>
                  <div class="step-content">
                    <span class="step-heading">Admin Portal AWB Update</span>
                    <span class="step-desc">AWB tracking code is updated into your client account portal by the admin team.</span>
                  </div>
                </div>

                <div class="step-item">
                  <div class="step-num font-serif">5</div>
                  <div class="step-content">
                    <span class="step-heading">Dispatch Notification & Balance Payment</span>
                    <span class="step-desc">Customer receives dispatch notification with AWB tracking — please pay remaining 80% balance within 24 hours.</span>
                  </div>
                </div>
              </div>
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

    /* Prepaid Policy & Journey Widget Styles */
    .prepaid-policy-card {
      padding: 24px;
      border: 1px solid rgba(212, 175, 55, 0.3);
      background: linear-gradient(135deg, rgba(13, 13, 17, 0.95), rgba(25, 25, 35, 0.95));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .policy-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .policy-badge {
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      color: #000;
      background: var(--color-gold-primary);
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 2px;
    }

    .guarantee-tag {
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      color: #55efc4;
      font-weight: 600;
    }

    .policy-title {
      font-size: 1.5rem;
      color: #fff;
      margin: 10px 0 6px;
    }

    .policy-sub {
      font-size: 0.85rem;
      color: #aaa;
      line-height: 1.5;
    }

    .advance-breakdown-box {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      padding: 14px;
      border-radius: 4px;
      text-align: center;
    }

    .breakdown-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .col-label {
      font-size: 0.6rem;
      letter-spacing: 0.15em;
      color: #888;
    }

    .col-val {
      font-size: 1.4rem;
      font-weight: 600;
    }

    .breakdown-divider {
      width: 1px;
      height: 35px;
      background: rgba(255, 255, 255, 0.1);
    }

    .guarantee-note-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(85, 239, 196, 0.08);
      border: 1px solid rgba(85, 239, 196, 0.3);
      color: #55efc4;
      font-size: 0.8rem;
      padding: 10px 14px;
      border-radius: 4px;
      line-height: 1.4;
    }

    .journey-title {
      font-size: 1.1rem;
      color: var(--color-gold-light);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 8px;
    }

    .step-timeline {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid var(--color-gold-primary);
      color: var(--color-gold-light);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .step-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .step-heading {
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
    }

    .step-desc {
      font-size: 0.75rem;
      color: #888;
      line-height: 1.4;
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
          if (p.category?.slug === 'chaniya-choli' || p.categoryId === 'chaniya-choli') {
            p.stock = [{ size: 'Free Size', quantity: 15 }];
          }
          this.product.set(p);
          if (p.images && p.images.length > 0) this.selectedImage.set(p.images[0]);
          if (p.stock && p.stock.length > 0) this.selectedSize.set(p.stock[0].size);
        });
      }
    });
  }

  getAdvanceAmount(): number {
    const p = this.product();
    if (!p) return 0;
    const price = this.ecommerceService.getEffectivePrice(p) * this.quantity();
    return Math.round(price * 0.20);
  }

  getRemainingAmount(): number {
    const p = this.product();
    if (!p) return 0;
    const price = this.ecommerceService.getEffectivePrice(p) * this.quantity();
    return price - this.getAdvanceAmount();
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
      Alert.info('Sign In Required', 'Please sign in to add items to your wishlist.');
      return;
    }
    this.ecommerceService.toggleWishlist(p.id).subscribe();
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    if (!this.authService.isLoggedIn()) {
      Alert.info('Sign In Required', 'Please sign in to add items to your shopping bag.').then(() => {
        this.router.navigate(['/auth']);
      });
      return;
    }

    if (!this.selectedSize()) {
      Alert.warning('Select Size', 'Please select a size first.');
      return;
    }

    this.ecommerceService.addToCart(p.id, this.selectedSize(), this.quantity()).subscribe({
      next: () => {
        Alert.success('Added to Shopping Bag', `${p.name} (Size: ${this.selectedSize()}) added to your shopping bag!`).then(() => {
          this.router.navigate(['/cart']);
        });
      },
      error: (err) => Alert.error('Add Failed', err?.error?.error || 'Failed to add to cart')
    });
  }
}
