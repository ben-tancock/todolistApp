import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from './../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //url = 'http://localhost:4000';
  //url = 'https://to-do-bentancock.herokuapp.com'
  url = environment.apiUrl;


  username;
  password;
  loggedIn = false;

  //localStorage.setItem("token", this.username);


  constructor(private http: HttpClient, private router: Router) { }

  login(uname, pw){
    console.log("logging in user: " + uname + " " + pw + '\n');
    console.log("the url: " + this.url);
    //console.log()
    this.username = uname;
    this.password = pw;
    return this.http.post(this.url + '/login', {username: uname, password: pw}, {
      headers: new HttpHeaders({

        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': this.url // this might just need to be the api url
      }),
      withCredentials: true
    });
  }

  setLogin(bool){
    this.loggedIn = bool;
  }

  logout(){
    console.log("test auth logout");
    return this.http.post(this.url + '/logout', {body: 'logout'},  {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json',
        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': "*"
      }),
      withCredentials: true
    });
  }

  loginCheck(){
    console.log("test auth service login check");
    return this.http.post(this.url + '/loginCheck', {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json',
        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': "*"
      }),
      withCredentials: true
    });
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
    },
    {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json',
        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': "*"
      }),
      withCredentials: true
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
