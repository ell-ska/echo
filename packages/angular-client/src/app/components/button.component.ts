import { Component, computed, input, output } from '@angular/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

import { cn } from '../../utils/classname';

const variants = cva(
  'flex gap-2 items-center justify-center rounded-full border border-transparent cursor-pointer whitespace-nowrap w-full transition',
  {
    variants: {
      variant: {
        primary: ['bg-zinc-800 text-white', 'hover:bg-zinc-700'],
        secondary: [
          'bg-white text-zinc-800 border-zinc-800',
          'hover:bg-zinc-800 hover:text-white',
        ],
        tertiary: ['bg-transparent text-zinc-800', 'hover:bg-slate-200'],
      },
      size: {
        sm: 'text-xs py-2 px-4',
        md: 'text-base py-2 px-6',
      },
      shape: {
        pill: '',
        round: '',
      },
    },
    compoundVariants: [
      {
        shape: 'round',
        size: 'sm',
        class: 'size-6 p-0',
      },
      {
        shape: 'round',
        size: 'md',
        class: 'size-8 p-0',
      },
    ],
  },
);

@Component({
  selector: 'app-button',
  imports: [LucideAngularModule],
  template: `
    @if (href()) {
      <a [href]="href()" [class]="class()">
        @if (label()) {
          <span>{{ label() }}</span>
        }

        @if (icon()) {
          <lucide-icon [img]="icon()" [class]="iconClass()" />
        }
      </a>
    } @else {
      <button [type]="type()" [class]="class()" (click)="onClick.emit()">
        @if (label()) {
          <span>{{ label() }}</span>
        }

        @if (icon()) {
          <lucide-icon [img]="icon()" [class]="iconClass()" />
        }
      </button>
    }
  `,
})
export class ButtonComponent {
  label = input<string>();
  icon = input<LucideIconData>();
  variant = input<'primary' | 'secondary' | 'tertiary'>('primary');
  size = input<'sm' | 'md'>('md');
  classes = input<string>();

  href = input<string>();
  onClick = output();
  type = input<HTMLButtonElement['type']>();

  protected iconClass = computed(() =>
    cn(this.size() === 'sm' && 'size-4', this.size() === 'md' && 'size-6'),
  );

  protected class = computed(() =>
    cn(
      variants({
        variant: this.variant(),
        shape: this.icon() ? 'round' : 'pill',
        size: this.size(),
      }),
      this.classes,
    ),
  );
}
