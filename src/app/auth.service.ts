import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //url = 'http://localhost:4000';
  url = 'https://to-do-bentancock.herokuapp.com'


  username;
  password;
  loggedIn = false;

  //localStorage.setItem("token", this.username);


  constructor(private http: HttpClient, private router: Router) { }



  /*testRoute(){
    console.log("auth doing test route");
    return this.http.get(this.url + '/');
  }*/

  login(uname, pw){
    console.log("logging in user: " + uname + " " + pw + '\n');
    this.username = uname;
    this.password = pw;
    return this.http.post(this.url + '/login', {username: uname, password: pw}, {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true'
      }),
      withCredentials: true
    });
  }

  setLogin(bool){
    this.loggedIn = bool;
  }

  logout(){
    console.log("test auth logout");
    return this.http.get(this.url + '/logout',  {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true'
      }),
      withCredentials: true
    });
  }

  loginCheck(){
    return this.http.get(this.url + '/loginCheck', {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true'
      }),
      withCredentials: true
    } );
  }



  registerUser(uname, pw){
    console.log("registering user: " + uname + " " + pw + '\n');

    // the object sent needs to be a user object, which contains task objects
    // new user won't have any tasks tho (obvi)
    // also need to check for duplicate usernames
    return this.http.post(this.url + '/register',
    {
      username: uname,
      password: pw,
      idCount: 0,
      id: Date.now().toString(),
      tasks: []
    });
  }


  // takes user tasks data as input, passes it to tasks component
  renderTasks(){
    console.log("render tasks \n");
    this.router.navigate(['/tasks']);
  }


  // post user info to server, return info if correct
  getUserDetails(){

  }
}
