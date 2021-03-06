import { PushnotificationsService } from '../pushnotifications.service'
import { Component, OnInit, Output, EventEmitter, ViewChildren, ViewChild, QueryList, Input} from '@angular/core';
import { TasksService } from '../tasks.service';
import { AuthService } from '../auth.service';
import {SwPush} from '@angular/service-worker';



import { Observable, Subscription  } from 'rxjs';
import { Router} from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';



@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],

  animations: [
    trigger('enterLeave', [
      state('void', style({
        transform: "translateX(-100%)", height: "100%"
      })),
      transition(':enter', [
        animate('300ms', style({ transform: "translateX(0%)"}))
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: "translateX(-100%)"}))
      ]),
    ]),

    trigger('fadeSlide', [
      state('in', style({ opacity:1,transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity:0,transform: 'translateY(100%)' }),
        animate(200)
      ]),
      transition('* => void', [
        animate(200, style({ opacity:0,transform: 'translateY(100%)' }))
      ])
    ]),

    trigger('fadeSlideDown', [
      state('in', style({ opacity:1,transform: 'translateY(10%)' })),
      state('out',style({ opacity:0,transform: 'translateY(-10%)' })),
      transition('in => out', [
        animate(100)
      ]),
      transition('out => in', [
        animate(100)
      ]),
    ]),
  ]
})

export class TodoComponent implements OnInit {
  @ViewChildren("appTask") taskElements: QueryList<any>;
  @ViewChild('taskPriority') taskPriority;
  @ViewChild('descMenu') descMenu;

  // when the user clicks the logout option in the navbar
  private logoutSubscription: Subscription;
  @Input() navLogout: Observable<void>;

  tasks: Array<any> = [];
  theDate;
  isClicked = false;
  isDeleted = false;
  selectedTask;
  idCount = 0;
  userName;
  password;
  creating=false;
  hideDescription=false;
  hidePriority=false;

  low='';
  medium='';
  high='';

  publicKey = '';
  privateKey = '';
  sub;

  setpri = false;
  setdesc = false;

  showAlert = false;

  constructor(private TaskService: TasksService, private authService: AuthService, private router: Router, private pushnotifs: PushnotificationsService, private swPush: SwPush) { }

