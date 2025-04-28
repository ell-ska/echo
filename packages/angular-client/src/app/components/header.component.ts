import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header
      class="fixed z-40 left-1/2 -translate-x-1/2 w-full flex justify-between items-center max-w-5xl px-4 h-header-sm bg-slate-50/80 backdrop-blur-xs md:h-header-md"
    >
      <ng-content />
    </header>
  `,
})
export class HeaderComponent {}
