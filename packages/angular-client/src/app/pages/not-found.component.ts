import { Component } from '@angular/core';

import { ButtonComponent } from '../components/button.component';

@Component({
  selector: 'app-not-found-page',
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center gap-8 min-h-screen">
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-xl font-bold">Oops, looks like you got lost!</h1>
        <p>The page you were looking for was not found.</p>
      </div>
      <app-button label="Go back home" href="/" />
    </div>
  `,
})
export class NotFoundPageComponent {}
