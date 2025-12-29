import { Component, OnInit } from '@angular/core';
import { Header } from "./header/header";
import { CompletedTask } from "./completed-tasks/completed-tasks";
import { NotCompletedTasks } from "./not-completed-tasks/not-completed-tasks";
import { ExpiredTasks } from "./expired-tasks/expired-tasks";
import { Login } from './login/login';
import { Overview } from "./overview/overview";
import { Extensions } from "./extensions/extensions";

@Component({
  selector: 'app-root',
  imports: [Header, CompletedTask, NotCompletedTasks, ExpiredTasks, Login, Overview, Extensions],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = "Keep in Mind";

  isLogged: boolean = false;

  ngOnInit(): void {
    try {
      this.isLogged = !!localStorage.getItem("userInfo");
    } catch {
      this.isLogged = false;
    }
  }

  showApplication(loginSucceeded: boolean): void {
    this.isLogged = loginSucceeded;
  }
}
