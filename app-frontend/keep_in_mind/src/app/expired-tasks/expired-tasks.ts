import { Component, EventEmitter, Output } from '@angular/core';
import { HttpService } from '../http.service';
import { MockRequests } from '../mock.service';
import { Message } from '../message';
import { Task } from '../task/task';

@Component({
  selector: 'app-expired-tasks',
  imports: [Task],
  templateUrl: './expired-tasks.html',
  styleUrl: './expired-tasks.css',
})
export class ExpiredTasks {
  @Output() isLoggedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  tasks: any = [];

  constructor(private httpService: HttpService, private mockRequests: MockRequests) {}

  async ngOnInit() {
    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      this.isLoggedEvent.emit(false);
      return;
    }

    const userId: string = JSON.parse(userInfo).userId;
    const response = this.mockRequests.getExpiredTasks(userId);

    if (response.status === 200) {
      this.tasks = response.data;
      console.log(this.tasks);
    }
    else
      Message.showError(response.status, response.message);
  }
}
