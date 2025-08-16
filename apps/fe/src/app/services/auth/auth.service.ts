import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface JwtPayloadUser {
  sub: string; // resourceId
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

interface LoginResponse {
  ok: boolean;
  requiresMfa?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

interface RegisterResponse {
  ok: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<JwtPayloadUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser = toSignal(this.currentUser$, { requireSync: true });

  private apiUrl = '/api'; // Adjust based on your API endpoint

  constructor() {
    // Try to fetch the current user from cookie-based session on startup
    this.fetchMe().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null),
    });
  }

  private fetchMe(): Observable<JwtPayloadUser> {
    return this.http.get<JwtPayloadUser>(`${this.apiUrl}/auth/me`, {
      withCredentials: true,
    });
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    // Determine if identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const payload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier, password };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        switchMap((response) => {
          if (response.requiresMfa) {
            return new Observable<LoginResponse>((observer) => {
              observer.next(response);
              observer.complete();
            });
          }
          // After login, fetch current user using the cookie
          return this.fetchMe().pipe(
            tap((user) => this.currentUserSubject.next(user)),
            switchMap(
              () =>
                new Observable<LoginResponse>((observer) => {
                  observer.next(response);
                  observer.complete();
                })
            )
          );
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'Login failed')
          );
        })
      );
  }

  verifyMfa(otpCode: string): Observable<LoginResponse> {
    // Placeholder: adjust if MFA is implemented with cookies
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/verify-mfa`,
        { otpCode },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          // After MFA success, refetch user
          this.fetchMe().subscribe({
            next: (user) => this.currentUserSubject.next(user),
            error: () => this.currentUserSubject.next(null),
          });
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'MFA verification failed')
          );
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
        error: () => {
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
      });
  }

  isLoggedIn(): boolean {
    return this.currentUser() != null;
  }

  // Token is no longer available in frontend with HttpOnly cookie
  getToken(): string | null {
    return null;
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
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          // After register, fetch current user
          this.fetchMe().subscribe({
            next: (user) => this.currentUserSubject.next(user),
            error: () => this.currentUserSubject.next(null),
          });
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error?.message || 'Registration failed')
          );
        })
      );
  }
}
