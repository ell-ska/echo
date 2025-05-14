import { Component, input, output, signal } from '@angular/core';

import { cn } from '../../utils/classname';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="flex gap-3 items-center">
      <button
        (click)="toggle()"
        [class]="
          cn([
            'flex w-11 h-6 rounded-full bg-zinc-200 p-1 transition',
            state() && 'justify-end bg-primary-bright',
          ])
        "
      >
        <div class="size-4 bg-white rounded-full"></div>
      </button>
      <span>{{ label() }}</span>
    </div>
  `,
})
export class ToggleComponent {
  label = input.required<string>();
  initial = input<boolean>(false);

  state = signal(false);
  toggled = output<boolean>();

  ngOnInit() {
    this.state.set(this.initial());
  }

  toggle() {
    this.state.update((value) => !value);
    this.toggled.emit(this.state());
  }

  cn = cn;
}
