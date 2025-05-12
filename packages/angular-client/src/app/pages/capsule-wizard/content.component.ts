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
    <form [formGroup]="editor.form" class="flex flex-col gap-8">
      <div class="flex flex-col gap-6">
        <app-input
          [control]="editor.form.controls.title"
          name="title"
          label="Title"
          [error]="editor.getValidationError('title')"
        />
        <app-input
          [textarea]="true"
          [control]="editor.form.controls.content"
          name="content"
          label="Content"
          [error]="editor.getValidationError('content')"
        />
      </div>
      <app-upload-multiple
        name="images"
        label="Images"
        (files)="editor.images.set($event)"
      />
    </form>

    <nav class="capsule-editor-navigation">
      <app-button label="Next" (onClick)="editor.next()" />
    </nav>
  `,
})
export class ContentComponent {
  editor = inject(CapsuleEditorService);
}
