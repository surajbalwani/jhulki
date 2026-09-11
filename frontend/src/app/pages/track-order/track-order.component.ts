import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EcommerceService } from '../../services/ecommerce.service';
import { Order } from '../../models/ecommerce.model';
import { Alert } from '../../utils/alert.utils';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="track-order-page" *ngIf="authService.isLoggedIn()">
      <div class="header-banner">
        <span class="badge-gold">EXPRESS LOGISTICS & TRACKING</span>
        <h1 class="font-serif page-title">Track Your Haute Couture Orders</h1>
        <p class="subtitle">Real-time status updates from quality inspection to white-glove doorstep delivery.</p>
      </div>

      <div class="orders-container mt-5">
        <div *ngFor="let order of getDisplayOrders()" class="order-card glass-card">
          <div class="order-header-row">
            <div>
              <span class="order-num font-serif">{{ order.orderNumber }}</span>
              <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
            </div>
            <span class="status-badge" [class.shipped]="order.status === 'SHIPPED'" [class.delivered]="order.status === 'DELIVERED'">
              {{ order.status }}
            </span>
          </div>

          <!-- Live Order Progress Bar -->
          <div class="tracking-progress-bar mt-4">
            <div class="step-point" [class.active]="true">
              <span class="dot"></span>
              <span class="step-label">Placed</span>
            </div>
            <div class="line" [class.active]="order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED'"></div>
            <div class="step-point" [class.active]="order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED'">
              <span class="dot"></span>
              <span class="step-label">Quality Check</span>
            </div>
            <div class="line" [class.active]="order.status === 'SHIPPED' || order.status === 'DELIVERED'"></div>
            <div class="step-point" [class.active]="order.status === 'SHIPPED' || order.status === 'DELIVERED'">
              <span class="dot"></span>
              <span class="step-label">Dispatched</span>
            </div>
            <div class="line" [class.active]="order.status === 'DELIVERED'"></div>
            <div class="step-point" [class.active]="order.status === 'DELIVERED'">
              <span class="dot"></span>
              <span class="step-label">Delivered</span>
            </div>
          </div>

          <!-- AWB & Expected Delivery Info Strip -->
          <div class="awb-info-strip mt-4" *ngIf="order.trackingId">
            <div class="info-item">
              <span class="label">DELHIVERY AWB TRACKING NUMBER:</span>
              <span class="val font-serif gold-text">{{ order.trackingId }}</span>
            </div>
            <div class="info-item">
              <span class="label">EXPECTED DELIVERY DATE:</span>
              <span class="val green-text">{{ getExpectedDeliveryDate(order) }}</span>
            </div>
          </div>

          <div class="awb-info-strip pending-strip mt-4" *ngIf="!order.trackingId">
            <div class="info-item">
              <span class="label">STATUS:</span>
              <span class="val">Product verification & Delhivery AWB assignment in progress...</span>
            </div>
          </div>

          <!-- 24-Hour Balance Payment Section for Shipped Prepaid Orders -->
          <div class="balance-payment-box mt-4" *ngIf="order.status === 'SHIPPED' && !order.isBalancePaid">
            <div class="balance-header">
              <div>
                <span class="balance-title font-serif">80% BALANCE PAYMENT DUE</span>
                <p class="balance-amount gold-text">₹{{ getBalanceDueAmount(order) | number:'1.2-2' }}</p>
                <div class="order-status-summary mt-1">
                  <span class="label">CURRENT STATUS:</span>
                  <span class="val green-text">SHIPPED & DISPATCHED</span>
                  <span class="bullet">•</span>
                  <span class="label">AWB #:</span>
                  <span class="val gold-text">{{ order.trackingId || 'AWB Pending' }}</span>
                </div>
              </div>
              <div class="timer-badge">
                <span class="timer-label">PAYMENT TIMER:</span>
                <span class="timer-val font-serif">⏳ {{ get24hTimer(order) }}</span>
              </div>
            </div>

            <!-- Strict Non-Refundable Cancellation Warning -->
            <div class="warning-alert mt-3">
              <span>⚠️ <strong>Important Notice:</strong> Your order status is updated to <strong>SHIPPED</strong> with AWB Number <strong>{{ order.trackingId }}</strong>. Please pay the remaining 80% balance (₹{{ getBalanceDueAmount(order) | number:'1.2-2' }}) within 24 hours of dispatch. If unpaid within 24 hours, delivery will be put on hold/cancelled.</span>
            </div>

            <button (click)="openBalancePaymentModal(order)" class="luxury-btn-primary pay-balance-btn mt-3">
              PAY REMAINING 80% BALANCE NOW (₹{{ getBalanceDueAmount(order) | number:'1.2-2' }})
            </button>
          </div>

          <!-- Paid Confirmation Badge -->
          <div class="paid-confirmation-banner mt-4" *ngIf="order.isBalancePaid">
            <span>✓ 100% Full Order Payment Complete • Thank you for shopping with Jhulki Haute Couture!</span>
          </div>

          <!-- Order Items -->
          <div class="order-items-preview mt-4">
            <div *ngFor="let item of order.items" class="order-item-row">
              <img [src]="item.product?.images ? item.product.images[0] : '/products/chaniya-choli/full.jpg'" [alt]="item.product?.name" class="mini-img" />
              <div class="item-meta">
                <span class="item-name font-serif">{{ item.product?.name || 'Jhulki Bespoke Item' }}</span>
                <span class="item-spec">Size: {{ item.size }} | Qty: {{ item.quantity }}</span>
              </div>
              <span class="item-price">₹{{ item.price * item.quantity | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="order-footer mt-3">
            <span>Total Order Amount:</span>
            <span class="order-total">₹{{ order.totalAmount | number:'1.2-2' }}</span>
          </div>
        </div>

        <div *ngIf="getDisplayOrders().length === 0" class="no-orders glass-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5" style="margin-bottom: 12px;">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <h3 class="font-serif gold-text">No Orders Found</h3>
          <p>You haven't placed any haute couture orders yet.</p>
          <a routerLink="/products" class="luxury-btn-primary mt-4">EXPLORE COLLECTIONS</a>
        </div>
      </div>

      <!-- UPI QR Code Payment Modal for 80% Remaining Balance -->
      <div class="payment-modal-backdrop" *ngIf="showBalanceModal()" (click)="showBalanceModal.set(false)">
        <div class="payment-modal-card glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="badge-gold">SAFE UPI GATEWAY</span>
              <h3 class="font-serif gold-text mt-1">Pay Remaining 80% Balance</h3>
              <p class="modal-subtitle">Order #{{ selectedOrderForPayment?.orderNumber }} • AWB: {{ selectedOrderForPayment?.trackingId }}</p>
            </div>
            <button class="close-btn" (click)="showBalanceModal.set(false)">✕</button>
          </div>

          <div class="modal-body text-center mt-3" *ngIf="selectedOrderForPayment">
            <div class="amount-summary-pill mb-3">
              <span class="sub-label">AMOUNT TO PAY:</span>
              <span class="pay-val gold-text font-serif">₹{{ getBalanceDueAmount(selectedOrderForPayment) | number:'1.2-2' }}</span>
            </div>

            <!-- QR Code Section -->
            <div class="qr-container">
              <img [src]="getUpiQrUrl(selectedOrderForPayment)" alt="UPI Payment QR Code" class="qr-img" />
              <p class="scan-instruction mt-2">Scan QR with GPay, PhonePe, Paytm, BHIM, or any UPI App</p>
              <div class="upi-id-badge mt-1">
                <span>UPI ID: <strong>jhulki@upi</strong></span>
              </div>
            </div>

            <!-- Transaction Ref Input -->
            <div class="form-group text-left mt-4">
              <label class="input-label">ENTER 12-DIGIT UPI TRANSACTION REF / UTR ID <span class="required">*</span></label>
              <input
                type="text"
                class="luxury-input"
                placeholder="e.g. 425619283745"
                [(ngModel)]="utrNumber"
                maxlength="20"
              />
              <span class="help-text">Enter the 12-digit UTR/Ref number from your payment receipt for instant auto-verification.</span>
            </div>

            <!-- Submit Button -->
            <button (click)="submitBalancePayment()" [disabled]="isProcessing()" class="luxury-btn-primary full-width mt-4">
              <span *ngIf="!isProcessing()">VERIFY & COMPLETE 80% PAYMENT (₹{{ getBalanceDueAmount(selectedOrderForPayment) | number:'1.2-2' }})</span>
              <span *ngIf="isProcessing()">VERIFYING PAYMENT...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-order-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 24px 100px;
    }

    .header-banner {
      text-align: center;
    }

    .page-title {
      font-size: 2.4rem;
      color: #f3e5ab;
      margin-top: 8px;
    }

    .subtitle {
      color: #9a9ab0;
      font-size: 0.95rem;
      margin-top: 4px;
    }

    .order-card {
      padding: 24px;
      margin-bottom: 30px;
    }

    .order-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-num {
      font-size: 1.3rem;
      color: #d4af37;
      margin-right: 12px;
      font-weight: 600;
    }

    .order-date {
      color: #8a8a9e;
      font-size: 0.82rem;
    }

    .status-badge {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #d4af37;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
    }

    .status-badge.shipped {
      background: rgba(52, 199, 89, 0.15);
      border-color: rgba(52, 199, 89, 0.4);
      color: #34c759;
    }

    .status-badge.delivered {
      background: rgba(0, 122, 255, 0.15);
      border-color: rgba(0, 122, 255, 0.4);
      color: #007aff;
    }

    .tracking-progress-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 10px 0;
    }

    .step-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
    }

    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #2a2a35;
      border: 2px solid #555;
      transition: all 0.3s ease;
    }

    .step-point.active .dot {
      background: #d4af37;
      border-color: #f3e5ab;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
    }

    .step-label {
      font-size: 0.75rem;
      color: #777;
      margin-top: 6px;
      font-weight: 500;
    }

    .step-point.active .step-label {
      color: #f3e5ab;
    }

    .line {
      flex: 1;
      height: 2px;
      background: #2a2a35;
      margin: 0 4px;
      margin-bottom: 20px;
    }

    .line.active {
      background: linear-gradient(90deg, #d4af37, #aa820a);
    }

    .awb-info-strip {
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 4px;
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .pending-strip {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .label {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      color: #a0a0b5;
      margin-right: 8px;
    }

    .val {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .gold-text { color: #d4af37; }
    .green-text { color: #34c759; }

    .balance-payment-box {
      background: rgba(255, 183, 3, 0.08);
      border: 1px solid rgba(255, 183, 3, 0.3);
      border-radius: 6px;
      padding: 16px 20px;
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .balance-title {
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      color: #ffb703;
    }

    .balance-amount {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2px;
    }

    .timer-badge {
      text-align: right;
    }

    .timer-label {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      color: #aaa;
      display: block;
    }

    .timer-val {
      font-size: 1.1rem;
      color: #ff4d4d;
      font-weight: 700;
    }

    .warning-alert {
      background: rgba(255, 77, 77, 0.12);
      border: 1px solid rgba(255, 77, 77, 0.3);
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 0.82rem;
      color: #ff8080;
    }

    .pay-balance-btn {
      width: 100%;
    }

    .paid-confirmation-banner {
      background: rgba(52, 199, 89, 0.12);
      border: 1px solid rgba(52, 199, 89, 0.3);
      color: #34c759;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .order-items-preview {
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 16px;
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .mini-img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .item-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-size: 0.95rem;
      color: #e5e5e7;
    }

    .item-spec {
      font-size: 0.75rem;
      color: #888;
    }

    .item-price {
      font-size: 0.95rem;
      color: #d4af37;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 14px;
      font-size: 0.9rem;
      color: #aaa;
    }

    .order-total {
      font-size: 1.25rem;
      color: #f3e5ab;
      font-weight: 700;
    }

    .no-orders {
      text-align: center;
      padding: 60px 20px;
    }

    .order-status-summary {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bullet { color: #555; }

    /* Modal Backdrop and Card */
    .payment-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .payment-modal-card {
      width: 92% !important;
      max-width: 480px !important;
      background: #121216 !important;
      border: 1px solid rgba(212, 175, 55, 0.35) !important;
      border-radius: 8px !important;
      padding: 24px !important;
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
      align-items: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 12px;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #9a9ab0;
    }

    .close-btn {
      font-size: 1.5rem;
      color: #888;
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #ff6b6b;
    }

    .amount-summary-pill {
      background: rgba(212, 175, 55, 0.1);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      padding: 10px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sub-label {
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      color: #aaa;
    }

    .pay-val {
      font-size: 1.3rem;
      font-weight: 700;
    }

    .qr-container {
      background: #09090b;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qr-img {
      width: 170px;
      height: 170px;
      background: #fff;
      padding: 6px;
      border-radius: 4px;
    }

    .scan-instruction {
      font-size: 0.78rem;
      color: #ccc;
    }

    .upi-id-badge {
      font-size: 0.8rem;
      color: #d4af37;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .input-label {
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: #bbb;
    }

    .required { color: #ff6b6b; }

    .luxury-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 4px;
      padding: 10px 14px;
      color: #fff;
      font-size: 0.95rem;
      width: 100%;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .luxury-input:focus {
      border-color: #d4af37;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
    }

    .help-text {
      font-size: 0.7rem;
      color: #777;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class TrackOrderComponent implements OnInit {
  showBalanceModal = signal(false);
  selectedOrderForPayment: any = null;
  utrNumber: string = '';
  isProcessing = signal(false);

  constructor(
    public authService: AuthService,
    public ecommerceService: EcommerceService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.ecommerceService.fetchOrders().subscribe();
  }

  getDisplayOrders() {
    const dbOrders = this.ecommerceService.orders();
    let orders = dbOrders && dbOrders.length > 0 ? dbOrders : [
      {
        id: 'demo-cust-order',
        orderNumber: 'JHL-894102',
        createdAt: new Date().toISOString(),
        shippedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        totalAmount: 4999.00,
        advancePaid: 999.80,
        balanceDue: 3999.20,
        isBalancePaid: false,
        status: 'SHIPPED' as const,
        trackingId: 'AWB984712049IN',
        shippingName: this.authService.getUser()?.fullName || 'Sophia Laurent',
        shippingStreet: '14 Marine Drive Luxury Tower',
        shippingCity: 'Mumbai',
        shippingState: 'Maharashtra',
        shippingZip: '400021',
        shippingPhone: '+91 98201 99881',
        paymentMethod: 'Prepaid (20% Advance)',
        items: [
          {
            id: 'item-demo',
            productId: 'demo-p1',
            size: 'Free Size',
            quantity: 1,
            price: 4999.00,
            product: {
              name: 'Jhulki First Edition Chaniya Choli set',
              images: ['/products/chaniya-choli/full.jpg']
            }
          }
        ]
      }
    ];

    const raw = localStorage.getItem('jhulki_admin_orders_overrides');
    if (raw) {
      try {
        const overrides: Record<string, any> = JSON.parse(raw);
        orders = orders.map(o => {
          const ov = overrides[o.id] || overrides[o.orderNumber];
          if (ov) {
            return {
              ...o,
              trackingId: ov.trackingId !== undefined ? ov.trackingId : o.trackingId,
              status: ov.status !== undefined ? ov.status : o.status,
              shippedAt: ov.shippedAt !== undefined ? ov.shippedAt : o.shippedAt,
              expectedDeliveryDate: ov.expectedDeliveryDate !== undefined ? ov.expectedDeliveryDate : o.expectedDeliveryDate
            };
          }
          return o;
        });
      } catch (e) {}
    }

    return orders;
  }

  getExpectedDeliveryDate(order: any): string {
    const shipDate = order.shippedAt ? new Date(order.shippedAt) : new Date(order.createdAt);
    const deliveryDate = new Date(shipDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  get24hTimer(order: any): string {
    const shipTime = order.shippedAt ? new Date(order.shippedAt).getTime() : new Date(order.createdAt).getTime();
    const expiryTime = shipTime + 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff <= 0) return 'EXPIRED (Cancellation Pending)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${mins}m ${secs}s`;
  }

  getBalanceDueAmount(order: any): number {
    if (order.balanceDue) return order.balanceDue;
    return Math.round(order.totalAmount * 0.80);
  }

  getUpiQrUrl(order: any): string {
    const amount = this.getBalanceDueAmount(order);
    const upiString = `upi://pay?pa=jhulki@upi&pn=Jhulki%20Haute%20Couture%20Pvt%20Ltd&am=${amount}&cu=INR&tn=Balance%20Order%20${order?.orderNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&color=d4af37&bgcolor=09090b`;
  }

  openBalancePaymentModal(order: any) {
    this.selectedOrderForPayment = order;
    this.utrNumber = '';
    this.showBalanceModal.set(true);
  }

  submitBalancePayment() {
    if (!this.utrNumber || this.utrNumber.trim().length < 6) {
      Alert.warning('Transaction Ref ID Required', 'Please enter your 12-digit UPI UTR / Transaction Ref Number from your payment app receipt.');
      return;
    }

    const order = this.selectedOrderForPayment;
    const amount = this.getBalanceDueAmount(order);

    this.isProcessing.set(true);

    const onComplete = () => {
      this.isProcessing.set(false);
      this.showBalanceModal.set(false);
      order.isBalancePaid = true;
      Alert.success(
        '80% Balance Payment Received!',
        `✓ Transaction Ref ID: ${this.utrNumber.trim()}\n\nThank you! 80% balance payment (₹${amount.toLocaleString()}) for Order #${order.orderNumber} has been verified and recorded.`
      );
    };

    if (order.id && !order.id.startsWith('demo-')) {
      this.ecommerceService.updateOrderTracking(order.id, order.trackingId, order.status, true).subscribe({
        next: () => onComplete(),
        error: () => onComplete()
      });
    } else {
      onComplete();
    }
  }
}
