import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import type { CapsuleData } from '@repo/validation/data';
import type { CapsuleValues } from '@repo/validation/actions';
import { createFormData } from '../../utils/create-form-data';

export type Values = Omit<CapsuleValues, 'openDate'> & {
  openDate: Date | undefined;
};

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

  getOne({ id }: { id: string }) {
    return this.http.get<CapsuleData>(`/capsules/${id}`);
  }

  create({ values }: { values: Values }) {
    return this.http.post<{ id: string }>('/capsules', createFormData(values));
  }

  edit({ id, values }: { id: string; values: Values }) {
    return this.http.put<{ id: string }>(
      `/capsules/${id}`,
      createFormData(values),
    );
  }

  delete({ id }: { id: string }) {
    return this.http.delete(`/capsules/${id}`);
  }
}
