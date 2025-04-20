import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Task, TaskStatus } from '../../store/task.model';
import { TaskState } from '../../store/task.state';
import { TaskActions } from '../../store/task.actions';

@Component({
  selector: 'app-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent implements OnInit {
  displayedColumns: string[] = ['taskId', 'answer', 'status', 'retries', 'createdAt', 'updatedAt', 'errorMessage'];
  dataSource: MatTableDataSource<Task>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  TaskStatus = TaskStatus; // For template usage

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store) {
    this.dataSource = new MatTableDataSource<Task>([]);
    this.loading$ = this.store.select(TaskState.getLoading);
    this.error$ = this.store.select(TaskState.getError);

    // Subscribe to tasks updates
    this.store.select(TaskState.getTasks).subscribe(tasks => {
      this.dataSource.data = tasks;
    });
  }

  ngOnInit(): void {
    // Load tasks when component initializes
    this.store.dispatch(new TaskActions.LoadTasks());
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Helper method to get status color
  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PROCESSED:
        return 'accent';
      case TaskStatus.FAILED:
        return 'warn';
      default:
        return 'primary';
    }
  }

  // Format date for display
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  // Refresh tasks
  refreshTasks(): void {
    this.store.dispatch(new TaskActions.LoadTasks());
  }
}
