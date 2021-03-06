import { Component, OnInit} from '@angular/core';
import { AuthService } from '../auth.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fade', [
      state('open', style({
        opacity: 1
      })),

      transition(':enter', [
        animate('300ms', style({ opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0}))
      ]),
    ]),
    trigger('fadeSlide', [
      state('in', style({ opacity:1,transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity:0,transform: 'translateY(100%)' }),
        animate(200)
      ]),
      transition('* => void', [
        animate(200, style({ opacity:0,transform: 'translateY(100%)' }))
      ])
    ]),
  ]

})
export class LoginComponent implements OnInit {

  username;
  password;
  showGreeting=false;
  showRegistration=false;
  showLogin=false;
  registrationText='';
  loginText='';

  constructor(private authService: AuthService, private router: Router) { }


  ngOnInit(): void {
    this.alertToggle('greeting');

    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
      if(res.authenticated == true){ // if the user is already authenticated, redirect to tasks
        this.authService.setLogin(true); // guard will use this to allow logged in users to access tasks
        this.authService.renderTasks();
      }
    });
  }

  alertToggle(alertType){
    if(alertType == 'greeting'){
      this.showGreeting = !this.showGreeting;
      window.setTimeout(() => {
        this.showGreeting = !this.showGreeting
      }, 5000);
    }
    else if(alertType == 'register'){
      this.showRegistration = !this.showRegistration;
      window.setTimeout(() => {
        this.showRegistration = !this.showRegistration;
      }, 5000);
    }
    else{
      this.showLogin = !this.showLogin;
      window.setTimeout(() => {
        this.showLogin = !this.showLogin;
      }, 5000);
    }
    console.log("test toggle alert");
  }

  // when the user clicks the login button
  loginClick(uname, pw){
    if(uname.length == 0 || pw.length == 0){
      console.log("please enter username and password");
      this.loginText = "<strong>Error:</strong> <p>Please enter a username/password</p>";
      this.alertToggle('login');
      return;
    }
    this.username = uname; // we'll pass these variables to the auth service, which will be retrieved by the todo component to store as local variables
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);

    this.authService.login(uname, pw).subscribe((res:any) => { // if the server successfully finds the user and authenticates, set guard variable and go to todo tasks page
      console.log("server login res: " + res);
      if(res.status == 'success'){
        console.log("test login success");
        this.authService.setLogin(true);
        this.goToTasks();
      }
      else{
        console.log("test login failure");
        this.loginText = "<strong>Error:</strong> <p>your username/password was incorrect</p>";
        this.alertToggle('login');
      }
    });
  }

  // when the user clicks the register button
  btnRegister(uname, pw){
    if(uname.length == 0 || pw.length == 0){
      // TO DO: make alert appear
      console.log("please enter username and password");
      this.registrationText = "<strong>Error:</strong> <p>Please enter a username/password</p>";
      this.alertToggle('register');
      return;
    }
    console.log("test register!");
    this.authService.registerUser(uname, pw).subscribe((res:any) => { // send registration request to the server
      console.log("recieved registration response from the server");
      if(res.status == 'failed'){
        console.log("displaying registration error");
        this.registrationText = "<strong>Error: </strong> registration failed, there is already a user with that username.";
        this.alertToggle('register');
      }
      else{
        this.registrationText = "<strong>Registration successful!</strong>";
        this.alertToggle('register');
        this.authService.username = uname;
        this.authService.password = pw;
        this.router.navigate(['registration']);
      }
    });
  }

  goToTasks(){
    this.authService.renderTasks();
  }

  onKeyDown(event, uname, pw){
    if(event.keyCode == 13){
      this.loginClick(uname, pw);
    }
  }
}
