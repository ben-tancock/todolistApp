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
    /*trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)', backgroundColor:'yellow' }),
        animate(500)
      ]),
      transition('* => void', [
        animate(500, style({ transform: 'translateX(100%)', backgroundColor:'yellow' }))
      ])
    ])*/


    trigger('taskAnimation', [

      state('deleted', style({
        transform: "translateX(-100%)"
      })),

      //state('in', style({transform: 'translateX(100%)'})),

      transition('* => deleted', [
        animate('300ms')
      ]),

     /* transition('* => in', [
        animate('300ms')
      ]),

      transition('* => in', [
        animate(500, style({ transform: 'translateX(100%)' }))
      ])*/

    ]),

    trigger('createAnimation', [
      transition('* => created', [
        style({ transform: 'translateX(-100%)' }),
        animate('350ms')
      ]),
    ])

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
  date;
  id;
  isClicked = false;

  deleteClick(){
    console.log("test task delete");
    this.toggle();
    setTimeout(function(){
      this.deleted.emit();
    }.bind(this), 500);

  }



  completeClick(){
    // we gotta change the icon on the task mat-icon tag somehow
    this.didComplete = !this.didComplete;
    this.completed.emit(this.didComplete);
  }

  toggle(){
    this.didDelete = !this.didDelete;
  }




  constructor() { }

  ngOnInit(): void {
    // try calling creation animation here?
    console.log("initializiing task");
    //this.didDelete = false;
  }


  @HostListener('click') onMouseClick(){
    console.log(this.taskName);

    this.isClicked = !this.isClicked;

  }

}
