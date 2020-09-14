import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AuthService } from '../auth.service';
import {MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


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
  ]
})
export class LoginComponent implements OnInit {
  @ViewChild('greetingAlert', { static: true }) greetingAlert: ElementRef;
  @ViewChild('registrationAlert', { static: true }) registrationAlert: ElementRef;
  @ViewChild('loginAlert', { static: true }) loginAlert: ElementRef;
  username;
  password;
  showGreeting=false;
  showRegistration=false;
  showLogin=false;
  registrationText='';

  constructor(private authService: AuthService, private snackbar: MatSnackBar, private renderer: Renderer2, private el: ElementRef) { }

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

    //this.fadeAlert(alertType);
    console.log("test toggle alert");

  }

  // when the user clicks the login button
  loginClick(uname, pw){
    if(uname.length == 0 || pw.length == 0){
      // TO DO: make alert appear
      console.log("please enter username and password");
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
        this.alertToggle('login');
      }
    });
  }

  // when the user clicks the register button
  btnRegister(uname, pw){
    console.log("test register!");
    this.authService.registerUser(uname, pw).subscribe((res:any) => { // send registration request to the server
      console.log("recieved registration response from the server");
      if(res.status == 'failed'){
        console.log("displaying registration error");
        this.registrationText = "<strong>Error: </strong> registration failed, there is already a user with that username.";
        this.alertToggle('register');
      }
    });
  }

  goToTasks(){
    this.authService.renderTasks();
  }
}
