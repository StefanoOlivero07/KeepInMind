import { Component } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-completed-task',
  imports: [],
  templateUrl: './completed-task.html',
  styleUrl: './completed-task.css',
})
export class CompletedTask {
  tasks: any[] = [];

  constructor(private httpService: HttpService) {}

  async ngOnInit() {
    const response = await this.httpService.sendRq("GET", "/api/getCompletedTasks");

    if (response.status == 200) {
      this.tasks = response.data;
      console.log(this.tasks);
    }
    else
      alert(response.status + ": " + response.err);
  }
}
