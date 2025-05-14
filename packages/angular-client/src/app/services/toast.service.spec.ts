import { TestBed } from '@angular/core/testing';
import { AlertCircle } from 'lucide-angular';

import { ToastService } from './toast.service';

describe('toast service', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('should add an error toast when calling error()', () => {
    service.error({ message: 'something went wrong' });

    service.getToasts().subscribe((toasts) => {
      expect(toasts.length).toBe(1);

      const toast = toasts[0];
      expect(toast.message).toBe('something went wrong');
      expect(toast.type).toBe('error');
      expect(toast.icon).toBe(AlertCircle);
      expect(toast.color).toBe('warning-bright');
    });
  });
});
