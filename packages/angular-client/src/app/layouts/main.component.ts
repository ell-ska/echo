import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import type { UserData } from '@repo/validation/data';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from '../components/header.component';
import { ButtonComponent } from '../components/button.component';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    AsyncPipe,
    RouterOutlet,
    HeaderComponent,
    ButtonComponent,
    NavigationComponent,
    SidebarComponent,
  ],
  template: `
    <app-header [class.md:hidden]="user$ | async">
      <a href="/" class="text-lg font-black">echo</a>
      @if (!(user$ | async)) {
        <app-button label="Log in" size="sm" href="/log-in" />
      }
    </app-header>
    <app-sidebar [class.hidden]="!(user$ | async)" />
    <router-outlet />
    @if (user$ | async) {
      <app-navigation
        class="fixed inset-x-3 bottom-4 flex justify-center md:hidden"
      />
    }
  `,
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  user$!: Observable<UserData | null>;

  constructor() {
    this.user$ = this.auth.getCurrentUser();
  }
}
