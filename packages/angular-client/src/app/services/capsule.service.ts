import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CapsuleData } from '@repo/validation/data';

@Injectable({
  providedIn: 'root',
})
export class CapsuleService {
  private http = inject(HttpClient);

  getPublic({ type }: { type: string }) {
    const params = new HttpParams().set('type', type);

    return this.http.get<CapsuleData[]>('/capsules/public', {
      params,
    });
  }
}
