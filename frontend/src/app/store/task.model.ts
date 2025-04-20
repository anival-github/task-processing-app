export interface Task {
  taskId: string;
  answer: string;
  status: TaskStatus;
  retries: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 'Pending',
  PROCESSED = 'Processed',
  FAILED = 'Failed'
}

export interface TaskStateModel {
  tasks: Task[];
  loading: boolean;
  error: string | null;
} 