import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import type { CapsuleData, UserData } from '@repo/validation/data';
import { CapsuleService } from '../services/capsule.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-capsule-options',
  imports: [ButtonComponent, RouterLink],
  template: `
    @if (isSender()) {
      <div class="flex justify-end gap-2 md:order-1">
        <app-button
          label="Delete"
          size="sm"
          variant="secondary"
          (onClick)="deleteCapsule()"
        />

        @if (state() === 'unsealed') {
          <app-button
            label="Edit"
            [routerLink]="['/capsule', id(), '/edit']"
            size="sm"
          />
        }
      </div>
    }
  `,
})
export class CapsuleOptionsComponent {
  id = input.required<CapsuleData['_id']>();
  state = input.required<CapsuleData['state']>();
  senders = input.required<UserData[]>();

  private capsuleService = inject(CapsuleService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  private user = toSignal(this.authService.getCurrentUser(), {
    initialValue: null,
  });

  isSender = computed(() => {
    const user = this.user();

    if (!user) {
      return false;
    }

    return this.senders().some((sender) => sender._id === user._id);
  });

  deleteCapsule() {
    this.capsuleService.delete({ id: this.id() }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.toastService.error({
          message:
            error.error?.error ??
            'Something went wrong when deleting the capsule',
        });
      },
    });
  }
}
