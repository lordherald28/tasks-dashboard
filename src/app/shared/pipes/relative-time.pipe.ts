import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  
  transform(value: string | Date): string {
    if (!value) return 'Sin fecha';

    const date: Date = new Date(value);
    
    const now: Date = new Date();
    
    const diffMs: number = now.getTime() - date.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} año${years !== 1 ? 's' : ''}`;
    }
  }
}