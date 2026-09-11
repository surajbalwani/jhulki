import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User } from '../models/ecommerce.model';

export const API_URL = 'http://localhost:5292/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadStorage();
  }

  private loadStorage() {
    const savedToken = localStorage.getItem('jhulki_token');
    const savedUser = localStorage.getItem('jhulki_user');

    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/signup`, data).pipe(
      tap((res: any) => {
        if (res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, data).pipe(
      tap((res: any) => {
        if (res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  private setSession(token: string, user: User) {
    this.token.set(token);
    this.currentUser.set(user);
    localStorage.setItem('jhulki_token', token);
    localStorage.setItem('jhulki_user', JSON.stringify(user));
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('jhulki_token');
    localStorage.removeItem('jhulki_user');
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return u?.role === 'ADMIN' || u?.role === 'SUPER_ADMIN';
  }

  getUser(): User | null {
    return this.currentUser();
  }

  setUser(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('jhulki_user', JSON.stringify(user));
  }
}
