import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { TasksService } from '../tasks.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
=======
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
>>>>>>> more login stuff!
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { delay } from 'rxjs/operators';


//import { Task } from '../task';

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
        transform: "translateX(-100%)", height: "50px"
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
  idCount: number = 0;

<<<<<<< HEAD
  userName;
=======
  userName = '';
>>>>>>> more login stuff!
  //state: string = '';



<<<<<<< HEAD
  constructor(private TaskService: TasksService) { }

  ngOnInit() {
    // server needs to keep track of id's, they're reset to 0 whenever client-side is initialized
=======
  constructor(private TaskService: TasksService, private route: ActivatedRoute) { }

  ngOnInit() {
    // server needs to keep track of id's, they're reset to 0 whenever client-side is initialized
    // we also need to assign this.username to the username the this.router.navigate function sends to it
    this.userName = this.route.snapshot.params.username;
    console.log("router params: " + this.userName);
   // this.userName = this.userName.username;
>>>>>>> more login stuff!
    this.getTasks();
  }

  ngAfterViewInit(){

  }

  @HostListener('click') onMouseClick(){
    console.log('clicked!');
  }


  // we need the task component to tell us when certain parts of it have been clicked, hence why the create button is almost entirely done in todo
  taskAnimated(emit){
    console.log("test task animated emit: " + JSON.stringify(emit));
    if(emit.status == 'deleted'){
      console.log("emit deleted on task: " + emit.id);
      this.deleteTask(emit.id);
    }

  }

  addTask(task){
    // all undefined!!
    let printing = JSON.parse(task);
    console.log("TASK OBJECT: " + printing.name);
    console.log("task print out: " + '\n' + printing.name + '\n' + printing.description)
    console.log("\n CREATING task: " + printing);

    // why does this create a new element on the web page?
    this.tasks.push(JSON.parse(task));
  }

  // needs to remove by id
  removeTask(id){
    // This only pops off the end. We can fix this by using an ArrayList
    // nvm javascript doesn't have arraylist lol
    let index = this.tasks.findIndex(task => (task.id == id));
    this.tasks.splice(index, 1);
  }

  getTasks(){
    this.TaskService.getTasks(this.userName).subscribe((res:any) => {
      this.tasks = res.docs;
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
      console.log("creating animation for: " + this.taskElements.find(task => task.taskId == id));
      this.taskElements.find(task => task.taskId == id).setState('created');
      console.log("created");
    });
    console.log("end of method");

  }

  createTask(taskName, taskDesc, taskPriority){
    //this.getTask();


    this.theDate = new Date();
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: (this.idCount++),
      state: ''
    }

    this.idCount = this.idCount++;
    console.log("tasks length: " + this.tasks.length);
    this.selectedTask = newTask;

    this.TaskService.createTask(newTask).subscribe((res:any) => {

      // once the data has been inserted, does that mean that the task component itself exists?
      // I'm guessing no...
      // getTasks() is when there's an actual, physical element on the screen for us to modify
      // let's try putting this after?
      console.log(JSON.stringify(res)); // prints the msg property of the server response!
      // once we get a message back indicating a success, we have to update the client-side task list by calling getTasks again
      if(res.status == "success"){
        console.log("creation successful");
        console.log( "created task: " + JSON.stringify(res.data.ops[0].name));
        this.addTask(JSON.stringify(res.data.ops[0]));
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
    this.TaskService.deleteTask(id).subscribe((res:any) => {
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
