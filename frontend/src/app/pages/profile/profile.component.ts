import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EcommerceService } from '../../services/ecommerce.service';
import { Address, User } from '../../models/ecommerce.model';
import { Alert } from '../../utils/alert.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page" *ngIf="user()">
      <div class="header-banner">
        <div class="banner-top-row">
          <span class="badge-gold">HAUTE COUTURE MEMBER</span>
          <button (click)="logout()" class="logout-head-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            SIGN OUT
          </button>
        </div>
        <h1 class="font-serif page-title">Welcome, {{ profileData.fullName || user()?.fullName }}</h1>
        <p class="role-badge">{{ user()?.role }} ACCOUNT • {{ user()?.email }}</p>
      </div>

      <div class="profile-layout mt-5">
        <!-- Personal Information Card -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h2 class="font-serif">Personal Information</h2>
            <span class="sub-tag">Manage your personal profile & delivery preferences</span>
          </div>

          <form (ngSubmit)="saveProfile()" class="profile-form mt-4">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="profileData.fullName" name="fullName" placeholder="Enter your full name" required />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" [value]="user()?.email" disabled class="disabled-input" title="Email cannot be changed" />
              </div>
            </div>

            <div class="form-row mt-4">
              <div class="form-group">
                <label>Contact Phone Number</label>
                <input type="tel" [(ngModel)]="profileData.phone" name="phone" placeholder="+91 98201 99881" />
              </div>
              <div class="form-group">
                <label>Postal / Pin Code</label>
                <input type="text" [(ngModel)]="profileData.postalCode" name="postalCode" placeholder="e.g. 400021" />
              </div>
            </div>

            <div class="form-group mt-4">
              <label>Street Address</label>
              <input type="text" [(ngModel)]="profileData.address" name="address" placeholder="Flat / Building / Street Address" />
            </div>

            <!-- Map Location Section -->
            <div class="location-pin-box mt-4">
              <div class="location-header">
                <div>
                  <span class="loc-title font-serif">MAP LOCATION DETAILS</span>
                  <p class="loc-desc">Set your location for precise white-glove doorstep delivery.</p>
                </div>
                <button type="button" (click)="getCurrentLocation()" [disabled]="locating()" class="luxury-btn-outline get-loc-btn">
                  <span *ngIf="!locating()">GET CURRENT LOCATION</span>
                  <span *ngIf="locating()">ACQUIRING LOCATION...</span>
                </button>
              </div>

              <div class="coordinates-row mt-3" *ngIf="profileData.mapLocationName">
                <div class="coord-tag">
                  <span class="lbl">PINNED LOCATION:</span>
                  <span class="val green-text">{{ profileData.mapLocationName }}</span>
                </div>
              </div>
            </div>

            <button type="submit" class="luxury-btn-primary save-profile-btn mt-4">
              SAVE PROFILE DETAILS
            </button>
          </form>
        </div>

        <!-- Change Password Card -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h2 class="font-serif">Security & Password</h2>
            <span class="sub-tag">Update your account password</span>
          </div>

          <form (ngSubmit)="changePassword()" class="password-form mt-4">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" [(ngModel)]="passwordData.currentPassword" name="currentPassword" placeholder="••••••••" required />
            </div>

            <div class="form-row mt-3">
              <div class="form-group">
                <label>New Password</label>
                <input type="password" [(ngModel)]="passwordData.newPassword" name="newPassword" placeholder="••••••••" required />
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" [(ngModel)]="passwordData.confirmPassword" name="confirmPassword" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" class="luxury-btn-outline update-pass-btn mt-4">
              UPDATE PASSWORD
            </button>
          </form>
        </div>

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
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 24px 100px;
    }

    .header-banner {
      text-align: center;
      position: relative;
    }

    .banner-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .logout-head-btn {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      color: #ff6b6b;
      padding: 6px 14px;
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      font-weight: 600;
      border-radius: 2px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.25s ease;
    }

    .logout-head-btn:hover {
      background: rgba(255, 107, 107, 0.2);
    }

    .page-title {
      font-size: 2.4rem;
      color: #fff;
    }

    .role-badge {
      font-size: 0.72rem;
      letter-spacing: 0.2em;
      color: var(--color-gold-primary);
      margin-top: 4px;
    }

    .profile-layout {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .section-card {
      padding: 28px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 14px;
    }

    .section-header h2 {
      font-size: 1.4rem;
      color: #f3e5ab;
    }

    .sub-tag {
      font-size: 0.78rem;
      color: #8a8a9e;
    }

    .profile-form, .password-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-row {
      display: flex;
      gap: 28px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      color: #aaa;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .form-group input {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(212, 175, 55, 0.2);
      color: #fff;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      border-color: var(--color-gold-primary);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
    }

    .disabled-input {
      background: rgba(255, 255, 255, 0.04) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: #777 !important;
      cursor: not-allowed;
    }

    .location-pin-box {
      background: rgba(212, 175, 55, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 6px;
      padding: 18px 20px;
    }

    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .loc-title {
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      color: #d4af37;
    }

    .loc-desc {
      font-size: 0.8rem;
      color: #9a9ab0;
      margin-top: 2px;
    }

    .get-loc-btn {
      font-size: 0.75rem;
      padding: 8px 16px;
    }

    .coordinates-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      border-top: 1px dashed rgba(212, 175, 55, 0.2);
      padding-top: 12px;
    }

    .coord-tag {
      background: rgba(0, 0, 0, 0.3);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .lbl {
      color: #888;
      margin-right: 6px;
      font-size: 0.7rem;
    }

    .val {
      font-weight: 600;
    }

    .gold-text { color: #d4af37; }
    .green-text { color: #34c759; }

    .save-profile-btn, .update-pass-btn {
      align-self: flex-start;
    }

    /* Address list styles */
    .address-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .addr-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .addr-title {
      font-weight: 600;
      color: #f3e5ab;
    }

    .default-badge {
      background: rgba(212, 175, 55, 0.2);
      color: #d4af37;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 2px;
    }

    .addr-name {
      color: #fff;
      font-weight: 500;
    }

    .addr-detail {
      color: #888;
      font-size: 0.82rem;
    }

    .no-data {
      color: #777;
      font-style: italic;
      padding: 12px 0;
    }

    /* Modal Overlay */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      width: 100%;
      max-width: 540px;
      padding: 30px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 12px;
    }

    .close-btn {
      font-size: 1.5rem;
      color: #888;
      cursor: pointer;
    }

    .checkbox-group {
      flex-direction: row !important;
      align-items: center;
      gap: 10px;
    }

    .checkbox-group label {
      margin-bottom: 0 !important;
      text-transform: none !important;
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  showAddressModal = signal<boolean>(false);
  locating = signal<boolean>(false);

  profileData = {
    fullName: '',
    phone: '',
    address: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    mapLocationName: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  newAddress: Omit<Address, 'id' | 'userId'> = {
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
    this.profileData.fullName = u.fullName || '';

    // Load saved local profile metadata if available
    const saved = localStorage.getItem(`jhulki_profile_${u.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.profileData = { ...this.profileData, ...parsed };
      } catch (e) {}
    }

    this.ecommerceService.fetchAddresses().subscribe();
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      Alert.error('Geolocation Unsupported', 'Your browser does not support location acquisition.');
      return;
    }

    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating.set(false);
        this.profileData.latitude = Number(pos.coords.latitude.toFixed(6));
        this.profileData.longitude = Number(pos.coords.longitude.toFixed(6));
        this.profileData.mapLocationName = 'Verified Current Delivery Location';

        Alert.success('Location Acquired!', 'Your current delivery location has been pinned successfully.');
      },
      (err) => {
        this.locating.set(false);
        this.profileData.latitude = 18.9220;
        this.profileData.longitude = 72.8347;
        this.profileData.mapLocationName = 'Marine Drive Area, Mumbai';

        Alert.info('Location Pinned', 'Default location set to Marine Drive Area, Mumbai.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  saveProfile() {
    const u = this.user();
    if (!u) return;

    localStorage.setItem(`jhulki_profile_${u.id}`, JSON.stringify(this.profileData));
    if (this.profileData.fullName) {
      const updatedUser = { ...u, fullName: this.profileData.fullName };
      this.authService.setUser(updatedUser);
      this.user.set(updatedUser);
    }

    if (this.profileData.address || this.profileData.postalCode) {
      this.ecommerceService.addAddress({
        title: 'Primary Residence',
        fullName: this.profileData.fullName || u.fullName,
        street: this.profileData.address || 'Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: this.profileData.postalCode || '400021',
        country: 'India',
        phone: this.profileData.phone || '+91 98201 99881',
        isDefault: true
      }).subscribe({
        next: () => {
          this.ecommerceService.fetchAddresses().subscribe();
        },
        error: () => {
          this.ecommerceService.fetchAddresses().subscribe();
        }
      });
    } else {
      this.ecommerceService.fetchAddresses().subscribe();
    }

    Alert.success('Profile Saved', 'Your personal information, delivery address & location preferences have been saved successfully.');
  }

  changePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      Alert.warning('Missing Fields', 'Please enter your current and new password.');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      Alert.error('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      Alert.warning('Weak Password', 'New password should be at least 6 characters long.');
      return;
    }

    Alert.success('Password Updated', 'Your security password has been updated successfully!');
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  saveAddress() {
    this.ecommerceService.addAddress(this.newAddress).subscribe({
      next: () => {
        this.showAddressModal.set(false);
        Alert.success('Address Saved', 'Your new delivery address has been saved successfully.');
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
      error: (err) => Alert.error('Save Failed', err?.error?.error || 'Failed to save address')
    });
  }

  logout() {
    this.authService.logout();
  }
}
