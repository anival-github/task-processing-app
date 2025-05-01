import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskDashboardComponent } from '../../components/task-dashboard/task-dashboard.component';

@Component({
  selector: 'app-desktop-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    TaskFormComponent,
    TaskDashboardComponent
  ],
  templateUrl: './desktop-layout.component.html',
  styleUrls: ['./desktop-layout.component.scss']
})
export class DesktopLayoutComponent {

} 