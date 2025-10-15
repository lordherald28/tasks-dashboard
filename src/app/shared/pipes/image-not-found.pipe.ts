import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageNotFound',
  standalone: true
})
export class ImageNotFoundPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    console.log(value)
    return 'img/default-avatar.jpg';
  }

}
