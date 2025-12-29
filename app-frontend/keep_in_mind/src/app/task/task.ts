import { Component, Input } from '@angular/core';
import { CommonModule, NumberSymbol } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [CommonModule],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task {
  @Input() task: any;

  getBorderClass() {
    let borderClass: string = "";

    if (this.task.completed)
      borderClass = "card-completed";
    else if (!this.task.completed && !this.isExpired() && this.dayDiff(new Date(this.task.expiration)) > 3)
      borderClass = "card-not-completed";
    else if (!this.task.completed && !this.isExpired() && this.dayDiff(new Date(this.task.expiration)) <= 3)
      borderClass = "card-soon-expiring";
    else
      borderClass = "card-expired"; 
    return borderClass;
  }

  isExpired(): boolean {
    return new Date(this.task.expiration) < new Date();
  }

  getStyle(completed: boolean) {
    if (completed)
      return {"width": "100%"};
    return {"width": "5.5rem"};
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString()
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  dayDiff(expirationDate: Date): number {
    const currentDate = new Date();
    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}