import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from '@repo/validation/data';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  autocomplete(query: string) {
    return this.http.get<UserData[]>('/users/autocomplete', {
      params: { query },
    });
  }
}
