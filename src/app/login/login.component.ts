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
   /*this.authService.testRoute().subscribe((res:any) => {
      console.log("test route");
    })*/
    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
      if(res.authenticated == true){
        this.authService.setLogin(true); // why do we need this again?
        this.authService.renderTasks();
      }
    });
  }

  loginClick(uname, pw){
    this.username = uname;
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);

    this.authService.login(uname, pw).subscribe((res:any) => {
      if(res.status == 'success'){
        this.authService.setLogin(true);
        this.goToTasks();
      }
    });
  }

  btnRegister(uname, pw){
    console.log("test register!");
    this.authService.registerUser(uname, pw).subscribe((res:any) => {
      console.log("recieved registration response from the server");
    });
  }

  goToTasks(){
    this.authService.renderTasks();
  }
}
