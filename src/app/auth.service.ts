import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = 'http://localhost:4000';


  constructor(private http: HttpClient, private router: Router) { }



  loginUser(uname, pw){
    console.log("logging in user: " + uname + " " + pw + '\n');
    // logging in user should be a post request because we want to send user data too
    return this.http.post( this.url + '/tasks',
    {
      username: uname,
      password: pw
    });
    //return this.http.get('/tasks');
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
  renderTasks(uname, pw){
    // return this.http.get(this.url + '/tasks');
    this.router.navigate(['/tasks', {username: uname, password: pw}]);
  }


  // post user info to server, return info if correct
  getUserDetails(){

  }
}
