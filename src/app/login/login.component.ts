import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username;
  password;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  loginClick(uname, pw){
    this.username = uname;
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);
    this.authService.loginUser(uname, pw).subscribe((res:any) => {
      console.log("server response: " + res);
    });

    this.goToTasks();
  }

  btnRegister(uname, pw){
    console.log("test register!");
    this.authService.registerUser(uname, pw).subscribe((res:any) => {
      console.log("recieved registration response from the server");
    });

    // after user is registered, go to tasks
    // have to do this after user is logged in too, should probably make a function for it 

  }

  goToTasks(){
    this.authService.renderTasks(this.username, this.password);
    // to-do: verify that user login is actually successful
    
  }

}
