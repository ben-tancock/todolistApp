import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { TasksService } from '../tasks.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

//import { Task } from '../task';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  // this only works for one description, the description doesn't change for each click
 // @ViewChild("taskDescription", {read: ElementRef}) taskDescription: ElementRef;
  tasks: any = [];
  theDate;
  isClicked = false;

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

  // this works, don't need directives for mouse clicking
  // but, it's also for the entire list object, we need task components I think
 /* @HostListener('click') onMouseClick(){
    //console.log("this is the task description: " + this.taskDescription.nativeElement.innerText);
    //this.isClicked = !this.isClicked;
  }*/

  createTask(taskName, taskDesc, taskPriority){
    this.theDate = new Date();
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: this.tasks.length
    }

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
      console.log("tasks remaining: " + this.tasks); // tasks aren't being removed, despite server success

      // the server might be saying it's successful, but it's probably successfully deleting 0 tasks... is our filter wrong?
    });

  }
}
