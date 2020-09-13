import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AuthService } from '../auth.service';
import {MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('alert1', { static: true }) alert1: ElementRef;
  @ViewChild('alert2', { static: true }) alert2: ElementRef;
  @ViewChild('alert3', { static: true }) alert3: ElementRef;
  username;
  password;
  openingMessage = true;
  registrationFail = false;
  loginFail = false;

  constructor(private authService: AuthService, private snackbar: MatSnackBar, private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit(): void {

    //this.fadeAlert(); apply this to all alerts on initialization

    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
      if(res.authenticated == true){ // if the user is already authenticated, redirect to tasks
        this.authService.setLogin(true); // guard will use this to allow logged in users to access tasks
        this.authService.renderTasks();
      }
    });
  }

  closeAlert(alertnum){
    if(alertnum == 1){
     // this.alert1.nativeElement.classList.remove('show');
      //this.alert1.nativeElement.remove();
      this.renderer.removeChild(this.el.nativeElement, this.alert1.nativeElement);
      this.renderer.removeChild(this.el.nativeElement, this.alert1.nativeElement);
      //this.openingMessage = false;
      console.log("remove 1");
    }
    else if(alertnum == 2){
      this.alert2.nativeElement.classList.remove('show');
      this.renderer.removeChild(this.el.nativeElement, this.alert2.nativeElement);
      console.log("remove 2");
    }
    else{
      this.alert3.nativeElement.classList.remove('show');
      //this.alert3.nativeElement.classList.remove();
      //this.renderer.removeChild(this.el.nativeElement, this.alert3.nativeElement);
      console.log("remove 3");
    }
  }

  fadeAlert(){
    // fix for each alert
    window.setTimeout(() => {
      this.closeAlert(1);
    }, 5000);
  }

  // use for showing registration failure, login failure, etc.
  showAlert(alertType){
    if(alertType == 'registration'){
      this.alert2.nativeElement.classList.add('show');
    }
    else{
      this.alert3.nativeElement.classList.add('show');
    }

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
        this.showAlert('login');
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
        this.showAlert('registration');
      }
    });
  }

  goToTasks(){
    this.authService.renderTasks();
  }
}
