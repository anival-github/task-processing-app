import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TaskDashboardComponent } from '../task-dashboard/task-dashboard.component';
import { Task } from '../../models/task.model';
import { Observable, of } from 'rxjs';
import { LogoContainerComponent } from '../logo-container/logo-container.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MenuComponent,
    MatIconModule,
    MatButtonModule,
    TaskDashboardComponent,
    LogoContainerComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  isMenuOpen: boolean = false;
  
  tasks$: Observable<Task[]> = of([
    { taskId: '1', answer: 'Sample Answer 1', status: 'Processed', retries: 0 },
    { taskId: '2', answer: 'Sample Answer 2', status: 'Failed', retries: 3, errorMessage: 'Something went wrong' },
    { taskId: '3', answer: 'Sample Answer 3', status: 'Pending', retries: 1 }
  ]);

  constructor() { }

  ngOnInit() {
    this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getStatusClass(status: string): string {
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Processed':
        return 'assets/icons/processed.svg';
      case 'Failed':
        return 'assets/icons/failed.svg';
      case 'Pending':
        return 'assets/icons/pending.svg';
      default:
        return '';
    }
  }

  refreshTasks(): void {
    console.log('Refreshing tasks...');
    this.tasks$ = of([
      { taskId: '4', answer: 'Refreshed Answer 4', status: 'Processed', retries: 0 },
      { taskId: '5', answer: 'Refreshed Answer 5', status: 'Pending', retries: 2 },
    ]);
  }
} 