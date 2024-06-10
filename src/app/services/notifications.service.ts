import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private api: ApiService) { }

  private manageRes(obs: Subscriber<unknown>, res: any) {
    if (res.Code === 401) {
      obs.error(res);
    } else {
      obs.next(res);
    }
  }

  enumEvents() {
    return new Observable(obs => {
      this.api.postDevice('NotificationService.svc/EnumEvents').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }
}
