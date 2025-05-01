import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { intervalToDuration, isBefore } from 'date-fns';
import { ButtonComponent } from './ui/button.component';

@Component({
  selector: 'app-countdown',
  imports: [RouterLink, ButtonComponent],
  template: `
    @if (!hasOpened()) {
      <div
        class="flex justify-between items-center gap-1 w-full border border-zinc-100 rounded-3xl bg-white p-3 text-sm *:flex *:flex-col *:items-center *:gap-1"
      >
        <div>
          <span class="text-2xl font-black">{{ years() }}</span>
          Years
        </div>
        <div>
          <span class="text-2xl font-black">{{ days() }}</span>
          Days
        </div>
        <div>
          <span class="text-2xl font-black">{{ hours() }}</span>
          Hours
        </div>
        <div>
          <span class="text-2xl font-black">{{ minutes() }}</span>
          Minutes
        </div>
        <div>
          <span class="text-2xl font-black">{{ seconds() }}</span>
          Seconds
        </div>
      </div>
    } @else if (hasOpened() && openAction() === 'link') {
      <a
        [routerLink]="['/capsule', id]"
        class="flex justify-between items-center gap-1 w-full border border-zinc-100 rounded-3xl bg-white p-2 pl-3 transition hover:bg-zinc-100"
      >
        <p class="font-bold">The wait is finally over!</p>
        <app-button label="View capsule" size="sm" />
      </a>
    }
  `,
})
export class CountdownComponent {
  openDate = input.required<Date>();
  openAction = input.required<'link' | 'reload'>();
  id = input<string>();

  hasOpened = signal(false);
  interval?: ReturnType<typeof setInterval>;

  years = signal('0');
  days = signal('0');
  hours = signal('0');
  minutes = signal('0');
  seconds = signal('0');

  ngOnInit() {
    this.updateDuration();
    this.interval = setInterval(() => this.updateDuration(), 1000);
  }

  onOnDestroy() {
    clearInterval(this.interval);
  }

  updateDuration() {
    if (this.hasOpened()) {
      clearInterval(this.interval);
      return;
    }

    const start = new Date();
    const end = this.openDate();

    if (isBefore(end, start)) {
      clearInterval(this.interval);
      this.hasOpened.set(true);

      if (this.openAction() === 'reload') {
        window.location.reload();
      }

      return;
    }

    const duration = intervalToDuration({
      start,
      end,
    });

    this.years.set(String(duration.years || 0));
    this.days.set(String(duration.days || 0));
    this.hours.set(String(duration.hours || 0));
    this.minutes.set(String(duration.minutes || 0));
    this.seconds.set(String(duration.seconds || 0));
  }
}
