import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
=======
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

>>>>>>> more login stuff!
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = 'http://localhost:4000';


<<<<<<< HEAD
  constructor(private http: HttpClient) { }
=======
  constructor(private http: HttpClient, private router: Router) { }
>>>>>>> more login stuff!



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

<<<<<<< HEAD
=======
  registerUser(uname, pw){
    console.log("registering user: " + uname + " " + pw + '\n');

    // the object sent needs to be a user object, which contains task objects
    // new user won't have any tasks tho (obvi)
    // also need to check for duplicate usernames
    return this.http.post(this.url + '/register', 
    {
      username: uname,
      password: pw,
      tasks: []
    });
  }


  // takes user tasks data as input, passes it to tasks component
  renderTasks(uname, pw){
    // return this.http.get(this.url + '/tasks');
    this.router.navigate(['/tasks', {username: uname, password: pw}]);
  }

>>>>>>> more login stuff!

  // post user info to server, return info if correct
  getUserDetails(){

  }
}
