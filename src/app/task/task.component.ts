import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
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
    trigger('deleteAnimation', [
      state('deleted', style({
        height: '48px',
        transform: "translateX(-200%)"
      })),

      transition('* => deleted', [
        animate('300ms')
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
  @Output() deleted = new EventEmitter<boolean>();
  @Output() completed = new EventEmitter<boolean>();
  isOpen = false;
  didDelete = false;
  didComplete = false;
  //name;
  date;
  //description;
  //priority;
  id;
  isClicked = false;

  deleteClick(deleteBool: boolean){
    console.log("test task delete");
    this.toggle();
    setTimeout(function(){
      this.deleted.emit(deleteBool);
    }.bind(this), 500);

  }



  completeClick(completeBool: boolean){
    this.completed.emit(completeBool);
  }

  toggle(){
    this.didDelete = !this.didDelete;
  }




  constructor() { }

  ngOnInit(): void {
  }


  @HostListener('click') onMouseClick(){
    console.log(this.taskName);

    this.isClicked = !this.isClicked;

  }

}
