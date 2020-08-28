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

  btnClick(uname, pw){
    this.username = uname;
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);
    this.authService.loginUser(uname, pw).subscribe((res:any) => {
      console.log("server response: " + res);
    });
  }

}
