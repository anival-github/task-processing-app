import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TaskDashboardComponent } from '../../components/task-dashboard/task-dashboard.component';
import { Task, TaskStatus } from '../../models/task.model';
import { Observable } from 'rxjs';
import { LogoContainerComponent } from '../../components/logo-container/logo-container.component';
import { Select, Store } from '@ngxs/store';
import { TasksState } from '../../store/tasks/tasks.state';
import { FetchTasks } from '../../store/tasks/tasks.actions';

@Component({
  selector: 'app-mobile-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MenuComponent,
    MatIconModule,
    MatButtonModule,
    TaskDashboardComponent,
    LogoContainerComponent
  ],
  templateUrl: './mobile-dashboard-page.component.html',
  styleUrls: ['./mobile-dashboard-page.component.scss']
})
export class MobileDashboardPageComponent implements OnInit {
  isMenuOpen: boolean = false;
  
  @Select(TasksState.getTasks) tasks$!: Observable<Task[]>;
  @Select(TasksState.isLoading) loading$!: Observable<boolean>;

  constructor(private store: Store) { }

  ngOnInit() {
    this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case 'Processed':
        return 'status-processed';
      case 'Failed':
        return 'status-failed';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'Processed':
        return 'assets/icons/check-circle.svg';
      case 'Failed':
        return 'assets/icons/close-circle.svg';
      case 'Pending':
        return 'assets/icons/clock.svg';
      default:
        return '';
    }
  }

  refreshTasks(): void {
    console.log('Refreshing tasks...');
    this.store.dispatch(new FetchTasks());
  }
} 