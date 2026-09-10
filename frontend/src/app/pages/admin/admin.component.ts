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

        <button (click)="openAddProductModal()" class="luxury-btn-primary">
          + ADD NEW LUXURY PRODUCT
        </button>
      </div>

      <!-- Dashboard Telemetry Stats -->
      <div class="stats-grid mt-4" *ngIf="metrics()">
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
                <td class="font-serif gold-text">₹{{ product.salePrice || product.price }}</td>
                <td>
                  <div class="stock-chips">
                    <span *ngFor="let s of product.stock" class="chip">
                      {{ s.size }}: <strong>{{ s.quantity }}</strong>
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge" [class.badge-gold]="product.isFeatured">
                    {{ product.isFeatured ? 'YES' : 'NO' }}
                  </span>
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
                  <option value="women">Women</option>
                  <option value="accessories">Accessories</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label>Description</label>
              <textarea [(ngModel)]="formData.description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-row mt-3">
              <div class="form-group">
                <label>Regular Price (₹)</label>
                <input type="number" [(ngModel)]="formData.price" name="price" step="0.01" required />
              </div>

              <div class="form-group">
                <label>Sale Price (₹ optional)</label>
                <input type="number" [(ngModel)]="formData.salePrice" name="salePrice" step="0.01" />
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
  isEditing = signal(false);
  editingProductId = '';
  imageUrlsInput = '';

  formData = {
    name: '',
    categorySlug: 'men',
    description: '',
    price: 0,
    salePrice: undefined as number | undefined,
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

  openAddProductModal() {
    this.isEditing.set(false);
    this.editingProductId = '';
    this.imageUrlsInput = '';
    this.formData = {
      name: '',
      categorySlug: 'men',
      description: '',
      price: 0,
      salePrice: undefined,
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
    this.formData = {
      name: product.name,
      categorySlug: product.category?.slug || 'men',
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || undefined,
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
