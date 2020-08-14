import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  animations: [
    trigger('taskAnimation', [

      state('deleted', style({
        transform: "translateX(-100%)"
      })),

      state('created', style({ transform: 'translateX(0%)'
      })),

      state('void', style({
        left: '-100%'
      })),

      // changing the * to void makes the animation crap: why?
      transition('* => deleted', [
        animate('200ms')
      ]),

      transition('* => created', [
        animate('350ms')
      ]),
    ]),
  ]
})
export class TaskComponent implements OnInit {
  //@ViewChild('taskDescription', {static: false}) taskDescription: ElementRef;
  @Input('taskName') taskName: string;
  @Input('taskPriority') taskPriority: string;
  @Input('taskDescription') taskDescription: string;
  @Input('taskDate') taskDate: string;
  @Input('taskId') taskId: number;
  @Input('taskState') taskState: string;
  @Output() animated = new EventEmitter<any>();
  @Output() completed = new EventEmitter<boolean>();
  isOpen = false;
  didDelete = false;
  didComplete = false;
  isCreated = false;
  date;
  id;
  isClicked = false;


  deleteClick(){
    console.log("TASK: test task delete");
    this.taskState = 'deleted';
    console.log("task state: " + this.taskState)
  }

  createClick(){
    //console.log("TASK: test create click");
    //this.taskState = '';
  }

  setState(newState){
    console.log("STATE CHANGE");
    this.taskState = newState;
  }

  animStart(){
    //console.log("animation started");
  }

  animEnd(){
   // console.log("animation ended: " + this.taskState);
    //this.taskState = '';
    if(this.taskState == 'deleted'){
      // it gets task date...
      //
      this.animated.emit({status: this.taskState, id: this.taskId}); // any animation could be called here, have to let todo know which one

    }
    this.taskState = '';
  }
  completeClick(){
    // we gotta change the icon on the task mat-icon tag somehow
    //this.didComplete = !this.didComplete;
    //this.completed.emit(this.didComplete);
    this.setState('created');

  }






  constructor() { }

  ngOnInit(): void {
    // try calling creation animation here?
    console.log("initializiing task");
    //this.taskState = this.taskState;
    //this.didDelete = false;
  }


  @HostListener('click') onMouseClick(){
    /*console.log("task ID (task-side): " + this.taskId);
    console.log("task name (task-side): " + this.taskName);
    console.log("task priority (task-side): " + this.taskPriority);
    console.log("task date (task-side): " + this.taskDate);*/

    this.isClicked = !this.isClicked;

  }

}
