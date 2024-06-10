import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BatteryResponseDTO } from '../models/DTOs/batteryDTO';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  constructor(private api: ApiService) { }

  /**
   * Sends command code to backend
   */
  sendInstallerCode(code: string) {
    const body = { Command: code };
    return new Observable(obs => {
      this.api.postDevice('CommandService.svc/SendInstallerCommand', body).subscribe(
        (res: ResponseDTO | any) => {
          if (res.Code === 401) {
            obs.error(res);
          } else {
            obs.next(res);
          }
        },
        err => obs.error(err)
      );
    });
  }

  /**
   * Retrieves battery status from backend
   */
  getBatteryStatus() {
    return new Observable(obs => {
      this.api.postDevice('CommandService.svc/GetBatteryStatus').subscribe((res: BatteryResponseDTO | any) => {
        if (res.Code === 401) {
          obs.error(res);
        } else {
          obs.next(res);
        }
      }, err => obs.error(err));
    });
  }
}
