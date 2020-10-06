import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // start timer
    // do exactly what the login button does from the login page
    // have login pass username and pw to you
    console.log("navigated to registration with %s", this.authService.username, this.authService.password );

    window.setTimeout(() => {
      this.authService.login(this.authService.username, this.authService.password).subscribe((res:any) => { // if the server successfully finds the user and authenticates, set guard variable and go to todo tasks page
        console.log("server login res: " + res);
        if(res.status == 'success'){
          console.log("test login success");
          this.authService.setLogin(true);
          this.authService.renderTasks();
        }
        else{
          console.log("test login failure");
        }
      });
    }, 3000);
  }
}
