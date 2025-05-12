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
    receivers: new FormControl(),
    openDate: new FormControl(null, [
      (control) => {
        const date = new Date(control.value);
        return isFuture(date) ? null : { past: true };
      },
    ]),
    showCountdown: new FormControl(false),
  });

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
          past: 'Open date has to be in the future',
        });
      case 'receivers':
      case 'showCountdown':
        return null;
    }
  }

  clear() {
    localStorage.removeItem(storageKey);
    this.form.reset();
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
    this.router.navigate(['/capsule/create', step]);
  }

  next() {
    if (this.validateStep()) {
      this.changeStep('next');
    }
  }

  back() {
    this.changeStep('back');
  }

  redirectToLastStep() {
    const step = localStorage.getItem(stepKey);
    this.router.navigate(['/capsule/create', step]);
  }

  protected ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
