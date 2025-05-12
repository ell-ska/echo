import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CapsuleEditorService } from '../../services/capsule-editor.service';
import { ButtonComponent } from '../../components/button.component';

@Component({
  selector: 'app-visibility',
  imports: [ButtonComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="editor.form">
      <h2 class="text-xl">
        Will
        <span class="font-bold">{{ editor.title() }}</span>
        be publicly available?
      </h2>

      <nav class="capsule-editor-navigation">
        <app-button
          label="No, I want to keep it private"
          variant="secondary"
          (onClick)="setPrivate()"
        />
        <app-button label="Yes, let the world know!" (onClick)="setPublic()" />
      </nav>
    </form>
  `,
})
export class VisibilityComponent {
  editor = inject(CapsuleEditorService);

  setPrivate() {
    this.editor.form.controls.visibility.setValue('private');
    this.editor.next();
  }

  setPublic() {
    this.editor.form.controls.visibility.setValue('public');
    this.editor.next();
  }
}
