import { Component } from '@angular/core';
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
  tasks: any = [];

  constructor(private httpService: HttpService, private mockRequests: MockRequests) {}

  async ngOnInit() {
    const response = this.mockRequests.getExpiredTasks("67661a2f8e4c3b1234567890");

    if (response.status === 200) {
      this.tasks = response.data;
      console.log(this.tasks);
    }
    else
      Message.showError(response.status, response.message);
  }
}
