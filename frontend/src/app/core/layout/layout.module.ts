import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TaskSubmissionModule } from '../../features/task-submission/task-submission.module';
import { TaskDashboardModule } from '../../features/task-dashboard/task-dashboard.module';

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    TaskSubmissionModule,
    TaskDashboardModule
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { } 