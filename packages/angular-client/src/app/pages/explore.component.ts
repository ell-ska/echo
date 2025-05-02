import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { type Observable } from 'rxjs';

import { type CapsuleData } from '@repo/validation/data';
import { CapsuleService } from '../services/capsule.service';
import { CapsuleComponent } from '../components/capsule.component';
import { CountdownComponent } from '../components/countdown.component';
import { TabsComponent } from '../components/tabs.component';

@Component({
  selector: 'app-explore-page',
  imports: [AsyncPipe, CapsuleComponent, CountdownComponent, TabsComponent],
  template: `
    <main
      class="mt-header-sm md:mt-header-md pt-4 px-4 max-w-sm flex flex-col gap-6 w-full"
    >
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

      <app-tabs
        [tabs]="[
          { label: 'Opened', routerLink: '/', params: { type: 'opened' } },
          { label: 'Sealed', routerLink: '/', params: { type: 'sealed' } },
        ]"
        classes="fixed bottom-8 left-1/2 -translate-x-1/2"
      />
    </main>
  `,
})
export class ExplorePageComponent {
  private capsuleService = inject(CapsuleService);
  capsules$!: Observable<CapsuleData[]>;

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const type = params.get('type') || 'opened';
      this.capsules$ = this.capsuleService.getPublic({ type });
    });
  }
}
