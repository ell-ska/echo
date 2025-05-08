import { Component, computed, input } from '@angular/core';
import { Params, RouterLink, RouterLinkActive } from '@angular/router';

import { cn } from '../../utils/classname';

@Component({
  selector: 'app-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div [class]="containerClasses()">
      @for (tab of tabs(); track tab.label) {
        <a
          [routerLink]="tab.routerLink"
          [queryParams]="tab.params"
          routerLinkActive="!bg-slate-800 !text-white hover:!bg-slate-700"
          [routerLinkActiveOptions]="{ exact: true }"
          class="py-2 px-3 text-xs text-zinc-600 bg-white rounded-full transition hover:bg-slate-100"
          >{{ tab.label }}</a
        >
      }
    </div>
  `,
})
export class TabsComponent {
  tabs = input.required<
    {
      label: string;
      routerLink: string;
      params?: Params;
    }[]
  >();
  classes = input<string>();

  containerClasses = computed(() =>
    cn('flex gap-2 p-1 bg-white rounded-full shadow-float', this.classes()),
  );
}
