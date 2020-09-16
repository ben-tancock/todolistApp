import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap, share, map } from 'rxjs/operators';
import { environment } from './../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class TasksService {
  //url = 'http://localhost:4000' // the port the mongo database is listening on
  //url = 'https://to-do-bentancock.herokuapp.com';
  url = environment.apiUrl;
  constructor(private http: HttpClient) { }


  getTasks(userName, pw){
    console.log("tasks service: get tasks \n");
    console.log("username and pw to post: " + userName + " " + pw);

    return this.http.post(this.url + '/getTasks', {username: userName, password: pw},
    {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': "*"
      }),
      withCredentials: true
    });
  }

  deleteTask(uname, pw, id: number ){
    var delUrl = this.url + "/deleteTask/" + id;

    return this.http.post(delUrl, {username: uname, password: pw},
      {
        headers: new HttpHeaders({
          'Access-Control-Allow-Credentials' : 'true',
          'Access-Control-Allow-Origin': "*"
        }),
        withCredentials: true
      }
    );

  }

  /*
  a task object has a:
  - name
  - date
  - description
  - priority
  - id
  */
  createTask(uname, pw, task){
    console.log("test create task (service)");

    // send user data, and a task object
    return this.http.post(this.url + '/create',
    {
      task:
      {
        name: task.name,
        date: task.date,
        description: task.description,
        priority: task.priority,
        id: task.id,
        state: task.state
      },
      user:
      {
        username: uname,
        password: pw
      }
    },
    {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true',
        'Access-Control-Allow-Origin': "*"
      }),
      withCredentials: true
    }
  );
  }



  handleError(){

  }

}
