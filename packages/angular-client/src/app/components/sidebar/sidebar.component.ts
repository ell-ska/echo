import { Component } from '@angular/core';
import {
  Globe,
  Inbox,
  LucideAngularModule,
  Plus,
  Send,
  User,
} from 'lucide-angular';

import { SidebarItemComponent } from './sidebar-item.component';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarItemComponent,
    LucideAngularModule,
    RouterLink,
    ButtonComponent,
  ],
  template: `
    <div class="w-sidebar hidden md:block">
      <div
        class="w-sidebar fixed inset-y-0 flex flex-col justify-between px-3 py-8 border-r border-zinc-200"
      >
        <div class="flex flex-col gap-12">
          <a href="/" class="text-lg font-black px-3">echo</a>
          <div class="flex flex-col gap-4">
            <app-sidebar-item label="Explore" [icon]="globe" href="/" />
            <app-sidebar-item
              label="Received"
              [icon]="inbox"
              href="/received"
            />
            <app-sidebar-item label="Sent" [icon]="send" href="/sent" />
            <app-sidebar-item label="Profile" [icon]="user" href="/profile" />
          </div>
        </div>
        <a
          [routerLink]="['/capsule/create']"
          class="flex items-center  gap-2 py-2 px-3 rounded-lg bg-transparent text-zinc-800 text-sm font-bold transition hover:bg-zinc-100"
        >
          <app-button [icon]="plus" size="sm" />
          <span>Create</span>
        </a>
      </div>
    </div>
  `,
})
export class SidebarComponent {
  globe = Globe;
  inbox = Inbox;
  plus = Plus;
  send = Send;
  user = User;
}
