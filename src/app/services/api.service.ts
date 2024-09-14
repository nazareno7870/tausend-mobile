import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';
import { AccountDTO } from '../models/DTOs/usersDTO';
import { Observable } from 'rxjs';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseurl = environment.apiUrl + '/Services/';
  private httpOptions: { headers: HttpHeaders; body?: object } | undefined;
  public online: boolean | undefined;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private network: Network
  ) {
    network.onConnect().subscribe(() => {
      this.online = true;
    });
    network.onDisconnect().subscribe(() => {
      this.online = false;
    });
  }

  //#region private methods
  /**
   * Creates the header for the request. Dynamically adds token or Content-type.
   * @param timeout miliseconds
   * @param hasContent adds Content-Type if true
   */
  private setHeaders(timeout: number, contentType?: string): void {
    let header: HttpHeaders = new HttpHeaders();
    const keyValPairs: any = { timeout: timeout.toString() };
    keyValPairs['Content-Type'] = contentType
      ? contentType
      : 'application/json';
    this.httpOptions = { headers: header };
  }

  /**
   *
   */
  private setBody(body: {
    [key: string]: string | number | boolean | object | undefined;
  }) {
    return new Observable((obs) => {
      this.storage.get('currentUser').then(
        (user: AccountDTO) => {
          if (user) {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              obs.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular dispositivo"'
              );
            } else {
              body['DeviceId'] = user.Devices[user.DeviceSelected].DeviceId;
              body['AccessToken'] = user.AccessToken;
              obs.next(body);
            }
          }
        },
        (err) => obs.error(err)
      );
    });
  }

  /**
   * Checks if is currently online.
   * Used only once after platform.ready() in app.component.
   */
  public setCurrentNetworkStatus() {
    this.online = true; // for testing
    // const conntype = this.network.type;
    // this.online = conntype && conntype !== "unknown" && conntype !== "none";
  }
  //#endregion

  //#region HTTP methods

  /**
   * Performs a GET request
   * @param url url
   * @param timeout miliseconds
   */
  get(url: string, timeout?: number) {
    if (this.online) {
      const completeUrl = this.baseurl + url;
      if (!timeout) {
        timeout = 10000;
      }
      this.setHeaders(timeout);
      return this.http.get(completeUrl, this.httpOptions);
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  /**
   * Performs a POST request
   * @param url url
   * @param body object
   * @param timeout miliseconds
   */
  post(url: string, body: object, timeout?: number) {
    console.log(this.online);
    if (this.online) {
      const completeUrl = this.baseurl + url;
      if (!timeout) {
        timeout = 10000;
      }
      this.setHeaders(timeout);
      return this.http.post(completeUrl, body, this.httpOptions);
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  /**
   * Performs a POST request adding deviceId to body
   * @param url url
   * @param body object
   * @param timeout miliseconds
   */
  postDevice(url: string, body?: object, timeout?: number) {
    if (this.online) {
      const completeUrl = this.baseurl + url;
      if (!body) {
        body = {};
      }
      if (!timeout) {
        timeout = 10000;
      }
      this.setHeaders(timeout);
      return new Observable((obs) => {
        this.setBody(body as any).subscribe(
          (body2) => {
            this.http.post(completeUrl, body2, this.httpOptions).subscribe(
              (res) => obs.next(res),
              (err) => obs.error(err)
            );
          },
          (err) => obs.error(err)
        );
      });
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }
  //#endregion
}
