import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username;
  password;


  constructor() { }

  ngOnInit(): void {
  }

  btnClick(uname, pw){
    this.username = uname;
    this.password = pw;
    console.log("username and password set: \n" + this.username + "\n" + this.password);
  }

}
