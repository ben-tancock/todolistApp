import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  //@ViewChild('taskDescription', {static: false}) taskDescription: ElementRef;
  @Input('taskName') taskName: string;
  @Input('taskPriority') taskPriority: string;
  @Input('taskDescription') taskDescription: string;
  @Input('taskDate') taskDate: string;

  //name;
  date;
  //description;
  //priority;
  id;
  isClicked = false;


  constructor() { }

  ngOnInit(): void {
  }


  @HostListener('click') onMouseClick(){
    console.log("testing visibility change");
    console.log(this.taskName);
    this.isClicked = !this.isClicked;

  }

}
