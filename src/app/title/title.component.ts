import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnInit {
  currentDate = new Date();
  displayDate;
  constructor() { }

  ngOnInit(): void {
    this.updateTime();
  }

  updateTime(){
    setInterval(() => {
      this.displayDate = new Date();
    }, 100)
  }
}
