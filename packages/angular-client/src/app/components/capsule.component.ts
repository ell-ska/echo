import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { UserData } from '@repo/validation/data';
import { InitialsPipe } from '../pipes/initials.pipe';
import { ProfileComponent } from './profile.component';
import { ImageService } from '../services/image.service';
import { DatePipe } from '../pipes/date.pipe';
import { ImageComponent } from './image.component';

@Component({
  selector: 'app-capsule',
  imports: [
    DatePipe,
    RouterLink,
    ProfileComponent,
    InitialsPipe,
    ImageComponent,
  ],
  template: `
    <a
      [routerLink]="['/capsule', id()]"
      class="group flex flex-col w-full border border-zinc-100 rounded-3xl overflow-hidden"
    >
      @if (imageName()) {
        <app-image
          [src]="this.imageService.capsule(id(), imageName()!)"
          [alt]="imageName()!"
          classes="max-h-[60vh] object-cover w-full"
        />
      }

      <div
        class="flex flex-col gap-1 p-3 bg-white transition group-hover:bg-zinc-100"
      >
        <h3 class="text-xl font-black">{{ title() }}</h3>
        <div class="flex justify-between items-end">
          <div class="flex -space-x-3">
            @for (sender of senders(); track sender._id) {
              <app-profile
                [id]="sender._id"
                [username]="sender.username"
                [initials]="sender | initials"
              />
            }
          </div>
          <time [attr.datetime]="openDate()" class="text-sm text-zinc-600">
            {{ openDate() | date: 'distance-to-now' }}
          </time>
        </div>
      </div>
    </a>
  `,
})
export class CapsuleComponent {
  id = input.required<string>();
  title = input.required<string>();
  openDate = input.required<Date>();
  senders = input.required<UserData[]>();
  imageName = input<string>();

  protected imageService = inject(ImageService);
}
