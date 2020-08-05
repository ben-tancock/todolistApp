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
  tasks: any = [
    {
      name: "sample task",
      date: "today",
      description: "lorem ipsum",
      priority: "testing priority",
      id: 0
    }
  ];

  selectedTask;

  constructor(private TaskService: TasksService) { }

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(){
    this.TaskService.getTasks().then(tasks => this.tasks = tasks);
  }

  createTask(taskName, taskDesc, taskPriority){
    let newTask = {
      name: taskName,
      date: "sample",
      description: taskDesc,
      priority: taskPriority,
      id: 1
    }
    this.TaskService.createTask(newTask).then((res:any) => {
      console.log("task creation testing...");
    });
  }

  

  

}
