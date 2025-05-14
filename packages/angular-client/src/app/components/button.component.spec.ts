import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';

import { ButtonComponent } from './button.component';

describe('button component', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent, LucideAngularModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a default button with the correct classes', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(button).toBeTruthy();
    expect(button.classList).toContain('bg-zinc-800');
    expect(button.classList).toContain('text-white');
  });

  it('should render an anchor tag when href is provided', () => {
    const url = 'https://example.com';
    fixture.componentRef.setInput('href', url);
    fixture.detectChanges();

    const a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a).toBeTruthy();
    expect(a.getAttribute('href')).toBe(url);
  });
});
