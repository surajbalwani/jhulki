import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, CartItem, WishlistItem, Address, Order } from '../models/ecommerce.model';
import { AuthService, API_URL } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {
  products = signal<Product[]>([]);
  cartItems = signal<CartItem[]>([]);
  wishlistItems = signal<WishlistItem[]>([]);
  addresses = signal<Address[]>([]);
  orders = signal<Order[]>([]);

  constructor(private http: HttpClient, private auth: AuthService) {}

  fetchProducts(categorySlug?: string, search?: string, sort?: string): Observable<Product[]> {
    let query = `${API_URL}/products?`;
    if (categorySlug && categorySlug !== 'all') query += `category=${categorySlug}&`;
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (sort) query += `sort=${sort}`;

    return this.http.get<Product[]>(query).pipe(
      tap(res => this.products.set(res))
    );
  }

  getProduct(idOrSlug: string): Observable<Product> {
    return this.http.get<Product>(`${API_URL}/products/${idOrSlug}`);
  }

  createProduct(data: any): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/products`, data).pipe(
      tap(() => this.fetchProducts().subscribe())
    );
  }

  updateProduct(id: string, data: any): Observable<Product> {
    return this.http.put<Product>(`${API_URL}/products/${id}`, data).pipe(
      tap(() => this.fetchProducts().subscribe())
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/products/${id}`).pipe(
      tap(() => this.fetchProducts().subscribe())
    );
  }

  fetchCart(): Observable<CartItem[]> {
    const user = this.auth.getUser();
    if (!user) return new Observable(obs => obs.next([]));
    return this.http.get<CartItem[]>(`${API_URL}/cart?userId=${user.id}`).pipe(
      tap(res => this.cartItems.set(res))
    );
  }

  addToCart(productId: string, size: string, quantity: number = 1): Observable<CartItem> {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    return this.http.post<CartItem>(`${API_URL}/cart`, {
      userId: user.id,
      productId,
      size,
      quantity
    }).pipe(
      tap(() => this.fetchCart().subscribe())
    );
  }

  removeFromCart(cartItemId: string): Observable<any> {
    return this.http.delete(`${API_URL}/cart?id=${cartItemId}`).pipe(
      tap(() => this.fetchCart().subscribe())
    );
  }

  fetchWishlist(): Observable<WishlistItem[]> {
    const user = this.auth.getUser();
    if (!user) return new Observable(obs => obs.next([]));
    return this.http.get<WishlistItem[]>(`${API_URL}/wishlist?userId=${user.id}`).pipe(
      tap(res => this.wishlistItems.set(res))
    );
  }

  toggleWishlist(productId: string): Observable<any> {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    return this.http.post(`${API_URL}/wishlist`, {
      userId: user.id,
      productId
    }).pipe(
      tap(() => this.fetchWishlist().subscribe())
    );
  }

  isProductWishlisted(productId: string): boolean {
    return this.wishlistItems().some(w => w.productId === productId);
  }

  fetchAddresses(): Observable<Address[]> {
    const user = this.auth.getUser();
    if (!user) return new Observable(obs => obs.next([]));
    return this.http.get<Address[]>(`${API_URL}/address?userId=${user.id}`).pipe(
      tap(res => this.addresses.set(res))
    );
  }

  addAddress(address: Partial<Address>): Observable<Address> {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    return this.http.post<Address>(`${API_URL}/address`, {
      ...address,
      userId: user.id
    }).pipe(
      tap(() => this.fetchAddresses().subscribe())
    );
  }

  checkoutOrder(totalAmount: number, shippingAddress: Address, paymentMethod: string): Observable<Order> {
    const user = this.auth.getUser();
    if (!user) throw new Error('User not logged in');

    return this.http.post<Order>(`${API_URL}/orders`, {
      userId: user.id,
      items: this.cartItems(),
      totalAmount,
      shippingAddress,
      paymentMethod
    }).pipe(
      tap(() => {
        this.fetchCart().subscribe();
        this.fetchOrders().subscribe();
      })
    );
  }

  fetchOrders(): Observable<Order[]> {
    const user = this.auth.getUser();
    if (!user) return new Observable(obs => obs.next([]));
    return this.http.get<Order[]>(`${API_URL}/orders?userId=${user.id}`).pipe(
      tap(res => this.orders.set(res))
    );
  }

  fetchAdminMetrics(): Observable<any> {
    return this.http.get(`${API_URL}/admin/metrics`);
  }
}
