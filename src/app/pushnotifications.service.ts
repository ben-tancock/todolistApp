import { Injectable } from '@angular/core';
import { environment } from './../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PushnotificationsService {

  url = environment.apiUrl;


  constructor(private http: HttpClient) { }

  requestKeys(){
    console.log("TEST REQ KEYS");
    return this.http.post(this.url + '/vkeys', {})
  }

  addPushSubscriber(sub:any) {
    return this.http.post(this.url + '/addPushNotifications', sub);
  }

  scheduleNotification(sub:any){
    return this.http.post(this.url + '/scheduleNotification', sub);
  }
}
