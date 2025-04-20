export interface Task {
  taskId: string;
  answer: string;
  status: TaskStatus;
  retries: number;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'PENDING' | 'PROCESSED' | 'FAILED'; 