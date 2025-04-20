import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  wordCount: number = 0;
  maxWords: number = 200;
  answer: string = '';

  constructor() {}

  ngOnInit(): void {}

  onAnswerChange(event: any): void {
    const words = event.target.value.trim().split(/\s+/);
    this.wordCount = words[0] === '' ? 0 : words.length;
  }

  onSubmit(): void {
    // TODO: Implement submission logic
    console.log('Submitting answer:', this.answer);
  }
} 