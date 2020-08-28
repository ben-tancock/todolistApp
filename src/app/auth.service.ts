import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = 'http://localhost:4000';


  constructor(private http: HttpClient) { }



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


  // post user info to server, return info if correct
  getUserDetails(){

  }
}
