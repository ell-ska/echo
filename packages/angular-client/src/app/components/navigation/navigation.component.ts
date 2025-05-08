import { Component } from '@angular/core';
import {
  Globe,
  Inbox,
  LucideAngularModule,
  Plus,
  Send,
  User,
} from 'lucide-angular';

import { NavigationItemComponent } from './navigation-item.component';

@Component({
  selector: 'app-navigation',
  imports: [NavigationItemComponent, LucideAngularModule],
  template: `
    <nav
      class="flex items-center justify-between px-6 py-2 max-w-md w-full rounded-full bg-white shadow-float"
    >
      <app-navigation-item href="" [icon]="globe" label="Explore" />
      <app-navigation-item href="received" [icon]="inbox" label="Received" />
      <a
        href="/capsule/create"
        class="flex justify-center items-center size-10 bg-zinc-800 rounded-full cursor-pointer transition hover:bg-zinc-700"
      >
        <span class="sr-only">Create capsule</span>
        <lucide-icon [img]="plus" class="size-8 text-white" />
      </a>
      <app-navigation-item href="sent" [icon]="send" label="Sent" />
      <app-navigation-item href="profile" [icon]="user" label="Profile" />
    </nav>
  `,
})
export class NavigationComponent {
  globe = Globe;
  inbox = Inbox;
  plus = Plus;
  send = Send;
  user = User;
}
