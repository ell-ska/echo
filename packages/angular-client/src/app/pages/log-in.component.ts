import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { z } from 'zod';

import type { LoginValues } from '@repo/validation/actions';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import {
  getValidationError,
  InputComponent,
} from '../components/input.component';
import { ButtonComponent } from '../components/button.component';

@Component({
  selector: 'app-log-in-page',
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <main class="main main-auth">
      <div class="grow w-full flex flex-col items-center mt-[20vh] gap-8">
        <h1 class="space-x-2 text-2xl">
          Welcome back to <span class="font-black">echo</span> !
        </h1>
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="flex flex-col gap-8 w-full"
        >
          <div class="flex flex-col gap-6">
            <app-input
              [control]="form.controls.identifier"
              name="identifier"
              label="Username or email"
              [error]="getValidationError('identifier')"
            />
            <app-input
              [control]="form.controls.password"
              name="password"
              label="Password"
              type="password"
              [error]="getValidationError('password')"
            />
          </div>
          <app-button label="Log in" />
        </form>
      </div>
      <a routerLink="/create-account" class="text-sm hover:underline">
        <span>Don't have an account? </span>
        <span class="font-bold">Create one</span>
      </a>
    </main>
  `,
})
export class LogInPageComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  form = new FormGroup(
    {
      identifier: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    },
    {
      updateOn: 'blur',
    },
  );

  getValidationError(field: keyof typeof this.form.controls) {
    switch (field) {
      case 'identifier':
        return getValidationError(this.form.controls.identifier.errors, {
          required: 'Username or email is required',
        });
      case 'password':
        return getValidationError(this.form.controls.password.errors, {
          required: 'Password is required',
        });
    }
  }

  submit() {
    if (this.form.valid) {
      const { identifier, password } = this.form.value;
      const { success: isEmail } = z.string().email().safeParse(identifier);

      const values = {
        ...(isEmail ? { email: identifier } : { username: identifier }),
        password,
      } as LoginValues;

      this.authService.login(values).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastService.error({
            message:
              error.error?.error ?? 'Something went wrong when logging in',
          });
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
