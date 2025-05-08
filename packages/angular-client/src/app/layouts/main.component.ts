import { Component, inject, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../components/header.component';
import { ButtonComponent } from '../components/ui/button.component';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { UserData } from '@repo/validation/data';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-unauthenticated-layout',
  imports: [
    AsyncPipe,
    RouterOutlet,
    HeaderComponent,
    ButtonComponent,
    NavigationComponent,
  ],
  template: `
    <app-header>
      <a href="/" class="text-lg font-black">echo</a>
      <app-button label="Log in" size="sm" href="/log-in" />
    </app-header>
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
