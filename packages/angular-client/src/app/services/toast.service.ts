import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AlertCircle, type LucideIconData } from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private colorMap: Record<Type, Color> = {
    error: 'warning-bright',
  };
  private iconMap: Record<Type, LucideIconData> = {
    error: AlertCircle,
  };

  private toasts = new BehaviorSubject<Toast[]>([]);
  private duration = 3000;

  readonly toasts$ = this.toasts.asObservable();

  getToasts() {
    return this.toasts$;
  }

  close(id: Toast['id']) {
    const toasts = this.toasts.value;
    this.toasts.next(toasts.filter((toast) => toast.id !== id));
  }

  error(values: Pick<Toast, 'message'>) {
    const type = 'error';

    const toast: Toast = {
      ...values,
      id: uuid(),
      type,
      icon: this.iconMap[type],
      color: this.colorMap[type],
    };
    const toasts = [...this.toasts.value, toast];

    this.toasts.next(toasts);

    setTimeout(() => {
      this.close(toast.id);
    }, this.duration);
  }
}

export type Toast = {
  message: string;
  id: string;
  type: Type;
  icon: LucideIconData;
  color: string;
};

type Type = 'error';

type Color = 'warning-bright';
