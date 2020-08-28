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
    // this.url needs to be in the format: '/tasks/<user name>/'
    // might need to call toString on userName?
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
