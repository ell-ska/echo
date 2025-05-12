import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChevronLeft, X } from 'lucide-angular';

import { CapsuleEditorService } from '../services/capsule-editor.service';
import { HeaderComponent } from '../components/header.component';
import { ButtonComponent } from '../components/button.component';

@Component({
  selector: 'app-capsule-editor-layout',
  imports: [RouterOutlet, HeaderComponent, ButtonComponent],
  template: `
    <app-header classes="grid grid-cols-[20%_60%_20%] items-center">
      @if (capsuleEditor.getStep() === 'content') {
        <app-button [icon]="x" variant="tertiary" href="/" />
      } @else {
        <app-button
          [icon]="chevronLeft"
          variant="tertiary"
          (onClick)="capsuleEditor.back()"
        />
      }
      <h1 class="font-bold text-center truncate">
        {{ capsuleEditor.title() }}
      </h1>
    </app-header>
    <main class="main max-w-sm w-full">
      <router-outlet />
    </main>
  `,
})
export class CapsuleEditorLayoutComponent {
  x = X;
  chevronLeft = ChevronLeft;

  capsuleEditor = inject(CapsuleEditorService);

  ngOnInit() {
    this.capsuleEditor.redirectToLastStep();
  }
}
