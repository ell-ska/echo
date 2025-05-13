import { Component, input } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
} from '@angular/forms';
import { LucideAngularModule, X, type LucideIconData } from 'lucide-angular';

import { ButtonComponent } from './button.component';
import { cn } from '../../utils/classname';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="flex flex-col gap-1">
      <div
        [class]="
          cn(
            'relative flex items-center gap-2 w-full px-4 py-2 bg-zinc-100 text-base text-zinc-800 outline-none rounded-lg border border-transparent',
            'has-focus-visible:border-primary-bright',
            showError() && 'border-warning-bright'
          )
        "
      >
        @if (icon()) {
          <lucide-icon [img]="icon()" class="size-4 text-zinc-600" />
        }

        @if (textarea()) {
          <textarea
            [formControl]="control()"
            [name]="name()"
            [id]="name()"
            [placeholder]="label()"
            class="peer w-full outline-0 min-h-56 resize-none placeholder:text-transparent"
          ></textarea>
        } @else {
          <input
            [formControl]="control()"
            [type]="type()"
            [name]="name()"
            [id]="name()"
            [placeholder]="label()"
            class="peer w-full outline-0 placeholder:text-transparent"
          />
        }

        @if (clearButton() && control().value) {
          <app-button
            [icon]="x"
            variant="tertiary"
            size="sm"
            (onClick)="clear()"
          />
        }

        <label
          [for]="name()"
          [class]="
            cn(
              'absolute -top-4 left-2 cursor-text text-xs text-slate-500 transition-all',
              'peer-focus-visible:text-primary-bright peer-focus-visible:-top-4 peer-focus-visible:left-2 peer-focus-visible:text-xs',
              'peer-placeholder-shown:left-4 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base',
              icon() && 'peer-placeholder-shown:left-10',
              showError() && '-top-4 peer-focus-visible:-top-4'
            )
          "
        >
          {{ label() }}
        </label>
      </div>
      @if (showError()) {
        <span class="text-sm text-warning-bright">{{ error() }}</span>
      }
    </div>
  `,
})
export class InputComponent {
  control = input.required<FormControl>();
  label = input.required<string>();
  name = input.required<string>();
  icon = input<LucideIconData>();
  error = input<string | null>(null);
  type = input<HTMLElementTagNameMap['input']['type']>('text');
  textarea = input(false);
  clearButton = input(false);

  readonly x = X;

  cn = cn;

  clear() {
    this.control().reset();
  }

  showError() {
    return this.error() && (this.control().dirty || this.control().touched);
  }

  getInputClasses() {
    return cn(
      'peer w-full px-4 py-2 bg-zinc-100 text-base text-zinc-800 outline-none rounded-lg border border-transparent placeholder:text-transparent',
      'focus-visible:border-primary-bright',
      this.textarea() && 'min-h-56 resize-none',
      this.showError() && 'border-warning-bright',
    );
  }
}

export const getValidationError = (
  errors: ValidationErrors | null,
  messages: Record<string, string>,
) => {
  if (!errors) {
    return null;
  }

  const key = Object.keys(errors)[0];
  return messages[key];
};
