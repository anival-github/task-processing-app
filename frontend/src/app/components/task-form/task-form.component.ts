import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AddTask } from '../../store/tasks/tasks.actions';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  taskAnswer: string = '';

  constructor(private store: Store) {}

  submitTask(): void {
    if (this.taskAnswer && this.taskAnswer.trim().length > 0) {
      this.store.dispatch(new AddTask({ answer: this.taskAnswer.trim() }));
      this.taskAnswer = ''; // Clear input after submission
    }
  }
}
