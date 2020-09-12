import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { isDevMode } from '@angular/core'



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "to-do-heroku";
  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log(isDevMode());
    this.router.navigate(['/login']);

  }
}
