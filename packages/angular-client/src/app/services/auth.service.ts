import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';

import type { LoginValues, RegisterValues } from '@repo/validation/actions';
import type { TokenData, UserData } from '@repo/validation/data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private accessToken: string | null = null;

  getAccessToken() {
    return this.accessToken;
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
    this.accessToken = null;
    return this.http.delete('/auth/log-out');
  }

  refresh() {
    this.http.post<TokenData>('/auth/token/refresh', null).subscribe({
      next: ({ accessToken }) => {
        this.accessToken = accessToken;
      },
      error: () => {
        this.accessToken = null;
      },
    });
  }

  getCurrentUser() {
    return this.http.get<UserData>('/users/me').subscribe({
      next: (data) => {
        return data;
      },
      error: () => {
        return null;
      },
    });
  }

  private accessTokenTap = tap(({ accessToken }) => {
    this.accessToken = accessToken;
  });
}
