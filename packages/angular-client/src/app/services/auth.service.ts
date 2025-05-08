import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';

import type { LoginValues, RegisterValues } from '@repo/validation/actions';
import type { TokenData, UserData } from '@repo/validation/data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private accessTokenKey = 'access-token';
  private isRefetching = false;

  setAccessToken(accessToken: string) {
    localStorage.setItem(this.accessTokenKey, accessToken);
  }

  clearAccessToken() {
    localStorage.removeItem(this.accessTokenKey);
  }

  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  register(values: RegisterValues) {
    return this.http
      .post<TokenData>('/auth/register', values)
      .pipe(this.accessTokenTap);
  }

  login(values: LoginValues) {
    return this.http
      .post<TokenData>('/auth/log-in', values)
      .pipe(this.accessTokenTap);
  }

  logout() {
    this.clearAccessToken();
    return this.http.delete('/auth/log-out');
  }

  refresh() {
    return this.http.post<TokenData>('/auth/token/refresh', null).pipe(
      this.accessTokenTap,
      catchError(() => {
        this.clearAccessToken();
        return of(null);
      }),
    );
  }

  getCurrentUser() {
    if (this.isRefetching) return of(null);
    this.isRefetching = true;

    return this.http.get<UserData>('/users/me').pipe(
      catchError(() => {
        return of(null);
      }),
      finalize(() => {
        this.isRefetching = false;
      }),
    );
  }

  private accessTokenTap = tap(({ accessToken }) => {
    this.setAccessToken(accessToken);
  });
}
