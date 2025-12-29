import { Component, EventEmitter, Output } from '@angular/core';
import { HttpService } from '../http.service';
import { MockRequests } from '../mock.service';
import { Message } from '../message';
import { Task } from '../task/task';

@Component({
  selector: 'app-completed-task',
  imports: [Task],
  templateUrl: './completed-tasks.html',
  styleUrl: './completed-tasks.css',
})
export class CompletedTask {
  @Output() isLoggedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() requestedTaskIdEvent: EventEmitter<string> = new EventEmitter<string>();
  tasks: any[] = [];

  constructor(private httpService: HttpService, private mockRequests: MockRequests) {}

  async ngOnInit() {
    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      this.isLoggedEvent.emit(false);
      return;
    }

    const userId: string = JSON.parse(userInfo).userId;
    const response = this.mockRequests.getCompletedTasks(userId);

    if (response.status == 200) {
      this.tasks = response.data;
    }
    else
      Message.showError(response.status, response.message);
  }

  requestedTaskId(taskId: string): void {
    this.requestedTaskIdEvent.emit(taskId);
  }
}