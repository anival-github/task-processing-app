import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { TaskActions } from '../../store/task.actions';
import { TaskState } from '../../store/task.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-submission',
  templateUrl: './task-submission.component.html',
  styleUrls: ['./task-submission.component.scss']
})
export class TaskSubmissionComponent implements OnInit {
  taskForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.taskForm = this.fb.group({
      answer: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.loading$ = this.store.select(TaskState.getLoading);
    this.error$ = this.store.select(TaskState.getError);
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.taskForm.valid) {
      const { answer } = this.taskForm.value;
      this.store.dispatch(new TaskActions.SubmitTask(answer));
      this.taskForm.reset();
    }
  }

  getWordCount(): number {
    const answer = this.taskForm.get('answer')?.value || '';
    const words = answer.trim().split(/\s+/);
    return words[0] === '' ? 0 : words.length;
  }
}
