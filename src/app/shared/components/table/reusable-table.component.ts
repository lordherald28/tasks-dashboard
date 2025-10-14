import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'badge';
  pipe?: string; // 'relativeTime' | 'durationFormat' | etc.
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatTooltipModule, RelativeTimePipe
  ],
  templateUrl: './reusable-table.component.html',
  styleUrls: ['./reusable-table.component.scss']
})
export class ReusableTableComponent implements OnInit, OnChanges {
  // Entradas para datos y configuración

  @Input() dataSource: any[] = [];
  @Input() columns: TableColumn[] = [];

  @Input() showFilters: boolean = true;
  @Input() showSearchFilter: boolean = true;
  @Input() showStatusFilter: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() readonly: boolean = false;

  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() noDataMessage: string = 'No se encontraron datos';

  @Input() pageSizeOptions: number[] = [5, 10, 25];
  @Input() pageSize: number = 5;

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() onPageChange = new EventEmitter<PageEvent>();

  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();

  // Propiedades internas para paginación
  public paginatedData: any[] = [];
  public currentPageIndex: number = 0;
  public totalItems: number = 0;
  public lastSearchValue: string = '';

  ngOnInit() {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['pageSize']) {
      this.updatePagination();
    }
  }

  getDisplayedColumns(): string[] {
    const columns: string[] = [];

    if (this.showAddButton) columns.push('add');
    columns.push(...this.columns.map(col => col.key));
    if (this.showActions && !this.readonly) columns.push('actions');

    return columns;
  }

  onAddClick(): void {
    this.addClick.emit();
  }

  onEditClick(item: any): void {
    this.editClick.emit(item);
  }

  onDeleteClick(item: any): void {
    this.deleteClick.emit(item);
  }

  onSearch(value: string): void {
    this.lastSearchValue = value;
    this.currentPageIndex = 0; // Resetear a primera página al buscar
    this.searchChange.emit(value);
  }

  onStatusChange(value: string): void {
    this.currentPageIndex = 0; // Resetear a primera página al filtrar
    this.statusChange.emit(value);
  }

  onPaginatorChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
    this.updatePagination();
    this.onPageChange.emit(event);
  }

  private updatePagination(): void {
    this.totalItems = this.dataSource.length;

    if (this.showPagination && this.dataSource.length > 0) {
      const startIndex = this.currentPageIndex * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.paginatedData = this.dataSource.slice(startIndex, endIndex);
    } else {
      // Si no hay paginación, mostrar todos los datos
      this.paginatedData = this.dataSource;
    }
  }

  getBadgeClass(status: string): string {
    return status === 'completed' ? 'badge-completed' : 'badge-pending';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
  }
}