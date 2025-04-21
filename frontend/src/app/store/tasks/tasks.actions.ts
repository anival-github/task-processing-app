import { Task } from "../../models/task.model";

export class AddTask {
  static readonly type = '[Tasks] Add Task';
  constructor(public payload: { answer: string }) {}
}

// Action to represent fetching all tasks (e.g., on load or refresh)
export class FetchTasks {
  static readonly type = '[Tasks] Fetch Tasks';
}

// Action dispatched by WebSocket or polling when a task status updates
export class UpdateTaskStatus {
  static readonly type = '[Tasks] Update Task Status';
  constructor(public payload: Task) {}
}

// Action to represent setting the initial or fetched list of tasks
export class SetTasks {
    static readonly type = '[Tasks] Set Tasks';
    constructor(public payload: Task[]) {}
} 