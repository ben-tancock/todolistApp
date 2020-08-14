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

  getTasks(){
    console.log("get tasks...");
    return this.http.get(this.url + '/tasks');
    /*this.http.get(this.url).toPromise().then(res => console.log("testing get: " + res));
    return this.http.get(this.url).toPromise()
      .then((res:any) => res).catch(this.handleError)*/
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
    // might need a null case for this (see previous project)
    console.log("test create task (service)");
    return this.http.post(this.url + '/create',
    {
      name: task.name,
      date: task.date,
      description: task.description,
      priority: task.priority,
      id: task.id,
      tState: task.tState
    });
  }



  handleError(){

  }

}
