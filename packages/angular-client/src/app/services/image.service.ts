import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

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
    return `/users/${id}/image`;
  }

  me() {
    return '/users/me/image';
  }
}
