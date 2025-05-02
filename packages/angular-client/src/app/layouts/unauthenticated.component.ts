import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../components/header.component';
import { ButtonComponent } from '../components/ui/button.component';

@Component({
  selector: 'app-unauthenticated-layout',
  imports: [RouterOutlet, HeaderComponent, ButtonComponent],
  template: `
    <app-header>
      <a href="/" class="text-lg font-black">echo</a>
      <app-button label="Log in" size="sm" href="/auth/log-in" />
    </app-header>
    <router-outlet />
  `,
})
export class UnauthenticatedLayoutComponent {}
