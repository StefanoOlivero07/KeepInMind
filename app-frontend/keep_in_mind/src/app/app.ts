import { Component, Input, OnInit } from '@angular/core';
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
  protected readonly title: string = "Keep in Mind";
  name: string = "";

  isLogged: boolean = false;

  ngOnInit(): void {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
      
      this.isLogged = !!userInfo;
      this.name = userInfo.name;
    } catch {
      this.isLogged = false;
    }
  }

  showApplication(loginSucceeded: boolean): void {
    this.isLogged = loginSucceeded;
  }

  onLogout(isLogout: boolean): void {
    this.isLogged = !isLogout;
    localStorage.removeItem("userInfo");
  }
}
