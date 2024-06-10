import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ExclusionZoneMiniDTO, ExclusionDTO } from '../models/DTOs/zonesDTO';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ExclusionsService {

  constructor(private api: ApiService) { }

  private manageRes(obs: Subscriber<unknown>, res: any) {
    if (res.Code === 401) {
      obs.error(res);
    } else {
      obs.next(res);
    }
  }

  //#region LOCAL

  toList(zones: ExclusionDTO[], rowsPerPage: number) {
    const result: ExclusionDTO[][] = [];
    let page: ExclusionDTO[] = new Array;
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
        page.push(zone);
        result.push(page);
      }
    });
    return result;
  }

  toGrid(exclusions: ExclusionDTO[], exclusionsPerRows: number, rowsPerPage: number) {
    const result: ExclusionDTO[][][] = [];
    let page: ExclusionDTO[][] = new Array;
    let row: ExclusionDTO[] = new Array;
    let lastItem = false;
    let rowEnd = false;
    let pageEnd = false;

    exclusions.forEach((zone, i) => {
      lastItem = i + 1 == exclusions.length;
      rowEnd = i % exclusionsPerRows == 0;
      pageEnd = i % (exclusionsPerRows * rowsPerPage) == 0;

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
      if (exclusions.length == 1) {
        page.push(row);
        result.push(page);
      }

    });
    return result;
  }
  //#endregion LOCAL

  get() {
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/GetExclusions').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  excludeZones(exclusionsNumbers: string[]) {
    const body = { Zones: exclusionsNumbers };
    return new Observable(obs => {
      this.api.postDevice('CommandService.svc/Exclusion', body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  changeNames(exclusions: ExclusionZoneMiniDTO[]) {
    const body = { Exclusions: exclusions };
    return new Observable(obs => {
      this.api.postDevice('DeviceService.svc/CreateExclusions', body).subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }
}
