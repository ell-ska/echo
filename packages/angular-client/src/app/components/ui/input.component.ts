import { Component, input } from '@angular/core';

import { cn } from '../../../utils/classname';

@Component({
  selector: 'app-input',
  template: `
    <div class="group relative flex flex-col gap-1">
      @if (textarea()) {
        <textarea
          [name]="name()"
          [id]="name()"
          [value]="value()"
          [placeholder]="label()"
          [class]="inputClasses"
        ></textarea>
      } @else {
        <input
          [type]="type()"
          [name]="name()"
          [id]="name()"
          [value]="value()"
          [placeholder]="label()"
          [class]="inputClasses"
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

      @if (error()) {
        <span class="text-sm text-warning-bright">{{ error() }}</span>
      }
    </div>
  `,
})
export class InputComponent {
  label = input.required<string>();
  name = input.required<string>();
  error = input<string>();
  textarea = input(false);
  type = input<HTMLElementTagNameMap['input']['type']>('text');
  value = input<HTMLElementTagNameMap['input']['value']>('');

  cn = cn;
  inputClasses = cn(
    'peer w-full px-4 py-2 bg-zinc-100 text-base text-zinc-800 outline-none rounded-lg border border-transparent placeholder:text-transparent',
    'focus-visible:border-primary-bright',
    this.textarea() && 'min-h-56 resize-none',
    this.error() && 'border-warning-bright',
  );
}
