import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { TaskStateModel, Task, TaskStatus } from './task.model';
import { TaskActions } from './task.actions';
import { TaskService } from '../core/services/task.service';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { of } from 'rxjs';

@State<TaskStateModel>({
  name: 'tasks',
  defaults: {
    tasks: [],
    loading: false,
    error: null
  }
})
@Injectable()
export class TaskState {
  constructor(private taskService: TaskService) {}

  @Selector()
  static getTasks(state: TaskStateModel): Task[] {
    return state.tasks;
  }

  @Selector()
  static getLoading(state: TaskStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: TaskStateModel): string | null {
    return state.error;
  }

  @Action(TaskActions.SubmitTask)
  submitTask(ctx: StateContext<TaskStateModel>, action: TaskActions.SubmitTask) {
    const state = ctx.getState();
    const taskId = uuidv4();
    const newTask: Task = {
      taskId,
      answer: action.answer,
      status: TaskStatus.PENDING,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    ctx.patchState({
      tasks: [...state.tasks, newTask],
      loading: true,
      error: null
    });

    return this.taskService.submitTask(action.answer).pipe(
      tap(task => ctx.dispatch(new TaskActions.SubmitTaskSuccess(task))),
      catchError(error => {
        console.error('Error submitting task:', error);
        return of(ctx.dispatch(new TaskActions.SubmitTaskFailure(error.message)));
      })
    );
  }

  @Action(TaskActions.SubmitTaskSuccess)
  submitTaskSuccess(ctx: StateContext<TaskStateModel>, action: TaskActions.SubmitTaskSuccess) {
    const state = ctx.getState();
    const tasks = state.tasks.map(task => 
      task.taskId === action.task.taskId ? action.task : task
    );

    ctx.patchState({
      tasks,
      loading: false
    });
  }

  @Action(TaskActions.SubmitTaskFailure)
  submitTaskFailure(ctx: StateContext<TaskStateModel>, action: TaskActions.SubmitTaskFailure) {
    ctx.patchState({
      loading: false,
      error: action.error
    });
  }

  @Action(TaskActions.LoadTasks)
  loadTasks(ctx: StateContext<TaskStateModel>) {
    ctx.patchState({
      loading: true,
      error: null
    });

    return this.taskService.getTasks().pipe(
      tap(tasks => ctx.dispatch(new TaskActions.LoadTasksSuccess(tasks))),
      catchError(error => {
        console.error('Error loading tasks:', error);
        return of(ctx.dispatch(new TaskActions.LoadTasksFailure(error.message)));
      })
    );
  }

  @Action(TaskActions.LoadTasksSuccess)
  loadTasksSuccess(ctx: StateContext<TaskStateModel>, action: TaskActions.LoadTasksSuccess) {
    ctx.patchState({
      tasks: action.tasks,
      loading: false
    });
  }

  @Action(TaskActions.LoadTasksFailure)
  loadTasksFailure(ctx: StateContext<TaskStateModel>, action: TaskActions.LoadTasksFailure) {
    ctx.patchState({
      loading: false,
      error: action.error
    });
  }

  @Action(TaskActions.UpdateTaskStatus)
  updateTaskStatus(ctx: StateContext<TaskStateModel>, action: TaskActions.UpdateTaskStatus) {
    return this.taskService.updateTask(action.taskId, action.task).pipe(
      tap(updatedTask => {
        const state = ctx.getState();
        const tasks = state.tasks.map(task => 
          task.taskId === updatedTask.taskId ? updatedTask : task
        );

        ctx.patchState({
          tasks
        });
      }),
      catchError(error => {
        console.error('Error updating task:', error);
        return of(ctx.dispatch(new TaskActions.LoadTasksFailure(error.message)));
      })
    );
  }
} 