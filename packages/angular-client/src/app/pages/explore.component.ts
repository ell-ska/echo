import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { type Observable } from 'rxjs';

import type { UserData, CapsuleData } from '@repo/validation/data';
import { CapsuleService } from '../services/capsule.service';
import { AuthService } from '../services/auth.service';
import { CapsuleComponent } from '../components/capsule.component';
import { CountdownComponent } from '../components/countdown.component';
import { TabsComponent } from '../components/tabs.component';

@Component({
  selector: 'app-explore-page',
  imports: [AsyncPipe, CapsuleComponent, CountdownComponent, TabsComponent],
  template: `
    <main class="main max-w-sm gap-6">
      @for (capsule of capsules$ | async; track capsule._id) {
        @if (capsule.state === 'opened') {
          <app-capsule
            [id]="capsule._id"
            [title]="capsule.title"
            [openDate]="capsule.openDate"
            [senders]="capsule.senders"
            [imageName]="
              capsule.images.length ? capsule.images[0].name : undefined
            "
          />
        }

        @if (capsule.state === 'sealed') {
          <app-countdown
            [openDate]="capsule.openDate"
            openAction="link"
            [id]="capsule._id"
          />
        }
      }

      @if (user$ | async; as user) {
        <app-tabs
          [tabs]="tabs()"
          classes="fixed top-3 left-1/2 -translate-x-1/2 z-50 md:top-auto md:bottom-8"
        />
      } @else {
        <app-tabs
          [tabs]="tabs()"
          classes="fixed bottom-8 left-1/2 -translate-x-1/2"
        />
      }
    </main>
  `,
})
export class ExplorePageComponent {
  private capsuleService = inject(CapsuleService);
  capsules$!: Observable<CapsuleData[]>;

  private auth = inject(AuthService);
  user$!: Observable<UserData | null>;

  private route = inject(ActivatedRoute);

  tabs = signal([
    { label: 'Opened', routerLink: '/', params: { type: 'opened' } },
    { label: 'Sealed', routerLink: '/', params: { type: 'sealed' } },
  ]);

  ngOnInit() {
    this.user$ = this.auth.getCurrentUser();

    this.route.queryParamMap.subscribe((params) => {
      const type = params.get('type') || 'opened';
      this.capsules$ = this.capsuleService.getPublic({ type });
    });
  }
}
