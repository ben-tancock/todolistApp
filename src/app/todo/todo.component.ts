import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { TasksService } from '../tasks.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


//import { Task } from '../task';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],

  /* why not make an 'out' and 'in' state, instead of two different create and delete animations, in different components and everything?
   we've also proven we don't need the deletion animation to be in the task component, since we sort of have a creation one working. I think.
  If we can somehow target individual tasks in todo component. */
  animations: [
    trigger('flyInOut', [
      state('in', style({ /*transform: 'translateX(0)'*/
        border: 'solid 5px yellow' })),

      state('out', style({
        border: 'solid 5px green'})),

      transition('void => out', [
        style({ transform: 'translateX(-100%)' }),
        animate(350)
      ]),
      /*transition('* => void', [
        animate(500, style({ transform: 'translateX(100%)' }))
      ])*/
    ])
  ]
})
export class TodoComponent implements OnInit {
  @Output() created = new EventEmitter<boolean>();

  tasks: any = [];
  theDate;
  isClicked = false;
  isDeleted = false;
  formatted;
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
    this.theDate = new Date();
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: this.tasks.length
    }
    console.log("tasks length: " + this.tasks.length);
    this.selectedTask = newTask;

    this.TaskService.createTask(newTask).subscribe((res:any) => {
      console.log(JSON.stringify(res)); // prints the msg property of the server response!
      // once we get a message back indicating a success, we have to update the client-side task list by calling getTasks again
      if(res.status == "success"){
        console.log("creation successful");
        this.getTasks();
      }
      else{
        console.log("creation failed!");
      }
    });
  }

  // finds the task with the matching id, sends msg to server
  deleteTask(id){
    console.log("delete task " + id);
    this.TaskService.deleteTask(id).subscribe((res:any) => {
      console.log("task deletion complete - server response: " + JSON.stringify(res));
      this.getTasks();
      console.log("tasks remaining: " + this.tasks.length); // tasks aren't being removed, despite server success

      // the server might be saying it's successful, but it's probably successfully deleting 0 tasks... is our filter wrong?
    });

  }

  completeTask(){
    console.log("test complete task");
    // <action that sends task to a completed tasks array>
    //this.deleteTask()
  }
}
