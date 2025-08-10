import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  resourceId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  requiresMfa?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser = toSignal(this.currentUser$, { requireSync: true });

  private tokenKey = 'auth_token';
  private apiUrl = '/api'; // Adjust based on your API endpoint

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        // In a real app, you might want to validate the token with the server
        // or decode a JWT token to get user info
        const userData = this.parseJwt(token);
        this.currentUserSubject.next(userData.user);
      } catch (error) {
        localStorage.removeItem(this.tokenKey);
        this.currentUserSubject.next(null);
      }
    }
  }

  private parseJwt(token: string): any {
    try {
      // This is a simple JWT parser for demonstration
      // In production, use a proper JWT library
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    // Determine if identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const payload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier, password };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          if (!response.requiresMfa) {
            this.handleSuccessfulLogin(response);
          }
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'Login failed')
          );
        })
      );
  }

  verifyMfa(otpCode: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/verify-mfa`, { otpCode })
      .pipe(
        tap((response) => {
          this.handleSuccessfulLogin(response);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'MFA verification failed')
          );
        })
      );
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    console.log({ response });
    localStorage.setItem(this.tokenKey, response.token);
    console.log({ jwt: this.parseJwt(response.token) });
    this.currentUserSubject.next(this.parseJwt(response.token));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    console.log({ currentUser: this.currentUser() });
    return this.currentUser() != null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(
    email: string,
    password: string,
    name: string,
    phoneNumber?: string
  ): Observable<RegisterResponse> {
    const payload: RegisterRequest = {
      email,
      password,
      name,
      ...(phoneNumber ? { phoneNumber } : {}),
    };

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'Registration failed')
          );
        })
      );
  }
}
