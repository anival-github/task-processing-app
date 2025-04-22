import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Task } from '../../models/task.model';
import { AddTask, FetchTasks, SetTasks, UpdateTaskStatus } from './tasks.actions';
import { patch, append, updateItem } from '@ngxs/store/operators';
import { v4 as uuidv4 } from 'uuid'; // For generating task IDs
import { TaskService } from '../../services/task.service'; // Import TaskService
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Define the shape of the state
export interface TasksStateModel {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

@State<TasksStateModel>({
  name: 'tasks',
  defaults: {
    tasks: [],
    loading: false,
    error: null
  }
})
@Injectable()
export class TasksState {

  constructor(
    private taskService: TaskService, // Inject TaskService
    private store: Store // Keep Store if needed for dispatching other actions
  ) {}

  // Selector to get the list of tasks
  @Selector()
  static getTasks(state: TasksStateModel): Task[] {
    return state.tasks;
  }

  // Selector to get loading state
  @Selector()
  static isLoading(state: TasksStateModel): boolean {
    return state.loading;
  }

  // --- Action Handlers ---

  @Action(AddTask)
  addTask(ctx: StateContext<TasksStateModel>, action: AddTask) {
    const newTask: Task = {
      taskId: uuidv4(), // Generate unique ID
      answer: action.payload.answer,
      status: 'Pending', // Initial status
      retries: 0,
      errorMessage: undefined
    };

    // Optimistically add task to state
    ctx.setState(
      patch({ 
        tasks: append([newTask])
      })
    );

    // Call the API to submit the task
    return this.taskService.submitTask({ taskId: newTask.taskId, answer: newTask.answer }).pipe(
      tap(response => {
        console.log(`API submission success for task ${newTask.taskId}:`, response);
        // Optionally update status locally if API confirms immediate processing start
        // ctx.dispatch(new UpdateTaskStatus({ ...newTask, status: 'Processing' }));
      }),
      catchError(error => {
        console.error(`API submission failed for task ${newTask.taskId}:`, error);
        // Update local state to reflect submission failure
        ctx.setState(
          patch({
            tasks: updateItem<Task>(t => t?.taskId === newTask.taskId, { ...newTask, status: 'Failed', errorMessage: 'Submission Failed' })
          })
        );
        return throwError(() => error); // Rethrow or handle as needed
      })
    );
  }

  @Action(FetchTasks)
  fetchTasks(ctx: StateContext<TasksStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.taskService.getTasks().pipe(
      tap((fetchedTasks) => {
        this.store.dispatch(new SetTasks(fetchedTasks));
      }),
      catchError(error => {
        console.error('API fetch tasks failed:', error);
        ctx.patchState({ loading: false, error: 'Failed to fetch tasks' });
        return throwError(() => error);
      })
    );
  }

  @Action(SetTasks)
  setTasks(ctx: StateContext<TasksStateModel>, action: SetTasks) {
      ctx.setState(
        patch({
          tasks: action.payload,
          loading: false,
          error: null
        })
      );
  }

  @Action(UpdateTaskStatus)
  updateTaskStatus(ctx: StateContext<TasksStateModel>, action: UpdateTaskStatus) {
    ctx.setState(
      patch({
        tasks: updateItem<Task>(
          task => task?.taskId === action.payload.taskId,
          existingTask => ({ ...existingTask, ...action.payload })
        )
      })
    );
  }
} 