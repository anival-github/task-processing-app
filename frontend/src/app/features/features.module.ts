import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskSubmissionComponent } from './task-submission/task-submission.component';
import { TaskDashboardComponent } from './task-dashboard/task-dashboard.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { TaskListComponent } from './task-list/task-list.component';



@NgModule({
  declarations: [
    TaskSubmissionComponent,
    TaskDashboardComponent,
    TaskFormComponent,
    TaskListComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FeaturesModule { }
