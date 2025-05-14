import { inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  Subscription,
} from 'rxjs';
import { isFuture } from 'date-fns';

import type { CapsuleValues } from '@repo/validation/actions';
import type { UserData } from '@repo/validation/data';
import { CapsuleService } from './capsule.service';
import { ToastService } from './toast.service';
import { getValidationError } from '../components/input.component';

const storageKey = 'capsule-editor-draft';
const stepKey = 'capsule-editor-step';

const steps = {
  content: {
    controls: ['title', 'content'],
  },
  visibility: {
    controls: ['visibility'],
  },
  receivers: {
    controls: ['receivers'],
  },
  'open-date': {
    controls: ['openDate', 'showCountdown'],
  },
};

type Step = keyof typeof steps;

const defaultTitle = 'Untitled capsule';

@Injectable({
  providedIn: 'root',
})
export class CapsuleEditorService {
  title = signal(defaultTitle);
  images = signal<File[] | null>(null);

  form = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(60),
    ]),
    content: new FormControl('', [Validators.minLength(1)]),
    visibility: new FormControl('', [
      (control) => {
        enum Visibility {
          public = 'public',
          private = 'private',
        }

        const values = Object.values(Visibility);
        return values.includes(control.value) ? null : { invalid: true };
      },
    ]),
    receivers: new FormControl<UserData[]>([]),
    openDate: new FormControl(null, [
      (control) => {
        const value = control.value;
        const parent = control.parent;
        const type = parent?.get('type')?.value;

        if (type === 'seal') {
          if (!value) {
            return { required: true };
          }

          const date = new Date(value);
          return isFuture(date) ? null : { past: true };
        }

        return null;
      },
    ]),
    showCountdown: new FormControl(false),
    type: new FormControl('seal'),
  });

  private capsuleService = inject(CapsuleService);
  private toast = inject(ToastService);
  private router = inject(Router);

  private formSubscription!: Subscription;

  constructor() {
    this.initStorageSync();
    this.initTitleSync();
  }

  private initStorageSync() {
    // TODO: handle images

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      this.form.patchValue(JSON.parse(saved));
    }

    this.formSubscription = this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((previous, current) => {
          return JSON.stringify(previous) === JSON.stringify(current);
        }),
      )
      .subscribe((value) => {
        localStorage.setItem(storageKey, JSON.stringify(value));
      });
  }

  private initTitleSync() {
    this.form.controls.title.valueChanges
      .pipe(startWith(this.form.controls.title.value || defaultTitle))
      .subscribe((value) => {
        if (!value) {
          return this.title.set(defaultTitle);
        }
        this.title.set(value);
      });
  }

  validateStep() {
    const step = this.getStep();

    const hasInvalidStep = steps[step].controls.some((path) => {
      const control = this.form.get(path);
      if (!control) throw new Error('invalid step path');

      if (control.invalid) {
        control.markAsTouched();
        return true;
      }

      return false;
    });

    return hasInvalidStep ? false : true;
  }

  getValidationError(field: keyof typeof this.form.controls) {
    switch (field) {
      case 'title':
        return getValidationError(this.form.controls.title.errors, {
          required: 'Title is required',
          minlength: 'Title must be at least 1 character',
          maxlength: 'Title can not be longer than 60 characters',
        });
      case 'content':
        return getValidationError(this.form.controls.content.errors, {
          minlength: 'Content must be at least 1 character',
        });
      case 'visibility':
        return getValidationError(this.form.controls.visibility.errors, {
          invalid: 'Visibility is invalid',
        });
      case 'openDate':
        return getValidationError(this.form.controls.openDate.errors, {
          required: 'You have to set an open date to seal the capsule',
          past: 'Open date has to be in the future',
        });
      case 'receivers':
      case 'showCountdown':
      case 'type':
        return null;
    }
  }

  clear() {
    localStorage.removeItem(stepKey);
    localStorage.removeItem(storageKey);
    this.form.reset();
  }

  getMode() {
    const match = this.router.url.match(/(create|edit)/);
    return match?.[1];
  }

  getId() {
    const match = this.router.url.match(/\b[a-fA-F0-9]{24}\b/);
    return match?.[0];
  }

  getStep() {
    const segments = this.router.url.split('/');
    return segments[segments.length - 1] as Step;
  }

  private changeStep(type: 'next' | 'back') {
    const currentStep = this.getStep();
    const stepPaths = Object.keys(steps);
    const currentStepIndex = stepPaths.indexOf(currentStep);

    let step = undefined;

    switch (type) {
      case 'next':
        step = stepPaths[currentStepIndex + 1];
        break;
      case 'back':
        step = stepPaths[currentStepIndex - 1];
        break;
    }

    if (!step) return;

    localStorage.setItem(stepKey, step);
    this.navigate(step);
  }

  next() {
    if (this.validateStep()) {
      this.changeStep('next');
    }
  }

  back() {
    this.changeStep('back');
  }

  redirectToLastSavedStep() {
    const step = localStorage.getItem(stepKey);
    this.navigate(step);
  }

  navigate(step: string | null) {
    const mode = this.getMode();
    const id = this.getId();

    const segments = ['/capsule'];

    if (id) segments.push(id);
    if (mode) segments.push(mode);
    if (step) segments.push(step);

    this.router.navigate(segments);
  }

  skipStep() {
    this.changeStep('next');
  }

  save() {
    const mode = this.getMode();

    if (this.form.valid) {
      if (mode === 'create') {
        this.create();
      } else if (mode === 'edit') {
        this.edit();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  private getFormValues() {
    const form = this.form.value;
    return {
      title: form.title!,
      visibility: form.visibility as CapsuleValues['visibility'],
      receivers: form.receivers?.map((user) => user._id),
      openDate: form.openDate ? new Date(form.openDate) : undefined,
      showCountdown: form.showCountdown!,
      content: form.content || undefined,
      images: this.images() || undefined,
    };
  }

  private create() {
    const values = this.getFormValues();
    this.capsuleService.create({ values }).subscribe({
      next: ({ id }) => {
        this.clear();
        this.router.navigate(['/capsule', id]);
      },
      error: (error) => {
        this.toast.error(error);
      },
    });
  }

  private edit() {
    const id = this.getId();
    if (!id) {
      this.toast.error({ message: 'Cannot find the id for the capsule' });
      return;
    }

    const values = this.getFormValues();

    this.capsuleService.edit({ id, values }).subscribe({
      next: ({ id }) => {
        this.clear();
        this.router.navigate(['/capsule', id]);
      },
      error: (error) => {
        this.toast.error(error);
      },
    });
  }

  protected ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
