import { Component, OnInit } from '@angular/core';
import { TasksService } from '../tasks.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  tasks: any = [];

  selectedTask;

  constructor(private TaskService: TasksService) { }

  ngOnInit() {
    this.getTasks();
  }

  getTasks(){
    this.TaskService.getTasks().subscribe((res:any) => {
      console.log("the response: " + JSON.stringify(res));
      this.tasks = res;
    });
  }

  createTask(taskName, taskDesc, taskPriority){
    let newTask = {
      name: taskName,
      date: "sample",
      description: taskDesc,
      priority: taskPriority,
      id: 1
    }

    this.TaskService.createTask(newTask).subscribe((res:any) => {
      console.log(res.msg); // prints the msg property of the server response!
    });

  }





}
