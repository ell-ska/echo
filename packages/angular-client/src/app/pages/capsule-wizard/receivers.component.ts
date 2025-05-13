import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  type Observable,
  of,
  switchMap,
} from 'rxjs';
import { Search, X } from 'lucide-angular';

import type { UserData } from '@repo/validation/data';
import { CapsuleEditorService } from '../../services/capsule-editor.service';
import { UserService } from '../../services/user.service';
import { ButtonComponent } from '../../components/button.component';
import { InputComponent } from '../../components/input.component';
import { ProfileComponent } from '../../components/profile.component';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-receivers',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    InitialsPipe,
    ProfileComponent,
  ],
  template: `
    <div class="flex flex-col gap-8">
      <h2 class="text-xl">
        Should
        <span class="font-bold">{{ editor.title() }}</span>
        be sent to anyone else?
      </h2>

      <div class="flex flex-col gap-6">
        <app-input
          [control]="control"
          label="Receivers"
          name="search"
          [icon]="search"
          [clearButton]="true"
        />

        <ul class="flex flex-col gap-3">
          @for (user of results$ | async; track user._id) {
            @if (!receiverIds().includes(user._id)) {
              <li class="flex justify-between items-center">
                <app-profile
                  [id]="user._id"
                  [username]="user.username"
                  [initials]="user | initials"
                  [showUsername]="true"
                />
                <app-button
                  label="Add"
                  variant="secondary"
                  size="sm"
                  (onClick)="addReceiver(user)"
                />
              </li>
            }
          }
          @for (receiver of receivers(); track receiver) {
            <li class="flex justify-between items-center">
              <app-profile
                [id]="receiver._id"
                [username]="receiver.username"
                [initials]="receiver | initials"
                [showUsername]="true"
              />
              <app-button
                [icon]="x"
                variant="tertiary"
                size="sm"
                (onClick)="removeReceiver(receiver._id)"
              />
            </li>
          }
        </ul>
      </div>
    </div>

    <nav class="capsule-editor-navigation">
      <app-button
        label="No, I want to keep it to myself"
        variant="secondary"
        (onClick)="editor.next()"
      />
      <app-button label="Add receivers" (onClick)="confirmReceivers()" />
    </nav>
  `,
})
export class ReceiversComponent {
  readonly search = Search;
  readonly x = X;

  editor = inject(CapsuleEditorService);
  userService = inject(UserService);

  control = new FormControl('');
  results$: Observable<UserData[]> = of([]);
  receivers = signal<UserData[]>(this.editor.form.controls.receivers.value);
  receiverIds = computed(() =>
    this.receivers().map((receiver) => receiver._id),
  );

  ngOnInit() {
    // TODO: this breaks the back navigation
    if (this.editor.form.controls.visibility.value === 'public') {
      this.editor.skipStep();
    }

    this.results$ = this.control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query?.trim()) {
          return of([]);
        }

        return this.userService.autocomplete(query!);
      }),
    );
  }

  addReceiver(user: UserData) {
    this.receivers.update((value) => [...value, user]);
  }

  removeReceiver(id: string) {
    this.receivers.update((value) => value.filter((user) => user._id !== id));
  }

  confirmReceivers() {
    this.editor.form.controls.receivers.setValue(this.receivers());
    this.editor.next();
  }
}
