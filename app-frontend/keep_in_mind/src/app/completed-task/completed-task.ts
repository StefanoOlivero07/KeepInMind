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
    // TODO: get userId from local storage
    const response = await this.httpService.sendRq("GET", "/api/getCompletedTasks", {"userId": "67661a2f8e4c3b1234567891"});

    if (response.status == 200) {
      this.tasks = response.data;
      console.log(this.tasks);
    }
    else
      alert(response.status + ": " + response.err);
  }
}
