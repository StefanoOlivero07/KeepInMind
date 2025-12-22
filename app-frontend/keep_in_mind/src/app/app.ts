import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { CompletedTask } from "./completed-tasks/completed-tasks";
import { NotCompletedTasks } from "./not-completed-tasks/not-completed-tasks";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CompletedTask, NotCompletedTasks],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('keep_in_mind');
}
