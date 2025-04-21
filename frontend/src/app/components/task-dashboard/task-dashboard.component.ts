import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';
import { TasksState } from '../../store/tasks/tasks.state';
import { FetchTasks } from '../../store/tasks/tasks.actions';

@Component({
  selector: 'app-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent {
  @Select(TasksState.getTasks) tasks$!: Observable<Task[]>;
  // Could also select loading state if needed: @Select(TasksState.isLoading) loading$!: Observable<boolean>;

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
      case 'Processing': return 'badge-processing'; // Add if needed
      default: return '';
    }
  }

  // Helper function to dynamically set icon
  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'Processed': return 'assets/icons/check-circle.svg';
      case 'Failed': return 'assets/icons/close-circle.svg';
      case 'Pending': return 'assets/icons/clock.svg';
      case 'Processing': return 'assets/icons/clock.svg'; // Example: use clock for processing too
      default: return '';
    }
  }
}
