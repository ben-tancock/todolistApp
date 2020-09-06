import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap, share, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TasksService {
  url = 'http://localhost:4000' // the port the mongo database is listening on
  constructor(private http: HttpClient) { }


  getTasks(userName, pw){
    console.log("tasks service: get tasks \n");
    // user data, such as username and pw, should probably not be in the url, and sent over as a data object instead?
    // we don't have encryption and bcrypt and session token stuff working yet, so for now url might be the simplest way, just to ensure this stuff works

    // since we are NEVER supposed to send user data in the url, should this be a POST call?
    // GET is for viewing stuff (I know that), but the stuff I'm viewing is sensitive and requires me to specify a user, which should be kept secret
    // https://stackoverflow.com/questions/46585/when-do-you-use-post-and-when-do-you-use-get
    //return this.http.get(this.url + '/tasks/' + userName);
    // also, if we're getting a users stuff, we need to send a username AND a pw
    return this.http.post(this.url + '/tasks', {username: userName, password: pw},
    {
      headers: new HttpHeaders({
        'Access-Control-Allow-Credentials' : 'true'
      }),
      withCredentials: true
    });
  }

  deleteTask(uname, pw, id: number ){
    var delUrl = this.url + "/deleteTask/" + id;
    //return this.http.delete(delUrl).toPromise().then(() => null).catch(this.handleError);
    //return this.http.delete(delUrl);

    // probably should just make it POST for securities sake, also make url specify task deletion as opposed to user deletion
    return this.http.post(delUrl, {username: uname, password: pw}, {withCredentials: true});

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

    // send user data, AND a task object
    return this.http.post(this.url + '/create',
    {
      task:
      {
        name: task.name,
        date: task.date,
        description: task.description,
        priority: task.priority,
        id: task.id + 1,
        state: task.state
      },
      user:
      {
        username: uname,
        password: pw
      }
    },
    {
      headers: new HttpHeaders({'Access-Control-Allow-Credentials' : 'true'}),
      withCredentials: true
    }
  );
  }



  handleError(){

  }

}
