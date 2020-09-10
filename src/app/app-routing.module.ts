import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TodoComponent } from './todo/todo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TaskGuard } from './task.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  /*{
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },*/

  {
    path: 'tasks',
    component: NavbarComponent,
    canActivate: [TaskGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
