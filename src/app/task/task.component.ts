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
})
export class TaskComponent implements OnInit {
  //@ViewChild('taskDescription', {static: false}) taskDescription: ElementRef;
  @Input('taskName') taskName: string;
  @Input('taskPriority') taskPriority: string;
  @Input('taskDescription') taskDescription: string;
  @Input('taskDate') taskDate: string;
  @Input('taskId') taskId: number;
  @Input('taskState') taskState: String;
  @Output() animated = new EventEmitter<any>();
  @Output() completed = new EventEmitter<boolean>();
  didComplete = false;
  isNew = true;
  date;
  id;
  isClicked = false;

  // let the todo component know a task has been deleted
  deleteClick(){
    this.taskState = 'deleted';
    this.animated.emit({status: this.taskState, id: this.taskId}); // any animation could be called here, have to let todo know which one
  }

  // controls checkbox animation
  completeClick(){
    this.didComplete = !this.didComplete;
  }

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('click') onMouseClick(){
    //console.log("the state: " + this.taskState);
    this.isClicked = !this.isClicked;
  }

}
