import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FailuresService {

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
      this.api.postDevice('CommandService.svc/GetFailStatus').subscribe(
        res => this.manageRes(obs, res),
        err => obs.error(err)
      );
    });
  }

  getDescription(name: string): any {
    const descriptions = {
      "AC": "Falla de suministro de energía, línea de 220VAC",
      "BAT": "Falla de batería (muy descargada o defectuosa)",
      "TLM": "Falla de línea telefónica",
      "BELL-1": "Falla en sirena 1",
      "BELL1": "Falla en sirena 1",
      "BELL2": "Falla en sirena 2",
      "VAUX": "Falla de 12V de alimentación de teclados y accesorios",
      "CLOCK": "Falla de reloj (perdió la puesta en hora)",
      "CEL": "Falla de módulo celular",
      "COMU": "Falla de comunicación de eventos",
      "BUS": "Falla de comunicación en el bus de teclados y accesorios",
      "BELL-2": "Falla en sirena 2"
    };
    return descriptions[name as keyof typeof descriptions]; ;
  }
}
