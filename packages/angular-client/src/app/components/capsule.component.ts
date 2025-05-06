import { Component, inject, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';

import type { UserData } from '@repo/validation/data';
import { environment } from '../../environments/environment';
import { InitialsPipe } from '../pipes/initials.pipe';
import { ProfileComponent } from './profile.component';
import { ImageService } from '../services/image.service';
import { DatePipe } from '../pipes/date.pipe';

@Component({
  selector: 'app-capsule',
  imports: [AsyncPipe, DatePipe, RouterLink, ProfileComponent, InitialsPipe],
  template: `
    <a
      [routerLink]="['/capsule', id()]"
      class="group flex flex-col w-full border border-zinc-100 rounded-3xl overflow-hidden"
    >
      @if (image$ | async; as image) {
        <img
          [src]="image"
          [alt]="imageName()"
          class="max-h-[60vh] object-cover w-full"
        />
      }

      <div
        class="flex flex-col gap-1 p-3 bg-white transition group-hover:bg-zinc-100"
      >
        <h3 class="text-xl font-black">{{ title() }}</h3>
        <div class="flex justify-between items-end">
          <div class="flex -space-x-3">
            @for (sender of senders(); track id) {
              <app-profile
                [src]="getUserImageSrc(sender._id)"
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

  private imageService = inject(ImageService);
  image$: Observable<string | null> = of(null);

  ngOnInit() {
    const name = this.imageName();
    if (!name) return;

    this.image$ = this.imageService.capsule(this.id(), name);
  }

  protected getUserImageSrc(id: string) {
    return `${environment.serverUrl}/users/${id}/image`;
  }
}
