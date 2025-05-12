import { Component, input } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
} from '@angular/forms';

import { cn } from '../../utils/classname';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  template: `
    <div class="group relative flex flex-col gap-1">
      @if (textarea()) {
        <textarea
          [formControl]="control()"
          [name]="name()"
          [id]="name()"
          [placeholder]="label()"
          [class]="getInputClasses()"
        ></textarea>
      } @else {
        <input
          [formControl]="control()"
          [type]="type()"
          [name]="name()"
          [id]="name()"
          [placeholder]="label()"
          [class]="getInputClasses()"
        />
      }

      <label
        [for]="name()"
        [class]="
          cn(
            'absolute -top-3.5 left-2 cursor-text text-xs text-slate-500 transition-all',
            'peer-focus-visible:text-primary-bright peer-focus-visible:-top-3.5 peer-focus-visible:left-2 peer-focus-visible:text-xs',
            'peer-placeholder-shown:left-4 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base',
            error() && '-top-4 peer-focus-visible:-top-4'
          )
        "
      >
        {{ label() }}
      </label>

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
  error = input<string | null>(null);
  textarea = input(false);
  type = input<HTMLElementTagNameMap['input']['type']>('text');

  cn = cn;

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
