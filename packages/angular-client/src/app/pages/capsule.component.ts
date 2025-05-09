import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, type Observable } from 'rxjs';

import type { CapsuleData } from '@repo/validation/data';
import { ImageService } from '../services/image.service';
import { CapsuleService } from '../services/capsule.service';
import { DatePipe } from '../pipes/date.pipe';
import { CountdownComponent } from '../components/countdown.component';
import { ImageComponent } from '../components/image.component';
import { ProfilesComponent } from '../components/profiles.component';
import { CapsuleOptionsComponent } from '../components/capsule-options.component';

@Component({
  selector: 'app-capsule-page',
  imports: [
    AsyncPipe,
    CountdownComponent,
    DatePipe,
    ImageComponent,
    ProfilesComponent,
    CapsuleOptionsComponent,
  ],
  template: `
    <main
      class="main max-w-5xl gap-8 md:flex-row md:items-start md:justify-between"
    >
      @if (capsule$ | async; as capsule) {
        @if (capsule.state === 'sealed') {
          <app-countdown
            [openDate]="capsule.openDate"
            openAction="reload"
            class="md:flex-1"
          />
          <div class="flex flex-col md:flex-1">
            <app-capsule-options
              [id]="capsule._id"
              [state]="capsule.state"
              [senders]="capsule.senders"
            />
          </div>
        } @else {
          <article>
            <header class="flex justify-between gap-4 mb-0.5">
              <h1 class="text-xl font-black">{{ capsule.title }}</h1>
              @if (capsule.state === 'opened') {
                <time
                  [attr.datetime]="capsule.openDate"
                  class="text-sm text-zinc-600 whitespace-nowrap"
                >
                  {{ capsule.openDate | date: 'distance-to-now' }}
                </time>
              } @else {
                <span class="text-sm text-primary-bright whitespace-nowrap">
                  Not sealed yet!
                </span>
              }
            </header>

            @if (capsule.content) {
              <p>{{ capsule.content }}</p>
            }

            @if (capsule.images.length > 0) {
              <div class="flex flex-wrap gap-1 mt-4">
                @for (image of capsule.images; track image.name) {
                  <app-image
                    [src]="imageService.capsule(capsule._id, image.name)"
                    [alt]="image.name"
                    classes="h-36 object-cover border border-white rounded-2xl md:h-40"
                  />
                }
              </div>
            }
          </article>

          <div
            class="flex flex-col gap-8 w-full md:flex-1 md:items-end md:gap-6"
          >
            <div class="flex gap-8 md:flex-col md:gap-4 md:order-2 *:flex-1">
              <app-profiles label="From" [profiles]="capsule.senders" />
              @if (capsule.receivers.length > 0) {
                <app-profiles label="To" [profiles]="capsule.receivers" />
              }
            </div>
            <app-capsule-options
              [id]="capsule._id"
              [state]="capsule.state"
              [senders]="capsule.senders"
            />
          </div>
        }
      }
    </main>
  `,
})
export class CapsulePageComponent {
  private capsuleService = inject(CapsuleService);
  capsule$!: Observable<CapsuleData>;

  protected imageService = inject(ImageService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const { id } = params;
      this.capsuleService.getOne({ id }).subscribe({
        next: (capsule) => {
          this.capsule$ = of(capsule);
        },
        error: () => {
          this.router.navigate(['/not-found']);
        },
      });
    });
  }
}
