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

  getTasks(): Promise<Object[]>{
    console.log("get tasks...");
    this.http.get(this.url).toPromise().then(res => console.log("testing get: " + res));
    return this.http.get(this.url).toPromise()
      .then((res:any) => res).catch(this.handleError)
  }

  deleteTask(id: number): Promise<any>{
    var delUrl = this.url + "/" + id;
    return this.http.delete(delUrl).toPromise().then(() => null).catch(this.handleError);

  }

  createTask(task): Promise<any>{
    // might need a null case for this (see previous project)
    console.log("test create task (service)");
    this.http.get(this.url).toPromise().then((res:any) => console.log("get: " + res));
    return this.http.get(this.url).toPromise().then((res:any) => {
      if(res.length == 0){
        return this.http.post<any>(this.url,
          {
            name: task.name,
            date: task.date,
            description: task.description,
            priority: task.priority,
            id: task.id
          }).toPromise()
            .then((res:any) => res.data).catch(this.handleError);
      }
      else{
        console.log("users is NOT null");
        return this.http.post<any>(this.url,
          { // this line used to JSON.stringify the post object, just keep in mind you don't really need to do that anymore!
            name: task.name,
            date: task.date,
            description: task.description,
            priority: task.priority,
            id: task.id
          }).toPromise().then((res:any) => res.data).catch(this.handleError);
      }
    });
  }

  handleError(){

  }

}
