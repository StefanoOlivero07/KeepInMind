import { Component } from '@angular/core';
import { HttpService } from '../http.service';
import { MockRequests } from '../mock.service';
import { Message } from '../message';
import { Task } from '../task/task';

@Component({
  selector: 'app-not-completed-tasks',
  imports: [Task],
  templateUrl: './not-completed-tasks.html',
  styleUrl: './not-completed-tasks.css',
})
export class NotCompletedTasks {
  tasks: any[] = [];

  constructor(private httpService: HttpService, private mockRequests: MockRequests) {}

  async ngOnInit() {
    // TODO get userId from local storage
    const response = this.mockRequests.getNotCompletedTasks("67661a2f8e4c3b1234567890");

    if (response.status == 200) {
      this.tasks = response.data;
    }
    else
      Message.showError(response.status, "Failed to load not completed tasks");
  }
}
