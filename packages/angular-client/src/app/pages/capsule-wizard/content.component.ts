import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CapsuleEditorService } from '../../services/capsule-editor.service';
import { MultipleComponent } from '../../components/upload/multiple.component';
import { InputComponent } from '../../components/input.component';
import { ButtonComponent } from '../../components/button.component';

@Component({
  selector: 'app-content',
  imports: [
    ReactiveFormsModule,
    MultipleComponent,
    InputComponent,
    ButtonComponent,
  ],
  template: `
    <form [formGroup]="form" class="w-full max-w-sm flex flex-col gap-8">
      <div class="flex flex-col gap-6">
        <app-input
          [control]="form.controls.title"
          name="title"
          label="Title"
          [error]="this.capsuleEditor.getValidationError('title')"
        />
        <app-input
          [textarea]="true"
          [control]="form.controls.content"
          name="content"
          label="Content"
          [error]="this.capsuleEditor.getValidationError('content')"
        />
      </div>
      <app-upload-multiple
        name="images"
        label="Images"
        (files)="capsuleEditor.images.set($event)"
      />
    </form>

    <nav class="capsule-editor-navigation">
      <app-button label="Next" (onClick)="capsuleEditor.next()" />
    </nav>
  `,
})
export class ContentComponent {
  capsuleEditor = inject(CapsuleEditorService);
  form = this.capsuleEditor.form;
}
