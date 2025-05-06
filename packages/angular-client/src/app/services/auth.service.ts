import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';

import type { RegisterValues } from '@repo/validation/actions';
import type { TokenData } from '@repo/validation/data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private accessToken: string | null = null;

  register(values: RegisterValues) {
    return this.http.post<TokenData>('/auth/register', values).pipe(
      tap(({ accessToken }) => {
        this.accessToken = accessToken;
      }),
    );
  }
}
