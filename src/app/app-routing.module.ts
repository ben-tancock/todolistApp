import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component'
import { NavbarComponent } from './navbar/navbar.component';
import { TodoComponent } from './todo/todo.component';
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
    //canActivate: [TaskGuard]
  },

  {
    path: 'registration',
    component: RegistrationComponent,
    //canActivate: [TaskGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
