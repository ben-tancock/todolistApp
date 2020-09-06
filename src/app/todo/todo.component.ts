import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { TasksService } from '../tasks.service';
import { AuthService } from '../auth.service';

import { Observable,  } from 'rxjs';
import { catchError, tap, share, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],

  /* why not make an 'out' and 'in' state, instead of two different create and delete animations, in different components and everything?
   we've also proven we don't need the deletion animation to be in the task component, since we sort of have a creation one working. I think.
  If we can somehow target individual tasks in todo component. */
  animations: [
    trigger('enterLeave', [
      state('void', style({
        transform: "translateX(-100%)", height: "100%"
      })),
      transition(':enter', [
        animate('300ms', style({ transform: "translateX(0%)"}))
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: "translateX(-100%)"}))
      ]),
    ]),
  ]
})
export class TodoComponent implements OnInit {
  @Output() created = new EventEmitter<boolean>();
  @ViewChildren("appTask") taskElements: QueryList<any>;

  tasks: Array<any> = [];
  theDate;
  isClicked = false;
  isDeleted = false;
  formatted;
  selectedTask;

  // representation of data stored in user object in server, todo is never responsible for changing
  // when a task is created, todo just lets task service know the new tasks idCount is idCount + 1, which is then relayed to the server
  // but it's always set to 0 here...
  idCount = 0;

  userName = '';
  password = '';



  constructor(private TaskService: TasksService, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    console.log("initializing todo");
    // I'm unsure if this is secure / good programming practice, but it beats passing
    // user info in through the url. Something to look into later.
    // Personally I don't see a huge problem with it?
    this.userName = this.authService.username;
    this.password = this.authService.password;

    //console.log("router params: " + this.userName);
   // this.userName = this.userName.username;
    this.getTasks();
  }

  ngAfterViewInit(){

  }

  @HostListener('click') onMouseClick(){
    console.log('clicked!');
  }


  // we need the task component to tell us when certain parts of it have been clicked, hence why the create button is almost entirely done in todo
  taskAnimated(emit){
    //console.log("test task animated emit: " + JSON.stringify(emit));
    if(emit.status == 'deleted'){
      //console.log("emit deleted on task: " + emit.id);
      this.deleteTask(emit.id);
    }

  }

  addTask(task){
    // all undefined!!
    let printing = JSON.parse(task);
    //console.log("TASK OBJECT: " + printing.name);
    console.log("task print out: " + '\n' + printing.name + '\n' + printing.description) // undefined

    this.tasks.push(JSON.parse(task));
    console.log("\ntasks: " + this.tasks);
  }

  // needs to remove by id
  removeTask(id){
    // This only pops off the end. We can fix this by using an ArrayList
    // nvm javascript doesn't have arraylist lol
    let index = this.tasks.findIndex(task => (task.id == id));
    this.tasks.splice(index, 1);
  }

  getTasks(){
    this.TaskService.getTasks(this.userName, this.password).subscribe((res:any) => {
      console.log("tasks response from server: " + JSON.stringify(res)); // is blank...
      if(!res.length){
        console.log("\nERROR GETTING TASKS FROM SERVER");
      }
      this.tasks = res.tasks;
      this.idCount = res.idCount;
    });
  }

  printElements(){
    // oooh! these are element references!!!
    this.taskElements.forEach((task) => {
      console.log(task.taskId);
    });
  }

  createAnimation(id){
     // the task we want doesn't exist at this point
    this.taskElements.changes.subscribe(() => {
      //console.log("creating animation for: " + this.taskElements.find(task => task.taskId == id));
      this.taskElements.find(task => task.taskId == id).setState('created');
      //console.log("created");
    });
    //console.log("end of method");

  }

  createTask(taskName, taskDesc, taskPriority){
    this.theDate = new Date();
    let newId = this.idCount + 1;

    // this is printing really weird shit...
    console.log("creating task, this is the task id: " + newId);
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: this.idCount + 1,
      state: ''
    }

    //console.log("tasks length: " + this.tasks.length);
    this.selectedTask = newTask;

    this.TaskService.createTask(this.userName, this.password, newTask).subscribe((res:any) => {

      // once the data has been inserted, does that mean that the task component itself exists?
      // I'm guessing no...
      // getTasks() is when there's an actual, physical element on the screen for us to modify
      // let's try putting this after?
      console.log(JSON.stringify(res)); // prints the msg property of the server response!
      // once we get a message back indicating a success, we have to update the client-side task list by calling getTasks again
      if(res.status == "success"){
        console.log("creation successful");
        console.log( "created task: " + JSON.stringify(res.task));
        this.addTask(JSON.stringify(res.task));
        console.log("id count: " + JSON.stringify(res));
        this.idCount = res.idCount;
        //this.createAnimation(newTask.id);

      }
      else{
        console.log("creation failed!");
      }
    });
  }

  // finds the task with the matching id, sends msg to server
  deleteTask(id){
    console.log("delete task being called...");
    console.log("delete task " + id);
    this.TaskService.deleteTask(this.userName, this.password, id).subscribe((res:any) => {
      console.log("task deletion complete - server response: " + JSON.stringify(res));
      //this.getTasks(); // make a remove task instead
      this.removeTask(id);
    });

  }

  completeTask(){
    console.log("test complete task");
    // <action that sends task to a completed tasks array>
    //this.deleteTask()
  }
}
