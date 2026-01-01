import { Component } from '@angular/core';
import { MockRequests } from '../mock.service';
import { Message } from '../message';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  chart: any = null;

  options: any = {
    "type": "pie",
    "data": {
      "labels": [],
      "datasets": [
        {
          "data": [],
          "fill": false,
          "tension": 0.1,
          "backgroundColor": [
            "#007bff",
            "#28a745",
            "#dc3545"
          ]
        }
      ]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": {
          "position": "top",
          "labels": {
            "color": "#fff",
            "display": true,
            "boxWidth": 12,
            "padding": 8
          }
        }
      }
    }
  };

  notCompleted: number = 0;
  completed: number = 0;
  expired: number = 0;

  constructor(private mockRequests: MockRequests) { }

  ngOnInit(): void {
    const userId = JSON.parse(localStorage.getItem("userInfo")!).userId;
    const response = this.mockRequests.getAllTasks(userId);

    if (response.status == 200) {
      this.options.data.labels = ["Da completare", "Completati", "Scaduti"];
      this.notCompleted = response.data.notCompleted;
      this.completed = response.data.completed;
      this.expired = response.data.expired;
      this.options.data.datasets[0].data = [this.notCompleted, this.completed, this.expired];
    }
    else
      Message.showError(response.status, response.message);
    this.showChart();
  }

  showChart(): void {
    const ctx: CanvasRenderingContext2D = (document.getElementById("chartMark") as HTMLCanvasElement).getContext("2d")!;

    if (this.chart)
      this.chart.destroy();

    this.chart = new Chart(ctx, this.options);
  }
}
