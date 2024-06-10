import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ApiService } from './api.service';
import { ScheduleDTO, ScheduleMiniDTO } from '../models/DTOs/scheduled-departuresDTO';

@Injectable({
  providedIn: 'root'
})
export class ScheduledDeparturesService {

  constructor(private api: ApiService) { }

  private manageRes(obs: Subscriber<unknown>, res: any) {
    if (res.Code === 401) {
      obs.error(res);
    } else {
      obs.next(res);
    }
  }

  get() {
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/GetProgramControls').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  changeStatus(schedule: ScheduleDTO) {
    const body = {
      Zone: schedule.ProgramControlNumber.toString(),
      State: !schedule.Activated
    };
    return new Observable(obs => {
      this.api.postDevice('CommandService.svc/ProgramControl', body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  changeName(schedule: ScheduleMiniDTO) {
    const body = { ProgramControls: [schedule] };
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/CreateProgramControls', body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

}