  ngOnInit() {
    console.log("initializing todo");
    this.authService.loginCheck().subscribe((res:any) => {
      console.log("heres the authentication response: " + JSON.stringify(res.authenticated));
    });

    let uname = window.localStorage.getItem('userName');
    let pw = window.localStorage.getItem('password');
    console.log("local storage before if stuff: " + uname + " " + pw);

    if(uname == 'undefined' ||  pw == 'undefined' || uname == 'null' || pw == 'null' || uname == null){
      console.log("logging user in (session storage undefined)..." + this.authService.username + " " + this.authService.password);
      this.login(this.authService.username,  this.authService.password);
    }
    else{
      console.log("session storage not undefined! " + window.localStorage.getItem('userName') + " " + window.localStorage.getItem('password'));
    }

    this.userName = window.localStorage.getItem('userName');
    this.password = window.localStorage.getItem('password');
    this.getTasks();

    this.logoutSubscription = this.navLogout.subscribe(() => this.logout());

    //this.vapidKeys = this.getKeys();
    this.pushnotifs.requestKeys().subscribe((res:any) => {
      console.log("RES FOR REQUESTKEYS: ", res)
      this.publicKey = res.keys.publicKey;
      this.privateKey = res.keys.privateKey;
      console.log("vapid keys set 1: ", this.publicKey);
      //this.swPush.unsubscribe().then(() => );
      this.swPush.requestSubscription({
        serverPublicKey: this.publicKey
      }).then(sub => {
        console.log("Notification Subscription: ", sub);
        this.pushnotifs.addPushSubscriber(sub).subscribe((res:any) => {
          console.log("test response: ", res);
          this.sub = sub;
        });
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    })
    //console.log("vapid keys set 2: ", this.vapidKeys);

    //this.reqPermission(this.vapidKeys);

    /*this.pushnotifs.requestKeys().subscribe((res:any) => {
      console.log("testing request for vapid keys")
      this.vapidKeys = JSON.stringify(res.keys);
    });
    // we need to request keys from server first
    this.swPush.requestSubscription({
      serverPublicKey: this.vapidKeys
    })*/

  }

  notify(){
    console.log("TEST NOTIFY");
    this.pushnotifs.scheduleNotification(this.sub).subscribe((res:any) => {
      console.log("push notif response", res);
    });
  }

  unsubscribe(){
    this.swPush.unsubscribe();
  }


  ngOnDestroy() {
    this.logoutSubscription.unsubscribe();
  }

  ngAfterViewInit(){
  }

  login(uname, pw){
    console.log("\nlogging user in funct:" + uname + " " + pw);
    window.localStorage.setItem('userName', uname);
    window.localStorage.setItem('password', pw);
  }

  logout(){
    console.log("test logout todo");
    this.authService.setLogin(false);
    // resetting the session data so that if a new user is logged in we'll use that data on initialization
    // otherwise it'll just use the username and pw from last session
    window.localStorage.setItem('userName', null);
    window.localStorage.setItem('password', null);
    console.log("session storage username on logout: " + window.localStorage.getItem('userName'))
    this.authService.logout().subscribe((res:any) => { // not getting a response...
      if(res.status == 'redirect'){
        console.log("res.status.url: " + res.url)
        this.router.navigate([res.url]);
      }
    });
  }

  // we need the task component to tell us when certain parts of it have been clicked, hence why the create button is almost entirely done in todo
  taskAnimated(emit){
    //console.log("test task animated emit: " + JSON.stringify(emit));
    if(emit.status == 'deleted'){
      this.deleteTask(emit.id);
    }
  }

  getKeys(){
    console.log("TEST GET KEYS");
    this.pushnotifs.requestKeys().subscribe((res:any) => {
      console.log("DOING PUSH NOTIFS");
      console.log(res);
      return res.keys;
    })
  }

  /*reqPermission(vKeys){
    Notification.requestPermission(function(permission){
      var notif = new Notification("Title", {body:'HTML5 Web Notification API',icon:'http://i.stack.imgur.com/Jzjhz.png?s=48&g=1', dir:'auto'});
      setTimeout(function(){
        notif.close();
      },3000);
    })
  }*/



  addTask(task){
    console.log("addTask params: " + task);
    console.log("task id before pushed: " + JSON.parse(task).id); // undefined
    this.tasks.push(JSON.parse(task));
    this.pushnotifs.scheduleNotification(this.privateKey);
  }

  removeTask(id){
    let index = this.tasks.findIndex(task => (task.id == id));
    this.tasks.splice(index, 1);
  }

  getTasks(){
    this.TaskService.getTasks(this.userName, this.password).subscribe((res:any) => {
      //console.log("tasks response from server: " + JSON.stringify(res));
      if(res.error == 'not found'){
        console.log("server says user not found, logging out...");
        this.logout();
      }
      this.tasks = res.tasks;

      console.log("here's the res id count: " + res.idCount);
      this.idCount = res.idCount;
    });
  }

  printElements(){
    this.taskElements.forEach((task) => {
      console.log(task.taskId);
    });
  }

  createAnimation(id){
    this.taskElements.changes.subscribe(() => {
      this.taskElements.find(task => task.taskId == id).setState('created');
    });
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }



  createTask(taskName, taskDesc, taskPriority){
    if(taskName.length == 0){
      this.alertToggle();
      return;
    }
    this.theDate = new Date();
    this.theDate = this.formatDate(this.theDate);
    let newId = this.idCount; // idCount is undefined, for some reason
    console.log("createTask newId: " + newId);

    console.log("this is the id count: " + this.idCount);
    console.log("creating task, this is the task id: " + newId);
    let newTask = {
      name: taskName,
      date: this.theDate,
      description: taskDesc,
      priority: taskPriority,
      id: newId,
      state: ''
    }
    this.selectedTask = newTask;

    this.TaskService.createTask(this.userName, this.password, newTask).subscribe((res:any) => {
      if(res.status == "success"){
        console.log("creation successful");
        this.addTask(JSON.stringify(res.task));
        this.idCount = res.idCount + 1;
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
    this.TaskService.deleteTask(this.userName, this.password, id).subscribe((res:any) => {
      console.log("task deletion complete - server response: " + JSON.stringify(res));
      this.removeTask(id);
    });

  }

  completeTask(){
    console.log("test complete task");
    // <action that sends task to a completed tasks array>
    //this.deleteTask()
  }

  toggleCreateTask(){
    this.creating = !this.creating;
  }

  setDescription(){
    //this.descMenu.open();

    this.setdesc = !this.setdesc;
    if(this.setdesc == true){
      this.hideDescription=false;
    }
  }

  setPriority(){
    this.low='Low';
    this.medium='Medium';
    this.high='High';
    this.taskPriority.open();
    /*
    this.setpri = !this.setpri;
    if(this.setpri == true){
      this.hidePriority=false;
    }*/
  }

  animEnd(buttonType){
    console.log(buttonType);

    if(buttonType=='description'){
      if(this.setdesc == false){
        console.log("hiding element...");
        this.hideDescription=true;
      }
      else{
        this.hideDescription=false;
      }
    }
  }

  cancelClick(){
    this.setdesc=false;
    this.hideDescription=true;
    this.hidePriority=true;
    this.showAlert=false;
    this.creating=false;
  }

  onKeyDown(event, name, desc, priority){ // when the user hits the enter key in task creation, create the task
    // re-implement this when you know how to check if the focus is in a text area of not
    /*if(event.keyCode == 13){
      console.log("test key down");
      this.createTask(name, desc, priority);
      this.cancelClick();
    }*/
  }

  priInvis(){
    console.log('test focus');
    this.low='';
    this.medium='';
    this.high='';
  }

  alertToggle(){
    window.setTimeout(() => {
      this.showAlert = !this.showAlert;
    }, 3000);
  }




}
