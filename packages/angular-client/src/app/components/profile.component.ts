import { Component, computed, input, signal } from '@angular/core';

import { cn } from '../../utils/classname';

@Component({
  selector: 'app-profile',
  template: `
    @if (!hasError()) {
      <img
        [src]="src()"
        (error)="onError()"
        [className]="getClasses('image')"
      />
    } @else {
      <div [className]="getClasses('initials')">{{ initials() }}</div>
    }
  `,
})
export class ProfileComponent {
  size = input<'md' | 'lg'>('md');
  initials = input<string>();
  src = input<string>();

  protected hasError = signal(false);

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

  protected onError() {
    this.hasError.set(true);
  }
}
