import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(user: { firstName?: string; lastName?: string }) {
    if (!user.firstName || !user.lastName) return undefined;
    return `${user.firstName[0]}${user.lastName[0]}`;
  }
}
