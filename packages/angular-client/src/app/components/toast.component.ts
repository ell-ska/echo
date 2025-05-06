import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { type Toast, ToastService } from '../services/toast.service';
import { AsyncPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  imports: [AsyncPipe, LucideAngularModule],
  template: `
    @if (toasts$ | async; as toasts) {
      <div
        class="fixed z-50 flex gap-2 flex-col top-header-sm pt-3 left-4 right-4 md:pt-0 md:left-auto md:top-auto md:right-6 md:bottom-6"
      >
        @for (toast of toasts; track toast.id) {
          <div
            class="flex gap-2 items-center py-3 pl-4 pr-6 min-w-80 rounded-full bg-white border border-warning-bright text-warning-bright text-sm shadow-float sm:max-w-sm "
          >
            <lucide-icon [img]="toast.icon" class="size-4 shrink-0" />
            <span class="text-pretty">{{ toast.message }}</span>
          </div>
        }
      </div>
    }
  `,
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  private toastService = inject(ToastService);

  constructor() {
    this.toasts$ = this.toastService.getToasts();
  }
}
