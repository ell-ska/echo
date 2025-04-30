import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, format as formatFn } from 'date-fns';

@Pipe({
  name: 'date',
})
export class DatePipe implements PipeTransform {
  transform(date: Date, format: 'distance-to-now') {
    switch (format) {
      case 'distance-to-now':
        return formatDistanceToNow(date, { addSuffix: true });
    }
  }
}
