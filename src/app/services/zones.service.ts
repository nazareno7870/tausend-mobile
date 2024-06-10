import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ZoneDTO, ZoneMiniDTO } from '../models/DTOs/zonesDTO';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ZonesService {

  private apiUrl = 'DeviceService.svc/';

  constructor(private api: ApiService) { }

  private manageRes(obs: Subscriber<unknown>, res: any) {
    if (res.Code === 401) {
      obs.error(res);
    } else {
      obs.next(res);
    }
  }

  //#region LOCAL
  toList(zones: ZoneDTO[], rowsPerPage: number) {
    const result: ZoneDTO[][] = [];
    let page: ZoneDTO[] = new Array;
    let lastItem = false;
    let pageEnd = false;

    zones.forEach((zone, i) => {
      lastItem = i + 1 == zones.length;
      pageEnd = i % rowsPerPage == 0;
      if ((pageEnd || lastItem) && i != 0) {
        result.push(page);
        if (!lastItem) {
          page = new Array;
        }
      }
      page.push(zone);
      if (zones.length == 1) {
        result.push(page);
      }
    });
    return result;
  }

  toGrid(zones: ZoneDTO[], zonesPerRows: number, rowsPerPage: number) {
    const result: ZoneDTO[][][] = [];
    let page: ZoneDTO[][] = new Array;
    let row: ZoneDTO[] = new Array;
    let lastItem = false;
    let rowEnd = false;
    let pageEnd = false;

    zones.forEach((zone, i) => {
      lastItem = i + 1 == zones.length;
      rowEnd = i % zonesPerRows == 0;
      pageEnd = i % (zonesPerRows * rowsPerPage) == 0;

      if ((rowEnd || pageEnd || lastItem) && i != 0) {

        if (rowEnd || lastItem) {
          page.push(row);
          if (!lastItem) {
            row = new Array;
          }
        }

        if (pageEnd || lastItem) {
          result.push(page);
          if (!lastItem) {
            page = new Array;
          }
        }
      }

      row.push(zone);

      if (zones.length == 1) {
        page.push(row);
        result.push(page);
      }

    });
    return result;
  }
  //#endregion LOCAL

  //#region BACKEND
  getList() {
    const url = this.apiUrl + 'GetZones';
    return new Observable(obs => {
      this.api.postDevice(url).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  getMemory() {
    const url = this.apiUrl + 'GetMemory';
    return new Observable(obs => {
      this.api.postDevice(url).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  updateName(zones: ZoneMiniDTO[]) {
    const url = this.apiUrl + 'CreateZones'
    const body = { Zones: zones }
    return new Observable(obs => {
      this.api.postDevice(url, body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }
  //#endregion
}
