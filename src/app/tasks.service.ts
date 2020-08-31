import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  url = 'http://localhost:4000' // the port the mongo database is listening on
  constructor(private http: HttpClient) { }

  getTasks(userName){
    console.log("get tasks...");
    

    // user data, such as username and pw, should probably not be in the url, and sent over as a data object instead?
    // we don't have encryption and bcrypt and session token stuff working yet, so for now url might be the simplest way, just to ensure this stuff works
    return this.http.get(this.url + '/tasks/' + userName);

  }

  deleteTask(id: number){
    var delUrl = this.url + "/" + id;
    //return this.http.delete(delUrl).toPromise().then(() => null).catch(this.handleError);
    return this.http.delete(delUrl);

  }

  /*
  a task object has a:
  - name
  - date
  - description
  - priority
  - id
  */
  createTask(task){
    console.log("test create task (service)");
    return this.http.post(this.url + '/create',
    {
      name: task.name,
      date: task.date,
      description: task.description,
      priority: task.priority,
      id: task.id,
      state: task.state
    });
  }



  handleError(){

  }

}
