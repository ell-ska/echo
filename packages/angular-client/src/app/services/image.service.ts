import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient);

  private get(endpoint: string) {
    return this.http
      .get<Blob>(endpoint, { responseType: 'blob' as 'json' })
      .pipe(
        map((blob) => URL.createObjectURL(blob)),
        catchError(() => {
          return of(null);
        }),
      );
  }

  capsule(id: string, name: string) {
    return this.get(`/capsules/${id}/images/${name}`);
  }

  user(id: string) {
    return `${environment.serverUrl}/users/${id}/image`;
  }

  me() {
    return `${environment.serverUrl}/users/me/image`;
  }
}
