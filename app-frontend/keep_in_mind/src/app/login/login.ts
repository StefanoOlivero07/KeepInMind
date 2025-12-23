import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockRequests } from '../mock.service';
import CryptoJS, { enc } from 'crypto-js';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  @Output() loginSucceeded: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private mockReq: MockRequests) {}

  isNewUser: boolean = false;
  isError: boolean = false;

  protected emailValue: string = "";
  protected passwordValue: string = "";
  private encriptedPassword: string = "";

  errorMessage: string = "";

  onClickNewAccount(): void {
    this.isNewUser = !this.isNewUser;
  }

  onClickLogIn(): void {
    // DB authentication and localStorage management

    if (this.emailValue && this.passwordValue) {
      this.encriptedPassword = CryptoJS.MD5(this.passwordValue).toString();
      console.log(this.encriptedPassword);

      const response = this.mockReq.login(this.emailValue, this.encriptedPassword);
  
      if (response.status == 200) {
          this.loginSucceeded.emit(true);
          localStorage.setItem("userInfo", JSON.stringify({"userId": response.data._id.$oid, "name": response.data.name}));
        return;
      }
  
      this.isError = true;
      this.errorMessage = response.message;
    }
    else {
      this.emailValue = this.passwordValue = "";
      this.isError = true;
      this.errorMessage = "Riempire tutti i campi";
    }
  }

  showError(): any {
    return !this.isError ? "d-none" : "d-block";
  }
}
