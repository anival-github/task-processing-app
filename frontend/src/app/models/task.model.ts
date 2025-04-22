export type TaskStatus = 'Pending' | 'Processed' | 'Failed';

export interface Task {
  taskId: string;
  answer: string;
  status: TaskStatus;
  retries: number;
  errorMessage?: string;
} 