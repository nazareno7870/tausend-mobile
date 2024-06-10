import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { CreateUserDTO } from '../models/DTOs/usersDTO';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private api: ApiService) { }

  private manageRes(obs: Subscriber<unknown>, res: any) {
    if (res.Code === 401) {
      obs.error(res);
    } else {
      obs.next(res);
    }
  }

  enumUsers() {
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/EnumUsers').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  createUsers(userLabels: CreateUserDTO[]) {
    const body = { Users: userLabels };
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/CreateUsers', body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  getTime() {
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/SyncTime').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  syncTime() {
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/SyncTime').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }
}
