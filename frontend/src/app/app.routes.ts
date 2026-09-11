import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Jhulki | Haute Couture & Luxury Apparel' },
  { path: 'products', component: ProductsComponent, title: 'Collections | Jhulki Luxury' },
  { path: 'product/:id', component: ProductDetailComponent, title: 'Product Details | Jhulki Luxury' },
  { path: 'cart', component: CartComponent, title: 'Shopping Bag | Jhulki Luxury' },
  { path: 'wishlist', component: WishlistComponent, title: 'Wishlist | Jhulki Luxury' },
  { path: 'profile', component: ProfileComponent, title: 'My Account | Jhulki Luxury' },
  { path: 'admin', component: AdminComponent, title: 'Admin Atelier | Jhulki Luxury' },
  { path: 'auth', component: AuthComponent, title: 'Sign In / Register | Jhulki Luxury' },
  { path: '**', redirectTo: '' }
];
