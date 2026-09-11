import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/ecommerce.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <span class="badge-gold">MANAGEMENT PORTAL</span>
          <h1 class="font-serif page-title">Atelier Admin Control</h1>
        </div>

        <div class="admin-header-actions">
          <!-- BOGO Master Promotion Switch with Hover Edit -->
          <div class="bogo-header-toggle-wrap">
            <div class="bogo-toggle-info">
              <span class="bogo-toggle-title">
                BOGO OFFER
                <a (click)="openBogoModal()" class="bogo-edit-hover-link" title="Click to select BOGO eligible products">Edit</a>
              </span>
              <span class="bogo-toggle-sub">{{ isAnyBogoActive() ? 'OFFER ACTIVE' : 'OFFER OFF' }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" [checked]="isAnyBogoActive()" (change)="toggleAllBogo($event)" />
              <span class="slider round"></span>
            </label>
          </div>

          <button (click)="openAddProductModal()" class="luxury-btn-primary">
            + ADD PRODUCT
          </button>
        </div>
      </div>

      <!-- Dashboard Telemetry Stats -->
      <div class="stats-grid mt-5 mb-5" *ngIf="metrics()">
        <div class="stat-card glass-card">
          <span class="stat-title">TOTAL REVENUE</span>
          <span class="stat-value font-serif gold-text">₹{{ metrics()?.totalRevenue | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-title">HAUTE PRODUCTS</span>
          <span class="stat-value font-serif">{{ metrics()?.totalProducts }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-title">REGISTERED CLIENTS</span>
          <span class="stat-value font-serif">{{ metrics()?.totalUsers }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="stat-title">TOTAL ORDERS</span>
          <span class="stat-value font-serif">{{ metrics()?.totalOrders }}</span>
        </div>
      </div>

      <!-- Products Management Table -->
      <div class="products-table-card glass-card mt-5">
        <div class="table-header">
          <h2 class="font-serif">Inventory & Product Catalog</h2>
          <span class="subtitle">Manage image URLs, price, description, and stock per size</span>
        </div>

        <div class="table-wrap mt-3">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Per Size</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products()">
                <td class="product-cell">
                  <img [src]="product.images[0]" [alt]="product.name" class="table-img" />
                  <div>
                    <span class="p-name font-serif">{{ product.name }}</span>
                    <span class="p-slug">{{ product.slug }}</span>
                  </div>
                </td>
                <td><span class="cat-pill">{{ product.category?.name }}</span></td>
                <td class="font-serif">
                  <span class="gold-text">₹{{ ecommerceService.getEffectivePrice(product) }}</span>
                  <span *ngIf="product.salePrice" class="old-price ml-2" style="font-size:0.75rem; text-decoration:line-through; color:#666;">₹{{ product.price }}</span>
                  <div *ngIf="ecommerceService.isSaleActive(product)" class="gold-text" style="font-size:0.6rem; letter-spacing:0.1em; margin-top:2px;">
                    ⚡ TIMER SALE ACTIVE
                  </div>
                </td>
                <td>
                  <div class="stock-chips">
                    <span *ngFor="let s of product.stock" class="chip">
                      {{ s.size }}: <strong>{{ s.quantity }}</strong>
                    </span>
                  </div>
                </td>
                <td>
                  <div style="display:flex; flex-direction:column; gap:4px;">
                    <span class="badge" [class.badge-gold]="product.isFeatured">
                      {{ product.isFeatured ? 'FEATURED' : 'REGULAR' }}
                    </span>
                    <span *ngIf="product.isBogoEnabled" class="bogo-chip" style="font-size:0.55rem; width:fit-content;">
                      🎁 BOGO ACTIVE
                    </span>
                  </div>
                </td>
                <td>
                  <div class="action-btns">
                    <button (click)="openEditProductModal(product)" class="edit-btn" title="Edit Product">
                      ✎ Edit
                    </button>
                    <button (click)="deleteProduct(product.id)" class="delete-btn" title="Delete Product">
                      &times; Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-card glass-card">
          <div class="modal-header">
            <h3 class="font-serif">{{ isEditing() ? 'Edit Luxury Product' : 'Add New Product' }}</h3>
            <button (click)="showModal.set(false)" class="close-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveProduct()" class="modal-form mt-4">
            <div class="form-row">
              <div class="form-group">
                <label>Product Name</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required />
              </div>

              <div class="form-group">
                <label>Category</label>
                <select [(ngModel)]="formData.categorySlug" name="categorySlug" required>
                  <option value="men">Men</option>
                  <option value="kurta">Kurta & Sherwanis</option>
                  <option value="women">Women</option>
                  <option value="chaniya-choli">Chaniya Choli</option>
                  <option value="blouse">Blouse & Corsets</option>
                  <option value="accessories">Accessories</option>
                  <option value="kids">Kids</option>
                  <option value="couple">Couple</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label>Description</label>
              <textarea [(ngModel)]="formData.description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-group mt-3">
              <label>Regular Price (₹)</label>
              <input type="number" [(ngModel)]="formData.price" name="price" step="0.01" (input)="updateSalePriceFromDiscount()" required />
            </div>

            <!-- Sale Toggle Switch & Configurations -->
            <div class="toggle-card glass-card mt-3">
              <div class="toggle-header">
                <div class="toggle-label-wrap">
                  <span class="toggle-title">SALE PROMOTION</span>
                  <span class="toggle-desc">Enable timed discount percentage and automated countdown timer</span>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="formData.isSaleEnabled" name="isSaleEnabled" (change)="onSaleToggleChange()" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="toggle-content mt-3" *ngIf="formData.isSaleEnabled">
                <div class="form-group">
                  <label>Sale Discount (% optional)</label>
                  <input type="number" [(ngModel)]="discountPercentage" name="discountPercentage" placeholder="e.g. 15 for 15% OFF" min="0" max="99" (input)="updateSalePriceFromDiscount()" />
                  <span *ngIf="formData.salePrice && formData.price > 0" class="gold-text" style="font-size:0.65rem; display:block; margin-top:2px;">
                    Calculated Sale Price: ₹{{ formData.salePrice | number:'1.2-2' }}
                  </span>
                </div>

                <div class="form-row mt-3">
                  <div class="form-group">
                    <label>Automated Sale Start Time</label>
                    <input type="datetime-local" [(ngModel)]="formData.saleStartTime" name="saleStartTime" />
                  </div>

                  <div class="form-group">
                    <label>Automated Sale End Time</label>
                    <input type="datetime-local" [(ngModel)]="formData.saleEndTime" name="saleEndTime" />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mt-3">
              <label>Image URLs (comma separated)</label>
              <input type="text" [(ngModel)]="imageUrlsInput" name="imageUrls" placeholder="https://..., https://..." required />
            </div>

            <!-- Stock Per Size Section -->
            <div class="stock-management mt-4">
              <label class="section-label">STOCK COUNT PER SIZE</label>
              <div class="stock-input-grid">
                <div *ngFor="let s of formData.stock; let i = index" class="stock-row">
                  <input type="text" [(ngModel)]="s.size" [name]="'size_' + i" placeholder="Size (e.g. S, M, 40)" />
                  <input type="number" [(ngModel)]="s.quantity" [name]="'qty_' + i" placeholder="Qty" />
                  <button type="button" (click)="removeStockRow(i)" class="remove-row-btn">&times;</button>
                </div>
              </div>
              <button type="button" (click)="addStockRow()" class="luxury-btn-outline add-size-btn mt-2">
                + Add Size Stock Row
              </button>
            </div>

            <div class="form-group mt-3 checkbox-group">
              <input type="checkbox" id="isFeatured" [(ngModel)]="formData.isFeatured" name="isFeatured" />
              <label for="isFeatured">Feature on Home Page Runway</label>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" (click)="showModal.set(false)" class="luxury-btn-outline">Cancel</button>
              <button type="submit" class="luxury-btn-primary">
                {{ isEditing() ? 'Update Product' : 'Upload Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- BOGO Selection Popup Modal -->
      <div class="modal-backdrop" *ngIf="showBogoModal()">
        <div class="modal-card glass-card bogo-popup-card">
          <div class="modal-header">
            <div>
              <h3 class="font-serif">BOGO Promotion Settings</h3>
              <span class="subtitle">Turn ON/OFF BOGO offer instantly for each product</span>
            </div>
            <button (click)="showBogoModal.set(false)" class="close-btn">&times;</button>
          </div>

          <div class="bogo-products-list mt-4">
            <div *ngFor="let p of products()" class="bogo-item-row glass-card">
              <img [src]="p.images[0]" [alt]="p.name" class="bogo-item-img" />
              <div class="bogo-item-info">
                <span class="p-name font-serif">{{ p.name }}</span>
                <span class="gold-text font-serif">₹{{ p.price }}</span>
              </div>
              <div class="bogo-item-toggle">
                <label class="switch">
                  <input type="checkbox" [checked]="p.isBogoEnabled" (change)="toggleProductBogo(p, $event)" />
                  <span class="slider round"></span>
                </label>
                <span class="bogo-status-text" [class.gold-text]="p.isBogoEnabled">
                  {{ p.isBogoEnabled ? 'BOGO ON' : 'OFF' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-actions mt-4">
            <button type="button" (click)="showBogoModal.set(false)" class="luxury-btn-primary">
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 24px 100px;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
    }

    .admin-header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .bogo-header-toggle-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border-glow);
      padding: 10px 18px;
      border-radius: 4px;
      position: relative;
    }

    .bogo-toggle-info {
      display: flex;
      flex-direction: column;
    }

    .bogo-toggle-title {
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: #fff;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bogo-edit-hover-link {
      font-size: 0.65rem;
      color: var(--color-gold-primary);
      text-decoration: underline;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: var(--transition-smooth);
    }

    .bogo-header-toggle-wrap:hover .bogo-edit-hover-link {
      opacity: 1;
      visibility: visible;
    }

    .bogo-toggle-sub {
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      color: var(--color-gold-light);
    }

    /* BOGO Popup List */
    .bogo-popup-card {
      max-width: 550px !important;
    }

    .bogo-products-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 6px;
    }

    .bogo-item-row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 16px;
    }

    .bogo-item-img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
    }

    .bogo-item-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .bogo-item-info .p-name {
      font-size: 0.95rem;
      color: #fff;
    }

    .bogo-item-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bogo-status-text {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      color: #888;
      width: 55px;
    }

    .page-title {
      font-size: 2.8rem;
      color: #fff;
      margin-top: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-top: 40px;
      margin-bottom: 50px;
    }

    .stat-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .stat-title {
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: #888;
    }

    .stat-value {
      font-size: 2.2rem;
      color: #fff;
      margin-top: 6px;
    }

    .products-table-card {
      padding: 30px;
    }

    .table-header h2 {
      font-size: 1.8rem;
      color: #fff;
    }

    .subtitle {
      font-size: 0.85rem;
      color: #888;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .luxury-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .luxury-table th {
      padding: 14px 16px;
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: var(--color-gold-light);
      border-bottom: 1px solid rgba(212,175,55,0.2);
    }

    .luxury-table td {
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.9rem;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .table-img {
      width: 48px;
      height: 60px;
      object-fit: cover;
      border-radius: 2px;
    }

    .p-name {
      display: block;
      color: #fff;
      font-size: 1.05rem;
    }

    .p-slug {
      font-size: 0.7rem;
      color: #666;
    }

    .cat-pill {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: #aaa;
    }

    .stock-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .chip {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 2px;
      color: #ccc;
    }

    .action-btns {
      display: flex;
      gap: 10px;
    }

    .edit-btn {
      color: var(--color-gold-light);
      font-size: 0.8rem;
    }

    .delete-btn {
      color: #ff6b6b;
      font-size: 0.8rem;
    }

    /* Modal */
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
      max-width: 650px;
      padding: 32px;
      max-height: 90vh;
      overflow-y: auto;
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

    .form-group label, .section-label {
      display: block;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      color: #888;
      margin-bottom: 6px;
    }

    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      background: #000;
      border: 1px solid var(--color-border-subtle);
      color: #fff;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 0.85rem;
      outline: none;
      transition: var(--transition-smooth);
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--color-gold-primary);
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.2);
    }

    /* Custom Luxury Date-Time Picker Styling */
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      filter: invert(0.8) sepia(1) saturate(5) hue-rotate(5deg);
      cursor: pointer;
      padding: 4px;
      border-radius: 2px;
      transition: transform 0.2s ease;
    }
    input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
      transform: scale(1.15);
      filter: invert(1) sepia(1) saturate(10) hue-rotate(10deg);
    }

    .toggle-card {
      padding: 16px;
      border: 1px solid rgba(212,175,55,0.2);
    }

    .toggle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toggle-label-wrap {
      display: flex;
      flex-direction: column;
    }

    .toggle-title {
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: var(--color-gold-light);
      font-weight: 600;
    }

    .toggle-desc {
      font-size: 0.65rem;
      color: #888;
      margin-top: 2px;
    }

    /* Switch Slider CSS */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #333;
      transition: .3s;
      border-radius: 22px;
      border: 1px solid #555;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: #fff;
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: var(--color-gold-primary);
      border-color: var(--color-gold-primary);
    }
    input:checked + .slider:before {
      transform: translateX(22px);
      background-color: #000;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stock-input-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stock-row {
      display: grid;
      grid-template-columns: 1fr 1fr 40px;
      gap: 10px;
      align-items: center;
    }

    .stock-row input {
      background: #000;
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      padding: 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .remove-row-btn {
      color: #ff6b6b;
      font-size: 1.4rem;
    }

    .add-size-btn {
      font-size: 0.7rem;
      padding: 6px 12px;
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
  `]
})
export class AdminComponent implements OnInit {
  products = signal<Product[]>([]);
  metrics = signal<any>(null);
  showModal = signal(false);
  showBogoModal = signal(false);
  isEditing = signal(false);
  editingProductId = '';
  imageUrlsInput = '';
  discountPercentage: number | undefined = undefined;

  formData = {
    name: '',
    categorySlug: 'men',
    description: '',
    price: 0,
    salePrice: undefined as number | undefined,
    saleStartTime: '' as string | undefined,
    saleEndTime: '' as string | undefined,
    isSaleEnabled: false,
    isBogoEnabled: false,
    bogoPairProductId: null as string | null,
    isFeatured: false,
    stock: [
      { size: 'S', quantity: 10 },
      { size: 'M', quantity: 10 },
      { size: 'L', quantity: 5 },
    ]
  };

  constructor(
    private authService: AuthService,
    public ecommerceService: EcommerceService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      alert('Access restricted to Admin role.');
      this.router.navigate(['/']);
      return;
    }

    this.loadData();
  }

  loadData() {
    this.ecommerceService.fetchProducts().subscribe(prods => this.products.set(prods));
    this.ecommerceService.fetchAdminMetrics().subscribe(m => this.metrics.set(m));
  }

  isAnyBogoActive(): boolean {
    return this.products().some(p => p.isBogoEnabled);
  }

  openBogoModal() {
    this.showBogoModal.set(true);
  }

  toggleAllBogo(event: any) {
    const enableAll = event.target.checked;
    if (enableAll) {
      this.openBogoModal();
    } else {
      // Disable BOGO for all products
      const prods = this.products();
      prods.forEach(p => {
        if (p.isBogoEnabled) {
          this.ecommerceService.updateProduct(p.id, { isBogoEnabled: false }).subscribe();
        }
      });
      this.products.update(list => list.map(p => ({ ...p, isBogoEnabled: false })));
    }
  }

  toggleProductBogo(product: Product, event: any) {
    const isBogoEnabled = event.target.checked;
    this.ecommerceService.updateProduct(product.id, { isBogoEnabled }).subscribe({
      next: (updated) => {
        this.products.update(list => list.map(p => p.id === updated.id ? { ...p, isBogoEnabled: updated.isBogoEnabled } : p));
      },
      error: (err) => alert(err?.error?.error || 'Failed to update BOGO status')
    });
  }

  otherProductsForBogo(): Product[] {
    return this.products().filter(p => p.id !== this.editingProductId);
  }

  onSaleToggleChange() {
    if (!this.formData.isSaleEnabled) {
      this.discountPercentage = undefined;
      this.formData.salePrice = undefined;
      this.formData.saleStartTime = '';
      this.formData.saleEndTime = '';
    }
  }

  updateSalePriceFromDiscount() {
    if (this.formData.isSaleEnabled && this.discountPercentage !== undefined && this.discountPercentage > 0 && this.formData.price > 0) {
      const discountAmount = (this.formData.price * this.discountPercentage) / 100;
      this.formData.salePrice = Math.round((this.formData.price - discountAmount) * 100) / 100;
    } else {
      this.formData.salePrice = undefined;
    }
  }

  openAddProductModal() {
    this.isEditing.set(false);
    this.editingProductId = '';
    this.imageUrlsInput = '';
    this.discountPercentage = undefined;
    this.formData = {
      name: '',
      categorySlug: 'men',
      description: '',
      price: 0,
      salePrice: undefined,
      saleStartTime: '',
      saleEndTime: '',
      isSaleEnabled: false,
      isBogoEnabled: false,
      bogoPairProductId: null,
      isFeatured: false,
      stock: [
        { size: 'S', quantity: 10 },
        { size: 'M', quantity: 10 },
        { size: 'L', quantity: 5 },
      ]
    };
    this.showModal.set(true);
  }

  openEditProductModal(product: Product) {
    this.isEditing.set(true);
    this.editingProductId = product.id;
    this.imageUrlsInput = product.images ? product.images.join(', ') : '';

    let calculatedDiscount: number | undefined = undefined;
    if (product.price > 0 && product.salePrice && product.salePrice < product.price) {
      calculatedDiscount = Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    this.discountPercentage = calculatedDiscount;

    this.formData = {
      name: product.name,
      categorySlug: product.category?.slug || 'men',
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || undefined,
      saleStartTime: product.saleStartTime ? new Date(product.saleStartTime).toISOString().slice(0, 16) : '',
      saleEndTime: product.saleEndTime ? new Date(product.saleEndTime).toISOString().slice(0, 16) : '',
      isSaleEnabled: !!product.isSaleEnabled,
      isBogoEnabled: !!product.isBogoEnabled,
      bogoPairProductId: product.bogoPairProductId || null,
      isFeatured: product.isFeatured,
      stock: product.stock && product.stock.length > 0
        ? product.stock.map(s => ({ size: s.size, quantity: s.quantity }))
        : [{ size: 'M', quantity: 10 }]
    };
    this.showModal.set(true);
  }

  addStockRow() {
    this.formData.stock.push({ size: '', quantity: 0 });
  }

  removeStockRow(index: number) {
    this.formData.stock.splice(index, 1);
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.ecommerceService.deleteProduct(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert(err?.error?.error || 'Failed to delete')
      });
    }
  }

  saveProduct() {
    const images = this.imageUrlsInput.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      ...this.formData,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'],
    };

    if (this.isEditing()) {
      this.ecommerceService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadData();
        },
        error: (err) => alert(err?.error?.error || 'Update failed')
      });
    } else {
      this.ecommerceService.createProduct(payload).subscribe({
        next: () => {
          this.showModal.set(false);
          this.loadData();
        },
        error: (err) => alert(err?.error?.error || 'Creation failed')
      });
    }
  }
}
