import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageNotFound',
  standalone: true
})
export class ImageNotFoundPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    // Si no hay valor, está vacío, o es inválido
    if (!value || value.trim() === '' || value === 'null' || value === 'undefined') {
      return 'img/default-avatar.jpg';
    }

    // Para cualquier otro caso, devolvemos el valor original
    return value;
  }
}