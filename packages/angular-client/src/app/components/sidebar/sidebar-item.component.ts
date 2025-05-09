import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-sidebar-item',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    <a
      [routerLink]="[href()]"
      routerLinkActive="!text-zinc-800 !font-black"
      [routerLinkActiveOptions]="{ exact: true }"
      class="flex items-center gap-2 py-2 px-3 rounded-lg bg-transparent text-zinc-600 text-sm transition hover:bg-zinc-100"
    >
      <lucide-icon [img]="icon()" class="size-6" />
      <span>{{ label() }}</span>
    </a>
  `,
})
export class SidebarItemComponent {
  label = input.required<string>();
  icon = input.required<LucideIconData>();
  href = input.required<string>();
}
