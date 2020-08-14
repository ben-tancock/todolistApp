import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
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
import { delay } from 'rxjs/operators';


//import { Task } from '../task';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],

  /* why not make an 'out' and 'in' state, instead of two different create and delete animations, in different components and everything?
   we've also proven we don't need the deletion animation to be in the task component, since we sort of have a creation one working. I think.
  If we can somehow target individual tasks in todo component. */
  /*animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('* => in', [
        style({ transform: 'translateX(-100%)' }),
        animate('350ms')
      ]),
      transition('in => *', [
        animate('350ms', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]*/
})
export class TodoComponent implements OnInit {
  @Output() created = new EventEmitter<boolean>();
  @ViewChildren("appTask") taskElements: QueryList<any>;

  tasks: any = [];
  theDate;
  isClicked = false;
  isDeleted = false;
  formatted;
  selectedTask;
  idCount: number = 0;
  //state: string = '';



  constructor(private TaskService: TasksService) { }

  ngOnInit() {
    // server needs to keep track of id's, they're reset to 0 whenever client-side is initialized
    this.getTasks();

    // this doesn't work because the element is undefined
    //this.createAnimation(139);
  }

  ngAfterViewInit(){
    //this.taskElements.changes.subscribe(() => this.printElements());

    // this produces the error, can't modify in / after ngAfterViewInit()
    //this.createAnimation(139);
  }

  @HostListener('click') onMouseClick(){
    console.log('clicked!');

    // this is never called because we are waiting for the querylist to change, which it won't, because it's full
    //this.createAnimation(139);
    //this.printElements();
  }


  // once the task has completed an animation, it will send parent some data
  // after the animation has completed.
  // based on what the animation was, decide what to do next
  taskAnimated(emit){
    console.log("test task animated emit: " + JSON.stringify(emit));
    if(emit.status == 'deleted'){
      console.log("emit deleted on task: " + emit.id);
      this.deleteTask(emit.id);
    }
    else if(emit.status == 'created'){ // when the create button is clicked... the element does not exist, we have no reference to call the animation on
      // maybe we should have tasks take an animation state as an input? so we can give the new ones the create animation?
      //this.createTask(emit.id);
    }
  }

  getTask(){
    this.tasks.push(
      {name: "test name",
      date: this.theDate,
      description: "test desc",
      priority: "high",
      id: 999,
      tState: 'created'})
  }

  getTasks(){
    this.TaskService.getTasks().subscribe((res:any) => {
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
      tState: ''
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
        console.log("created tasks name: " + JSON.stringify(res.data.ops));
        this.getTask();
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
      this.getTasks(); // make a remove task instead
    });

  }

  completeTask(){
    console.log("test complete task");
    // <action that sends task to a completed tasks array>
    //this.deleteTask()
  }
}
