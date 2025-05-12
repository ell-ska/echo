import {
  Component,
  ElementRef,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { v4 as uuid } from 'uuid';
import { X } from 'lucide-angular';

import { ButtonComponent } from '../button.component';
import { ImageComponent } from '../image.component';

type Image = {
  file: File;
  preview: string;
  id: string;
};

@Component({
  selector: 'app-upload-multiple',
  imports: [ButtonComponent, ImageComponent],
  template: `
    <div class="flex flex-col items-start gap-2">
      @if (images().length > 0) {
        <div class="flex flex-wrap gap-2">
          @for (image of images(); track image.id) {
            <div class="relative">
              <app-image
                [src]="image.preview"
                [alt]="'Preview of ' + image.preview"
                classes="h-28 object-cover border border-white rounded-2xl"
              />
              <app-button
                [icon]="x"
                size="sm"
                class="absolute -top-1 -right-1"
                type="button"
                (onClick)="deleteImage(image.id)"
              />
            </div>
          }
        </div>
      }

      <label [for]="name()" class="sr-only">{{ label() }}</label>
      <input
        #input
        hidden
        type="file"
        accept="image/*"
        multiple
        [name]="name()"
        [id]="name()"
        (change)="handleFileChange()"
      />
      <app-button
        label="Upload image"
        size="sm"
        variant="secondary"
        type="button"
        (onClick)="triggerInputClick()"
      />
    </div>
  `,
})
export class MultipleComponent {
  name = input.required<string>();
  label = input.required<string>();

  images = signal<Image[]>([]);
  files = output<File[] | null>();

  x = X;

  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;

  triggerInputClick() {
    this.inputRef.nativeElement.click();
  }

  handleFileChange() {
    const fileList = this.inputRef.nativeElement.files;

    if (!fileList || fileList.length === 0) {
      return this.updateImages([]);
    }

    const files = Array.from(fileList);

    const images = [
      ...this.images(),
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: uuid(),
      })),
    ];
    this.updateImages(images);
  }

  deleteImage(id: string) {
    this.updateImages(this.images().filter((image) => image.id !== id));
  }

  updateImages(images: Image[]) {
    this.images.set(images);
    this.files.emit(images.map((image) => image.file));
  }
}
