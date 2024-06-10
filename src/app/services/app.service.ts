import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { environment } from "./../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ResponseDTO } from "../models/DTOs/responseDTO";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class AppService {
  constructor(
    private platform: Platform,
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ) {}

  armAlarm(): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer: any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/ArmAlarm`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  disarmAlarm() {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
              return
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };

              return this.http
                .post<any>(
                  `${environment.apiUrl}/Services/CommandService.svc/DisarmAlarm`,
                  body
                )
                .subscribe((res: ResponseDTO) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  dayArmAlarm() {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };

              this.http
                .post<any>(
                  `${environment.apiUrl}/Services/CommandService.svc/DayArmAlarm`,
                  body
                )
                .subscribe((res: ResponseDTO) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  nightArmAlarm() {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };

              this.http
                .post<any>(
                  `${environment.apiUrl}/Services/CommandService.svc/NightArmAlarm`,
                  body
                )
                .subscribe((res: ResponseDTO) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  createOrUpdateDevice(
    description: string,
    identifier: string,
    pin: number,
    typeForm: string
  ) {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (typeForm === "edit") {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                Description: description,
                Identifier: identifier,
                Pin: pin.toString(),
              };
              this.http
                .post<any>(
                  `${environment.apiUrl}/Services/DeviceService.svc/UpdateDevice`,
                  body
                )
                .subscribe((res: ResponseDTO) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            } else {
              let body = {
                AccessToken: user.AccessToken,
                Description: description,
                Identifier: identifier,
                Pin: pin.toString(),
                Email: user.Email,
              };
              this.http
                .post<any>(
                  `${environment.apiUrl}/Services/DeviceService.svc/CreateDevice`,
                  body
                )
                .subscribe((res: ResponseDTO) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  unlinkDevice({DeviceId }: { DeviceId: string }) {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        const body = {
          DeviceId,
        };
        this.http
          .post<any>(
            `${environment.apiUrl}/Services/DeviceService.svc/DeleteDevice`,
            body
          )
          .subscribe((res: ResponseDTO) => {
            if (res.Code === 401) {
              observer.error(res);
            } else {
              observer.next(res);
            }
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  panic(): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/Panic`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  assault(): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/Assault`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  emergency(): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/Emergency`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  programControl(zone: string): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
                Zone: zone,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/ProgramControl`,
                  body
                )
                .subscribe((res: ResponseDTO  | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  exclusions(zones: any): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
                Zones: zones,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/Exclusion`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  getGeneralStatus(): Observable<any> {
    if (this.api.online) {
      return new Observable((observer) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId:
                  user.Devices && user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/GetGeneralStatus`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  createAccountDeviceToken(token : any): Observable<any> {
    console.log("createAccountDeviceToken " + token);
    if (this.api.online) {
      return new Observable((observer) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            let os = "";
            if (this.platform.is("android")) {
              os = "Android";
            } else {
              os = "Ios";
            }
            let body = {
              AccessToken: user.AccessToken,
              OS: os,
              Token: token,
            };
            this.http
              .post(
                `${environment.apiUrl}/Services/AccountService.svc/CreateAccountDeviceToken`,
                body
              )
              .subscribe((res: ResponseDTO | any) => {
                if (res.Code === 0) {
                  observer.next(res);
                } else {
                  observer.error(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  getZonesStatus(): Observable<any> {
    if (this.api.online) {
      return new Observable((observer) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            if (
              user &&
              user.Devices &&
              user.Devices[user.Devices.length - 1] &&
              user.Devices[user.Devices.length - 1].DeviceId == 0
            ) {
              observer.error(
                'Para enviar comandos primero debe vincular un dispositivo. Puede hacerlo desde "Menu > Vincular Dispositivo"'
              );
            } else {
              let body = {
                DeviceId: user.Devices[user.DeviceSelected].DeviceId,
                AccessToken: user.AccessToken,
              };
              this.http
                .post(
                  `${environment.apiUrl}/Services/CommandService.svc/GetZonesStatus`,
                  body
                )
                .subscribe((res: ResponseDTO | any) => {
                  if (res.Code === 401) {
                    observer.error(res);
                  } else {
                    observer.next(res);
                  }
                });
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }
}
