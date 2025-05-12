import { Component, input } from '@angular/core';

import { cn } from '../../utils/classname';

@Component({
  selector: 'app-header',
  template: `
    <header
      [class]="
        cn(
          'fixed z-40 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 h-header-sm bg-slate-50/80 backdrop-blur-xs md:h-header-md',
          classes()
        )
      "
    >
      <ng-content />
    </header>
  `,
})
export class HeaderComponent {
  classes = input<string>();
  cn = cn;
}
