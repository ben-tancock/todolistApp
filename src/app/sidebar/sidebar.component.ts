import { Component, OnInit, HostListener } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('openClose', [
      state('closed', style({
        width: '20px'
      })),

      state('open', style({
        width: '400px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),

      transition('closed => open', [
        animate('300ms')
      ]),

      transition('open => closed', [
        animate('300ms')
      ])
    ]),

  ]
})
export class SidebarComponent implements OnInit {
  isOpen = false;


  constructor() { }

  ngOnInit(): void {
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }

  @HostListener('click') onMouseClick(){
    this.toggle();
    console.log('testing sidebar');
  }



}
