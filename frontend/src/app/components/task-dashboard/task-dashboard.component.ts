import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';
import { TasksState } from '../../store/tasks/tasks.state';
import { FetchTasks } from '../../store/tasks/tasks.actions';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent {
  @Select(TasksState.getTasks) tasks$!: Observable<Task[]>;
  @Select(TasksState.isLoading) loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  refreshTasks(): void {
    this.store.dispatch(new FetchTasks());
  }

  // Helper function to dynamically set badge class
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case 'Processed': return 'badge-processed';
      case 'Failed': return 'badge-failed';
      case 'Pending': return 'badge-pending';
      default: return '';
    }
  }

  // Helper function to dynamically set icon
  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'Processed': return 'assets/icons/check-circle.svg';
      case 'Failed': return 'assets/icons/close-circle.svg';
      case 'Pending': return 'assets/icons/clock.svg';
      default: return '';
    }
  }
}
