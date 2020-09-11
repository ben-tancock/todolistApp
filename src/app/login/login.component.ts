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
    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
      if(res.authenticated == true){ // if the user is already authenticated, redirect to tasks
        this.authService.setLogin(true); // guard will use this to allow logged in users to access tasks
        this.authService.renderTasks();
      }
    });
  }

  // when the user clicks the login button
  loginClick(uname, pw){
    this.username = uname; // we'll pass these variables to the auth service, which will be retrieved by the todo component to store as local variables
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);

    this.authService.login(uname, pw).subscribe((res:any) => { // if the server successfully finds the user and authenticates, set guard variable and go to todo tasks page
      if(res.status == 'success'){
        this.authService.setLogin(true);
        this.goToTasks();
      }
    });
  }

  // when the user clicks the register button
  btnRegister(uname, pw){
    console.log("test register!");
    this.authService.registerUser(uname, pw).subscribe((res:any) => { // send registration request to the server
      console.log("recieved registration response from the server");
      // TODO: add error handling / messaging to user (e.g. if username already exists)
    });
  }

  goToTasks(){
    this.authService.renderTasks();
  }
}
