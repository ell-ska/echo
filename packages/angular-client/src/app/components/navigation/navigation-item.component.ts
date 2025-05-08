import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-navigation-item',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <a
      [routerLink]="href()"
      routerLinkActive="!text-zinc-800 !bg-zinc-50"
      [routerLinkActiveOptions]="{ exact: true }"
      class="flex items-center justify-center size-10 rounded-xl text-zinc-600 bg-transparent transition hover:bg-slate-100"
    >
      <span class="sr-only">{{ label() }}</span>
      <lucide-icon [img]="icon()" class="size-6" />
    </a>
  `,
})
export class NavigationItemComponent {
  href = input.required<string>();
  icon = input.required<LucideIconData>();
  label = input.required<string>();
}
