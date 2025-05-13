import { Component, computed, inject, input, signal } from '@angular/core';

import { ImageService } from '../services/image.service';
import { ImageComponent } from './image.component';
import { cn } from '../../utils/classname';

@Component({
  selector: 'app-profile',
  template: `
    <div class="flex gap-2 items-center">
      <app-image [src]="src()" [alt]="alt()" [classes]="getClasses('image')">
        <div fallback [className]="getClasses('initials')">
          {{ initials() }}
        </div>
      </app-image>
      @if (showUsername()) {
        <span class="truncate">{{ '@' + username() }}</span>
      }
    </div>
  `,
  imports: [ImageComponent],
})
export class ProfileComponent {
  id = input.required<string>();
  username = input.required<string>();
  size = input<'md' | 'lg'>('md');
  initials = input<string>();
  showUsername = input(false);

  private imageService = inject(ImageService);
  protected src = signal<string | null>(null);
  protected alt = computed(() => `${this.username}'s profile picture`);

  protected getClasses(type: 'image' | 'initials') {
    return cn(
      'rounded-full border border-white',
      this.size() === 'md' && 'size-8 text-sm font-bold',
      this.size() === 'lg' && 'size-20 text-2xl font-black',
      type === 'initials' &&
        'bg-primary-subtle flex items-center justify-center text-primary-bright uppercase',
      type === 'image' && 'object-cover object-center',
    );
  }

  ngOnInit() {
    if (this.id() === 'me') {
      this.src.set(this.imageService.me());
    } else {
      this.src.set(this.imageService.user(this.id()));
    }
  }
}
