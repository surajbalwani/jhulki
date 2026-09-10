import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EcommerceService } from '../../services/ecommerce.service';
import { Address, Order } from '../../models/ecommerce.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page" *ngIf="user()">
      <div class="header-banner">
        <span class="badge-gold">CLIENT PROFILE</span>
        <h1 class="font-serif page-title">Welcome, {{ user()?.fullName }}</h1>
        <p class="role-badge">{{ user()?.role }} ACCOUNT</p>
      </div>

      <div class="profile-grid mt-5">
        <!-- Address Management Section -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h2 class="font-serif">Shipping Addresses</h2>
            <button (click)="showAddressModal.set(true)" class="luxury-btn-outline add-btn">
              + ADD NEW ADDRESS
            </button>
          </div>

          <div class="address-list mt-4">
            <div *ngFor="let addr of ecommerceService.addresses()" class="address-card">
              <div class="addr-title-row">
                <span class="addr-title">{{ addr.title }}</span>
                <span class="default-badge" *ngIf="addr.isDefault">DEFAULT</span>
              </div>
              <p class="addr-name">{{ addr.fullName }}</p>
              <p class="addr-detail">{{ addr.street }}, {{ addr.city }}, {{ addr.state }} {{ addr.postalCode }}</p>
              <p class="addr-detail">Country: {{ addr.country }} | Phone: {{ addr.phone }}</p>
            </div>

            <div *ngIf="ecommerceService.addresses().length === 0" class="no-data">
              No saved addresses found. Add an address for seamless checkout.
            </div>
          </div>
        </div>

        <!-- Order History Section -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h2 class="font-serif">Order History</h2>
          </div>

          <div class="orders-list mt-4">
            <div *ngFor="let order of ecommerceService.orders()" class="order-card">
              <div class="order-header-row">
                <div>
                  <span class="order-num font-serif">{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <span class="status-badge" [class.delivered]="order.status === 'DELIVERED'">
                  {{ order.status }}
                </span>
              </div>

              <div class="order-items-preview mt-3">
                <div *ngFor="let item of order.items" class="order-item-row">
                  <img [src]="item.product.images[0]" [alt]="item.product.name" class="mini-img" />
                  <div class="item-meta">
                    <span class="item-name font-serif">{{ item.product.name }}</span>
                    <span class="item-spec">Size: {{ item.size }} | Qty: {{ item.quantity }}</span>
                  </div>
                  <span class="item-price font-serif">\${{ item.price * item.quantity }}</span>
                </div>
              </div>

              <div class="order-footer mt-3">
                <span>Total Amount Paid:</span>
                <span class="order-total font-serif">\${{ order.totalAmount }}</span>
              </div>
            </div>

            <div *ngIf="ecommerceService.orders().length === 0" class="no-data">
              You haven't placed any haute couture orders yet.
            </div>
          </div>
        </div>
      </div>

      <!-- Add Address Modal Overlay -->
      <div class="modal-backdrop" *ngIf="showAddressModal()">
        <div class="modal-card glass-card">
          <div class="modal-header">
            <h3 class="font-serif">Add Delivery Address</h3>
            <button (click)="showAddressModal.set(false)" class="close-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveAddress()" class="modal-form mt-4">
            <div class="form-row">
              <div class="form-group">
                <label>Address Title (e.g. Home, Work)</label>
                <input type="text" [(ngModel)]="newAddress.title" name="title" required />
              </div>
              <div class="form-group">
                <label>Full Recipient Name</label>
                <input type="text" [(ngModel)]="newAddress.fullName" name="fullName" required />
              </div>
            </div>

            <div class="form-group mt-3">
              <label>Street Address</label>
              <input type="text" [(ngModel)]="newAddress.street" name="street" required />
            </div>

            <div class="form-row mt-3">
              <div class="form-group">
                <label>City</label>
                <input type="text" [(ngModel)]="newAddress.city" name="city" required />
              </div>
              <div class="form-group">
                <label>State / Province</label>
                <input type="text" [(ngModel)]="newAddress.state" name="state" required />
              </div>
            </div>

            <div class="form-row mt-3">
              <div class="form-group">
                <label>Postal / Zip Code</label>
                <input type="text" [(ngModel)]="newAddress.postalCode" name="postalCode" required />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="text" [(ngModel)]="newAddress.phone" name="phone" required />
              </div>
            </div>

            <div class="form-group mt-3 checkbox-group">
              <input type="checkbox" id="isDefault" [(ngModel)]="newAddress.isDefault" name="isDefault" />
              <label for="isDefault">Set as default shipping address</label>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" (click)="showAddressModal.set(false)" class="luxury-btn-outline">Cancel</button>
              <button type="submit" class="luxury-btn-primary">Save Address</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 100px;
    }

    .header-banner {
      text-align: center;
    }

    .page-title {
      font-size: 2.8rem;
      color: #fff;
      margin: 8px 0;
    }

    .role-badge {
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: var(--color-gold-light);
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .section-card {
      padding: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 16px;
    }

    .section-header h2 {
      font-size: 1.8rem;
      color: #fff;
    }

    .add-btn {
      font-size: 0.7rem;
      padding: 8px 14px;
    }

    .address-card {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .addr-title-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .addr-title {
      font-weight: 600;
      color: var(--color-gold-light);
      font-size: 0.9rem;
    }

    .default-badge {
      background: var(--color-gold-primary);
      color: #000;
      font-size: 0.55rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 2px;
    }

    .addr-name {
      color: #fff;
      font-weight: 500;
    }

    .addr-detail {
      font-size: 0.85rem;
      color: #888;
    }

    .order-card {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .order-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-num {
      font-size: 1.1rem;
      color: var(--color-gold-primary);
    }

    .order-date {
      font-size: 0.75rem;
      color: #666;
      margin-left: 10px;
    }

    .status-badge {
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      padding: 4px 8px;
      background: rgba(212,175,55,0.15);
      color: var(--color-gold-light);
      border-radius: 2px;
    }

    .status-badge.delivered {
      background: rgba(85,239,196,0.15);
      color: #55efc4;
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .mini-img {
      width: 40px;
      height: 50px;
      object-fit: cover;
      border-radius: 2px;
    }

    .item-meta {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .item-name {
      color: #fff;
      font-size: 0.95rem;
    }

    .item-spec {
      font-size: 0.75rem;
      color: #888;
    }

    .item-price {
      color: var(--color-gold-light);
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      color: #aaa;
      font-size: 0.85rem;
      padding-top: 8px;
    }

    .order-total {
      font-size: 1.2rem;
      color: var(--color-gold-primary);
    }

    .no-data {
      color: #666;
      font-size: 0.85rem;
      text-align: center;
      padding: 20px;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .modal-card {
      width: 100%;
      max-width: 540px;
      padding: 32px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 16px;
    }

    .modal-header h3 {
      font-size: 1.8rem;
      color: var(--color-gold-light);
    }

    .close-btn {
      color: #fff;
      font-size: 1.8rem;
    }

    .form-group label {
      display: block;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      color: #888;
      margin-bottom: 6px;
    }

    .form-group input[type="text"] {
      width: 100%;
      background: #000;
      border: 1px solid var(--color-border-subtle);
      color: #fff;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 0.85rem;
      outline: none;
    }

    .form-group input[type="text"]:focus {
      border-color: var(--color-gold-primary);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<any>(null);
  showAddressModal = signal(false);

  newAddress = {
    title: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: true,
  };

  constructor(
    public authService: AuthService,
    public ecommerceService: EcommerceService,
    private router: Router
  ) {}

  ngOnInit() {
    const u = this.authService.getUser();
    if (!u) {
      this.router.navigate(['/auth']);
      return;
    }
    this.user.set(u);
    this.ecommerceService.fetchAddresses().subscribe();
    this.ecommerceService.fetchOrders().subscribe();
  }

  saveAddress() {
    this.ecommerceService.addAddress(this.newAddress).subscribe({
      next: () => {
        this.showAddressModal.set(false);
        this.newAddress = {
          title: 'Home',
          fullName: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          phone: '',
          isDefault: false,
        };
      },
      error: (err) => alert(err?.error?.error || 'Failed to save address')
    });
  }
}
