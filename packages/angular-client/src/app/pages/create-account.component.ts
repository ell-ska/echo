import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import type { RegisterValues } from '@repo/validation/actions';
import {
  getValidationError,
  InputComponent,
} from '../components/ui/input.component';
import { ButtonComponent } from '../components/ui/button.component';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-create-account-page',
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <main class="main items-center max-w-xl gap-6 md:gap-2 h-full">
      <div class="grow w-full flex flex-col items-center mt-[10vh] gap-8">
        <h1 class="space-x-2 text-2xl">
          Welcome to <span class="font-black">echo</span> !
        </h1>
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="flex flex-col gap-8 w-full"
        >
          <div class="flex flex-col gap-6">
            <app-input
              [control]="form.controls.username"
              name="username"
              label="Username"
              [error]="getValidationError('username')"
            />
            <app-input
              [control]="form.controls.email"
              name="email"
              label="Email"
              type="email"
              [error]="getValidationError('email')"
            />
            <app-input
              [control]="form.controls.password"
              name="password"
              label="Password"
              type="password"
              [error]="getValidationError('password')"
            />
            <app-input
              [control]="form.controls.confirm"
              name="confirm"
              label="Confirm password"
              type="password"
              [error]="getValidationError('confirm')"
            />
          </div>
          <app-button label="Create account" />
        </form>
      </div>
      <a routerLink="/log-in" class="text-sm hover:underline">
        <span>Already have an account? </span>
        <span class="font-bold">Log in</span>
      </a>
    </main>
  `,
})
export class CreateAccountPageComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  form = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[a-z]/),
        Validators.pattern(/\d/),
        Validators.pattern(/[!@#$%^&*]/),
      ]),
      confirm: new FormControl('', [
        Validators.required,
        (control) => {
          const parent = control.parent;
          if (!parent) {
            return null;
          }

          const passwordControl = parent.get('password');
          if (!passwordControl) return null;

          return control.value === passwordControl.value
            ? null
            : { mismatch: true };
        },
      ]),
    },
    {
      updateOn: 'blur',
    },
  );

  getValidationError(field: string) {
    switch (field) {
      case 'username':
        return getValidationError(this.form.controls.username.errors, {
          required: 'Username is required',
          minlength: 'Username must be at least 3 characters',
          maxlength: 'Username can not be longer than 30 characters',
        });
      case 'email':
        return getValidationError(this.form.controls.email.errors, {
          required: 'Email is required',
          email: 'Email is not valid',
        });
      case 'password':
        return getValidationError(this.form.controls.password.errors, {
          required: 'Password is required',
          minlength: 'Password must be at least 8 characters',
          maxlength: 'Password can not be longer than 20 characters',
          pattern:
            'Password must include one uppercase letter, one lowercase letter, one digit and once special character',
        });
      case 'confirm':
        return getValidationError(this.form.controls.confirm.errors, {
          required: 'Password confirmation is required',
          mismatch: 'Passwords do not match',
        });
      default:
        return null;
    }
  }

  submit() {
    if (this.form.valid) {
      const values = this.form.value as RegisterValues;
      this.authService.register(values).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastService.error({
            message:
              error.error?.error ??
              'Something went wrong when creating the account',
          });
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
