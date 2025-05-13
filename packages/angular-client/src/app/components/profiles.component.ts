import { Component, input } from '@angular/core';

import type { UserData } from '@repo/validation/data';
import { InitialsPipe } from '../pipes/initials.pipe';
import { ProfileComponent } from './profile.component';

@Component({
  selector: 'app-profiles',
  imports: [InitialsPipe, ProfileComponent],
  template: `
    <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
      <span class="font-bold">{{ label() }}</span>
      <div class="flex gap-8 md:order-2">
        @for (profile of profiles(); track profile._id) {
          <app-profile
            [id]="profile._id"
            [username]="profile.username"
            [initials]="profile | initials"
            [showUsername]="true"
          />
        }
      </div>
    </div>
  `,
})
export class ProfilesComponent {
  label = input.required<string>();
  profiles = input.required<UserData[]>();
}
