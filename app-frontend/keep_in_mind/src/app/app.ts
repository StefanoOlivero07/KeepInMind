import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { CompletedTask } from "./completed-task/completed-task";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CompletedTask],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('keep_in_mind');
}
