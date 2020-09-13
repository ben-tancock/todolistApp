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
import { typeofExpr } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],

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
  idCount = 0;
  userName;
  password;
  constructor(private TaskService: TasksService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    console.log("initializing todo");
    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
    });
    // I'm unsure if this is secure / good programming practice, but it beats passing
    // user info in through the url. Something to look into later.
    // Personally I don't see a huge problem with it?
    let uname = window.localStorage.getItem('userName');
    let pw = window.localStorage.getItem('password');
    console.log("local storage before if stuff: " + uname + " " + pw);

    if(uname == 'undefined' ||  pw == 'undefined' || uname == 'null' || pw == 'null' || uname == null){
      console.log("logging user in (session storage undefined)..." + this.authService.username + " " + this.authService.password);
      this.login(this.authService.username,  this.authService.password);
    }
    else{
      console.log("session storage not undefined! " + window.localStorage.getItem('userName') + " " + window.localStorage.getItem('password'));
    }

    this.userName = window.localStorage.getItem('userName');
    this.password = window.localStorage.getItem('password');
    this.getTasks();
  }

  ngAfterViewInit(){
  }

  login(uname, pw){
    console.log("\nlogging user in funct:" + uname + " " + pw);
    window.localStorage.setItem('userName', uname);
    window.localStorage.setItem('password', pw);
  }

  logout(){
    console.log("test logout");
    /*this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
    });*/
    this.authService.setLogin(false);

    // resetting the session data so that if a new user is logged in we'll use that data on initialization
    // otherwise it'll just use the username and pw from last session
    window.localStorage.setItem('userName', null);
    window.localStorage.setItem('password', null);
    console.log("session storage username on logout: " + window.localStorage.getItem('userName'))
    this.authService.logout().subscribe((res:any) => { // not getting a response...
      if(res.status == 'redirect'){
        console.log("res.status.url: " + res.url)
        this.router.navigate([res.url]);
      }
    });
  }

  // we need the task component to tell us when certain parts of it have been clicked, hence why the create button is almost entirely done in todo
  taskAnimated(emit){
    //console.log("test task animated emit: " + JSON.stringify(emit));
    if(emit.status == 'deleted'){
      this.deleteTask(emit.id);
    }
  }

  addTask(task){
    console.log("addTask params: " + task);
    console.log("task id before pushed: " + JSON.parse(task).id); // undefined
    this.tasks.push(JSON.parse(task));
  }

  removeTask(id){
    let index = this.tasks.findIndex(task => (task.id == id));
    this.tasks.splice(index, 1);
  }

  getTasks(){
    this.TaskService.getTasks(this.userName, this.password).subscribe((res:any) => {
      console.log("tasks response from server: " + JSON.stringify(res));
      if(res.error == 'not found'){
        console.log("server says user not found, logging out...");
        this.logout();
      }
      this.tasks = res.tasks;

      console.log("here's the res id count: " + res.idCount);
      this.idCount = res.idCount;
    });
  }

  printElements(){
    this.taskElements.forEach((task) => {
      console.log(task.taskId);
    });
  }

  createAnimation(id){
    this.taskElements.changes.subscribe(() => {
      this.taskElements.find(task => task.taskId == id).setState('created');
    });
  }

  createTask(taskName, taskDesc, taskPriority){
    this.theDate = new Date();
    let newId = this.idCount; // idCount is undefined, for some reason
    console.log("createTask newId: " + newId);

    console.log("this is the id count: " + this.idCount);
    console.log("creating task, this is the task id: " + newId);
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: newId,
      state: ''
    }
    this.selectedTask = newTask;

    this.TaskService.createTask(this.userName, this.password, newTask).subscribe((res:any) => {
      if(res.status == "success"){
        console.log("creation successful");
        this.addTask(JSON.stringify(res.task));
        this.idCount = res.idCount + 1;
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
      this.removeTask(id);
    });

  }

  completeTask(){
    console.log("test complete task");
    // <action that sends task to a completed tasks array>
    //this.deleteTask()
  }
}
