import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/ecommerce.model';
import { Alert } from '../../utils/alert.utils';

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
              <div class="price">
                ₹{{ ecommerceService.getEffectivePrice(item.product) }}
                <span *ngIf="item.product.isBogoEnabled" class="bogo-chip ml-2">🎁 BOGO ELIGIBLE</span>
              </div>
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
            <span class="price-val">₹{{ summary().originalSubtotal | number:'1.2-2' }}</span>
          </div>

          <div class="summary-row" *ngIf="summary().bogoDiscount > 0">
            <span class="gold-text">BUY 1 GET 1 DISCOUNT</span>
            <span class="gold-text price-val">- ₹{{ summary().bogoDiscount | number:'1.2-2' }}</span>
          </div>

          <div class="summary-row">
            <span>Complimentary Pan India Express Shipping</span>
            <span class="gold-text">FREE</span>
          </div>

          <!-- Payment Plan Options -->
          <div class="payment-plan-section mt-4">
            <label class="section-label">SELECT PAYMENT SCHEME:</label>
            <div class="plan-cards-grid mt-2">
              <div 
                class="plan-card" 
                [class.selected]="paymentScheme === '20_PERCENT'" 
                (click)="paymentScheme = '20_PERCENT'"
              >
                <div class="plan-radio-row">
                  <span class="radio-dot" [class.active]="paymentScheme === '20_PERCENT'"></span>
                  <span class="plan-name font-serif">20% Advance Booking</span>
                </div>
                <span class="plan-sub">Pay 20% now, rest 80% when AWB is generated</span>
                <span class="plan-badge font-serif">⚡ 2-Day Dispatch Refund Guarantee</span>
              </div>

              <div 
                class="plan-card mt-2" 
                [class.selected]="paymentScheme === 'FULL'" 
                (click)="paymentScheme = 'FULL'"
              >
                <div class="plan-radio-row">
                  <span class="radio-dot" [class.active]="paymentScheme === 'FULL'"></span>
                  <span class="plan-name font-serif">100% Full Payment</span>
                </div>
                <span class="plan-sub">Pay total order amount upfront</span>
              </div>
            </div>
          </div>

          <!-- Total / Payable Breakdown -->
          <div class="summary-row total-row" *ngIf="paymentScheme === '20_PERCENT'">
            <div>
              <span style="display:block; font-size:0.7rem; letter-spacing:0.1em; color:#888;">PAY TODAY (20% ADVANCE)</span>
              <span class="total-price">₹{{ getPayableToday() | number:'1.2-2' }}</span>
            </div>
            <div style="text-align:right;">
              <span style="display:block; font-size:0.7rem; letter-spacing:0.1em; color:#888;">BALANCE AFTER AWB (80%)</span>
              <span class="gold-text price-val" style="font-size:1.2rem;">₹{{ getRemainingBalance() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="summary-row total-row" *ngIf="paymentScheme === 'FULL'">
            <span>Estimated Total</span>
            <span class="total-price">₹{{ summary().finalTotal | number:'1.2-2' }}</span>
          </div>

          <!-- Address Picker for Checkout -->
          <div class="address-section mt-4">
            <label>DELIVERY ADDRESS:</label>
            <select [(ngModel)]="selectedAddressId" class="address-select mt-2">
              <option value="" disabled [selected]="!selectedAddressId">Select Shipping Address</option>
              <option *ngFor="let addr of getAvailableAddresses()" [value]="addr.id">
                {{ addr.title }} - {{ addr.street }}, {{ addr.city }} ({{ addr.postalCode }})
              </option>
            </select>
            <a routerLink="/profile" class="add-address-link mt-2">+ Manage Addresses in Profile</a>
          </div>

          <button 
            (click)="openPaymentModal()" 
            [disabled]="!selectedAddressId || isProcessing()" 
            class="luxury-btn-primary checkout-btn mt-4"
          >
            {{ isProcessing() ? 'PROCESSING ORDER...' : (paymentScheme === '20_PERCENT' ? 'PAY 20% ADVANCE (GENERATE UPI QR)' : 'PROCEED TO PAYMENT') }}
          </button>
        </div>
      </div>

      <!-- Instant UPI QR Code Payment Modal Overlay -->
      <div class="modal-backdrop" *ngIf="showPaymentModal()">
        <div class="modal-card glass-card qr-modal-card">
          <div class="modal-header">
            <div>
              <h3 class="font-serif gold-text">Scan UPI QR Code to Complete Booking</h3>
            </div>
            <button (click)="showPaymentModal.set(false)" class="close-btn">&times;</button>
          </div>

          <div class="qr-modal-body mt-3">
            <div class="merchant-info-strip">
              <span class="m-label">REGISTERED BUSINESS NAME:</span>
              <span class="m-val">JHULKI HAUTE COUTURE PRIVATE LIMITED</span>
            </div>

            <div class="qr-code-box mt-3">
              <img [src]="getUpiQrUrl()" alt="Jhulki UPI QR Code" class="upi-qr-img" />
              <div class="qr-details">
                <span class="upi-id-tag">UPI ID: <strong>jhulki@upi</strong></span>
                <span class="amount-tag">PAYABLE ADVANCE: <strong class="gold-text">₹{{ getPayableAmount() | number:'1.2-2' }}</strong></span>
                <p class="scan-note">Scan using GPay, PhonePe, Paytm, BHIM, or any UPI banking app.</p>
              </div>
            </div>

            <form (ngSubmit)="submitUpiPayment()" class="utr-form mt-4">
              <div class="form-group">
                <label>ENTER 12-DIGIT UPI TRANSACTION REF ID / UTR</label>
                <input 
                  type="text" 
                  [(ngModel)]="utrNumber" 
                  name="utrNumber" 
                  placeholder="e.g. 425619842012" 
                  maxlength="20"
                  required 
                />
                <span class="help-text">Found in your payment app payment success receipt (UTR / Ref No.)</span>
              </div>

              <div class="modal-actions mt-4">
                <button type="button" (click)="showPaymentModal.set(false)" class="luxury-btn-outline">Cancel</button>
                <button type="submit" [disabled]="isProcessing()" class="luxury-btn-primary">
                  {{ isProcessing() ? 'VERIFYING...' : 'VERIFY & CONFIRM BOOKING' }}
                </button>
              </div>
            </form>
          </div>
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

    .bogo-chip {
      background: rgba(212,175,55,0.15);
      border: 1px solid var(--color-gold-primary);
      color: var(--color-gold-light);
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      padding: 2px 6px;
      border-radius: 2px;
      vertical-align: middle;
    }

    /* Payment Plan Cards */
    .section-label {
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      color: #888;
      display: block;
      margin-bottom: 6px;
    }

    .plan-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 14px;
      border-radius: 4px;
      cursor: pointer;
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .plan-card.selected, .plan-card:hover {
      border-color: var(--color-gold-primary);
      background: rgba(212, 175, 55, 0.08);
    }

    .plan-radio-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .radio-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid #888;
      display: inline-block;
      transition: var(--transition-smooth);
    }

    .radio-dot.active {
      border-color: var(--color-gold-primary);
      background: var(--color-gold-primary);
      box-shadow: 0 0 6px rgba(212, 175, 55, 0.6);
    }

    .plan-name {
      font-size: 1rem;
      color: #fff;
      font-weight: 600;
    }

    .plan-sub {
      font-size: 0.75rem;
      color: #aaa;
      padding-left: 24px;
    }

    .plan-badge {
      font-size: 0.65rem;
      color: #55efc4;
      padding-left: 24px;
      margin-top: 2px;
    }

    @media (max-width: 900px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    /* UPI QR Payment Modal Overlay Window Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .qr-modal-card {
      width: 92% !important;
      max-width: 520px !important;
      background: #121216 !important;
      border: 1px solid rgba(212, 175, 55, 0.35) !important;
      border-radius: 8px !important;
      padding: 28px !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.15) !important;
      position: relative !important;
      z-index: 1001 !important;
      animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      from { opacity: 0; transform: scale(0.94) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 14px;
    }

    .close-btn {
      font-size: 1.6rem;
      color: #888;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #ff6b6b;
    }

    .merchant-info-strip {
      background: rgba(212, 175, 55, 0.08);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .m-label { color: #888; font-size: 0.68rem; letter-spacing: 0.1em; }
    .m-val { color: #f3e5ab; font-weight: 700; letter-spacing: 0.05em; }

    .qr-code-box {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #09090b;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 6px;
      padding: 16px;
    }

    .upi-qr-img {
      width: 140px;
      height: 140px;
      border-radius: 4px;
      background: #fff;
      padding: 6px;
    }

    .qr-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .upi-id-tag { font-size: 0.85rem; color: #ddd; }
    .amount-tag { font-size: 0.95rem; color: #fff; }
    .scan-note { font-size: 0.75rem; color: #888; line-height: 1.3; margin-top: 4px; }

    .help-text { font-size: 0.7rem; color: #888; margin-top: 4px; display: block; }
  `]
})
export class CartComponent implements OnInit {
  addresses = signal<Address[]>([]);
  selectedAddressId: string = '';
  isProcessing = signal(false);
  showPaymentModal = signal(false);
  paymentScheme: '20_PERCENT' | 'FULL' = '20_PERCENT';
  utrNumber: string = '';

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

  getAvailableAddresses(): Address[] {
    const addrs = this.ecommerceService.addresses();
    if (addrs && addrs.length > 0) {
      if (!this.selectedAddressId) {
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        if (defaultAddr) this.selectedAddressId = defaultAddr.id;
      }
      return addrs;
    }
    return this.addresses();
  }

  summary() {
    return this.ecommerceService.calculateCartSummary();
  }

  getPayableToday(): number {
    const total = this.summary().finalTotal;
    return Math.round(total * 0.20);
  }

  getRemainingBalance(): number {
    const total = this.summary().finalTotal;
    return total - this.getPayableToday();
  }

  getPayableAmount(): number {
    return this.paymentScheme === '20_PERCENT' ? this.getPayableToday() : this.summary().finalTotal;
  }

  getUpiQrUrl(): string {
    const amount = this.getPayableAmount();
    const upiString = `upi://pay?pa=jhulki@upi&pn=Jhulki%20Haute%20Couture%20Pvt%20Ltd&am=${amount}&cu=INR&tn=Booking%20Advance`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&color=d4af37&bgcolor=09090b`;
  }

  removeItem(cartItemId: string) {
    this.ecommerceService.removeFromCart(cartItemId).subscribe();
  }

  openPaymentModal() {
    const addrs = this.getAvailableAddresses();
    const address = addrs.find(a => a.id === this.selectedAddressId) || addrs[0];
    if (!address) {
      Alert.warning('Address Required', 'Please select or add a valid delivery address in your Profile.');
      return;
    }
    this.selectedAddressId = address.id;
    this.utrNumber = '';
    this.showPaymentModal.set(true);
  }

  submitUpiPayment() {
    if (!this.utrNumber || this.utrNumber.trim().length < 6) {
      Alert.warning('Transaction Ref ID Required', 'Please enter your 12-digit UPI UTR / Transaction Ref Number from your payment app receipt.');
      return;
    }

    const addrs = this.getAvailableAddresses();
    const address = addrs.find(a => a.id === this.selectedAddressId) || addrs[0];
    if (!address) {
      Alert.warning('Address Error', 'Please select or add a delivery address.');
      return;
    }

    const finalAmount = this.getPayableAmount();
    const schemeLabel = this.paymentScheme === '20_PERCENT' ? '20% Advance Booking' : '100% Full Payment';
    const methodString = `Prepaid UPI (UTR: ${this.utrNumber.trim()}) - ${schemeLabel}`;

    this.isProcessing.set(true);
    this.ecommerceService.checkoutOrder(finalAmount, address, methodString).subscribe({
      next: (order) => {
        this.isProcessing.set(false);
        this.showPaymentModal.set(false);

        if (this.paymentScheme === '20_PERCENT') {
          Alert.success(
            'UPI Payment Received & Order Placed!',
            `Transaction Ref ID: ${this.utrNumber.trim()}\n\nOrder #${order.orderNumber} successfully registered with ₹${finalAmount.toLocaleString()} advance booking.\n\nProduct verification & Delhivery AWB assignment will occur within 2 days. Track live status anytime in your Profile / Track Order.`
          ).then(() => {
            this.router.navigate(['/track-order']);
          });
        } else {
          Alert.success(
            'UPI Payment Received!',
            `Transaction Ref ID: ${this.utrNumber.trim()}\n\nThank you! Order #${order.orderNumber} (₹${finalAmount.toLocaleString()}) has been confirmed.`
          ).then(() => {
            this.router.navigate(['/track-order']);
          });
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        Alert.error('Order Failed', err?.error?.error || 'Order processing failed.');
      }
    });
  }
}
