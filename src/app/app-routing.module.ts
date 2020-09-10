import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
/*import { TodoComponent } from './todo/todo.component';
import { NewNavComponent } from './new-nav/new-nav.component';
import { TaskGuardGuard } from './task-guard.guard';*/


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }

  /*{
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },*/

  /*{
    path: 'tasks',
    component: NewNavComponent,
    canActivate: [TaskGuardGuard]
  },*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
