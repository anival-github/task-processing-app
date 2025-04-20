import { Component, OnInit } from '@angular/core';

interface TaskEntry {
  id: string;
  answer: string;
  status: 'processed' | 'failed' | 'pending';
  retries: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tasks: TaskEntry[] = [
    {
      id: '1234',
      answer: 'Answer text',
      status: 'processed',
      retries: 2,
      errorMessage: '-'
    },
    {
      id: '1234',
      answer: 'Answer text',
      status: 'failed',
      retries: 2,
      errorMessage: 'Error message'
    },
    {
      id: '1234',
      answer: 'Answer text',
      status: 'pending',
      retries: 2,
      errorMessage: '-'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  refreshTable(): void {
    // TODO: Implement refresh logic
    console.log('Refreshing table...');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'processed':
        return 'status-processed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
} 