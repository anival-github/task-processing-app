import { Task } from './task.model';

export namespace TaskActions {
  export class SubmitTask {
    static readonly type = '[Task] Submit Task';
    constructor(public answer: string) {}
  }

  export class SubmitTaskSuccess {
    static readonly type = '[Task] Submit Task Success';
    constructor(public task: Task) {}
  }

  export class SubmitTaskFailure {
    static readonly type = '[Task] Submit Task Failure';
    constructor(public error: string) {}
  }

  export class LoadTasks {
    static readonly type = '[Task] Load Tasks';
  }

  export class LoadTasksSuccess {
    static readonly type = '[Task] Load Tasks Success';
    constructor(public tasks: Task[]) {}
  }

  export class LoadTasksFailure {
    static readonly type = '[Task] Load Tasks Failure';
    constructor(public error: string) {}
  }

  export class UpdateTaskStatus {
    static readonly type = '[Task] Update Task Status';
    constructor(public taskId: string, public task: Partial<Task>) {}
  }
} 