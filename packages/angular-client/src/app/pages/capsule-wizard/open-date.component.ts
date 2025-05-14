import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar } from 'lucide-angular';

import { CapsuleEditorService } from '../../services/capsule-editor.service';
import { ButtonComponent } from '../../components/button.component';
import { InputComponent } from '../../components/input.component';
import { ToggleComponent } from '../../components/toggle.component';

@Component({
  selector: 'app-open-date',
  imports: [ButtonComponent, InputComponent, ToggleComponent],
  template: `
    <div class="flex flex-col gap-8">
      <h2 class="text-xl">
        Are you ready to seal
        <span class="font-bold">{{ editor.title() }}</span
        >?
      </h2>

      <div>
        <app-input
          [control]="editor.form.controls.openDate"
          [icon]="calendar"
          label="Open date"
          name="open-date"
          type="datetime-local"
          [error]="editor.getValidationError('openDate')"
        />
      </div>
      <app-toggle
        label="Show countdown on explore page"
        [initial]="editor.form.controls.showCountdown.value!"
        (toggled)="setShowCountdown($event)"
      />
    </div>

    <nav class="capsule-editor-navigation">
      <app-button
        label="No, I want to save as a draft"
        variant="secondary"
        (onClick)="draft()"
      />
      <app-button label="Seal capsule!" (onClick)="seal()" />
    </nav>
  `,
})
export class OpenDateComponent {
  readonly calendar = Calendar;

  editor = inject(CapsuleEditorService);
  route = inject(ActivatedRoute);

  setShowCountdown(value: boolean) {
    this.editor.form.controls.showCountdown.setValue(value);
  }

  draft() {
    this.editor.form.controls.type.setValue('draft');
    this.editor.form.controls.openDate.setValue(null);
    this.editor.save();
  }

  seal() {
    this.editor.form.controls.type.setValue('seal');
    this.editor.save();
  }
}
