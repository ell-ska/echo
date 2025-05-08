import { Component, input, signal } from '@angular/core';
import { isObservable, type Observable } from 'rxjs';

@Component({
  selector: 'app-image',
  template: `
    @if (image() && !hasError()) {
      <img
        [src]="image()"
        [alt]="alt()"
        (error)="onError()"
        [className]="classes()"
      />
    } @else {
      <ng-content select="[fallback]" />
    }
  `,
})
export class ImageComponent {
  src = input.required<string | null | Observable<string | null>>();
  alt = input.required<string>();
  classes = input<string>();

  protected image = signal<string | null>(null);
  protected hasError = signal(false);

  ngOnInit() {
    const src = this.src();

    if (isObservable(src)) {
      src.subscribe((image) => {
        this.image.set(image);
      });
    } else {
      this.image.set(src);
    }
  }

  protected onError() {
    this.hasError.set(true);
  }
}
