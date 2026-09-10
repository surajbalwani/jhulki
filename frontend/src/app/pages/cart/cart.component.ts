import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/ecommerce.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <div class="header-banner">
        <span class="badge-gold">HAUTE SHOPPING BAG</span>
        <h1 class="font-serif page-title">Your Selected Pieces</h1>
      </div>

      <div *ngIf="ecommerceService.cartItems().length > 0; else emptyCart" class="cart-layout">
        <!-- Cart Items List -->
        <div class="items-list">
          <div *ngFor="let item of ecommerceService.cartItems()" class="cart-item-card glass-card">
            <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-img" />
            <div class="item-details">
              <span class="category">{{ item.product.category?.name }}</span>
              <h3 class="name font-serif">{{ item.product.name }}</h3>
              <p class="size-info">Selected Size: <strong>{{ item.size }}</strong></p>
              <div class="price font-serif">\${{ item.product.salePrice || item.product.price }}</div>
            </div>

            <div class="item-qty">
              <span>Qty: {{ item.quantity }}</span>
            </div>

            <button (click)="removeItem(item.id)" class="remove-btn" title="Remove item">
              &times;
            </button>
          </div>
        </div>

        <!-- Order Summary & Checkout Panel -->
        <div class="summary-panel glass-card">
          <h2 class="font-serif summary-title">Order Summary</h2>

          <div class="summary-row">
            <span>Subtotal</span>
            <span class="font-serif">\${{ calculateSubtotal() }}</span>
          </div>

          <div class="summary-row">
            <span>Complimentary Express Shipping</span>
            <span class="gold-text">FREE</span>
          </div>

          <div class="summary-row total-row">
            <span>Estimated Total</span>
            <span class="total-price font-serif">\${{ calculateSubtotal() }}</span>
          </div>

          <!-- Address Picker for Checkout -->
          <div class="address-section mt-4">
            <label>DELIVERY ADDRESS:</label>
            <select [(ngModel)]="selectedAddressId" class="address-select mt-2">
              <option value="" disabled selected>Select Shipping Address</option>
              <option *ngFor="let addr of addresses()" [value]="addr.id">
                {{ addr.title }} - {{ addr.street }}, {{ addr.city }}
              </option>
            </select>
            <a routerLink="/profile" class="add-address-link mt-2">+ Add New Address in Profile</a>
          </div>

          <button 
            (click)="proceedCheckout()" 
            [disabled]="!selectedAddressId || isProcessing()" 
            class="luxury-btn-primary checkout-btn mt-4"
          >
            {{ isProcessing() ? 'PROCESSING ORDER...' : 'PROCEED TO CHECKOUT' }}
          </button>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-cart glass-card">
          <h2 class="font-serif">Your Shopping Bag is Empty</h2>
          <p>Explore our latest couture arrivals and add pieces to your bag.</p>
          <a routerLink="/products" class="luxury-btn-primary mt-4">DISCOVER COLLECTIONS</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-page {
      max-width: 1200px;
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

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 40px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-item-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
    }

    .item-img {
      width: 110px;
      height: 140px;
      object-fit: cover;
      border-radius: 2px;
    }

    .item-details {
      flex-grow: 1;
    }

    .category {
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      color: var(--color-gold-light);
    }

    .name {
      font-size: 1.3rem;
      color: #fff;
      margin: 4px 0;
    }

    .size-info {
      font-size: 0.85rem;
      color: #9a9ab0;
    }

    .price {
      font-size: 1.4rem;
      color: var(--color-gold-primary);
      margin-top: 8px;
    }

    .item-qty {
      font-size: 0.9rem;
      color: #aaa;
      padding: 0 16px;
    }

    .remove-btn {
      color: #666;
      font-size: 1.8rem;
      padding: 4px 12px;
      transition: var(--transition-smooth);
    }

    .remove-btn:hover {
      color: #ff6b6b;
    }

    .summary-panel {
      padding: 30px;
      height: fit-content;
    }

    .summary-title {
      font-size: 1.8rem;
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      color: #aaa;
      font-size: 0.9rem;
      margin-bottom: 14px;
    }

    .total-row {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 16px;
      margin-top: 16px;
      color: #fff;
      font-size: 1.1rem;
    }

    .total-price {
      font-size: 1.8rem;
      color: var(--color-gold-primary);
    }

    .address-section label {
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      color: #888;
    }

    .address-select {
      width: 100%;
      background: #000;
      color: #fff;
      border: 1px solid var(--color-border-subtle);
      padding: 10px;
      font-size: 0.85rem;
      border-radius: 4px;
    }

    .add-address-link {
      display: block;
      font-size: 0.75rem;
      color: var(--color-gold-light);
      text-decoration: underline;
    }

    .checkout-btn {
      width: 100%;
      padding: 16px;
    }

    .empty-cart {
      text-align: center;
      padding: 80px 24px;
    }

    .empty-cart h2 {
      font-size: 2.2rem;
      color: var(--color-gold-light);
    }

    @media (max-width: 900px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  addresses = signal<Address[]>([]);
  selectedAddressId: string = '';
  isProcessing = signal(false);

  constructor(
    public ecommerceService: EcommerceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.ecommerceService.fetchCart().subscribe();
    this.ecommerceService.fetchAddresses().subscribe(addrs => {
      this.addresses.set(addrs);
      const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
      if (defaultAddr) this.selectedAddressId = defaultAddr.id;
    });
  }

  calculateSubtotal(): number {
    return this.ecommerceService.cartItems().reduce((sum, item) => {
      const p = item.product.salePrice || item.product.price;
      return sum + p * item.quantity;
    }, 0);
  }

  removeItem(cartItemId: string) {
    this.ecommerceService.removeFromCart(cartItemId).subscribe();
  }

  proceedCheckout() {
    const address = this.addresses().find(a => a.id === this.selectedAddressId);
    if (!address) {
      alert('Please select a valid delivery address.');
      return;
    }

    this.isProcessing.set(true);
    this.ecommerceService.checkoutOrder(this.calculateSubtotal(), address, 'Luxury Credit Card').subscribe({
      next: (order) => {
        this.isProcessing.set(false);
        alert(`Thank you for your purchase! Order #${order.orderNumber} has been placed.`);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isProcessing.set(false);
        alert(err?.error?.error || 'Order processing failed.');
      }
    });
  }
}
