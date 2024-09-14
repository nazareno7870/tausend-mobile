import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController, Platform } from '@ionic/angular';
import { Events } from './events.service';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { AccountDTO } from '../models/DTOs/usersDTO';
import { Dialogs } from '@awesome-cordova-plugins/dialogs/ngx';
import { ApiService } from './api.service';
import {
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authSubject = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private platform: Platform,
    private router: Router,
    private appService: AppService,
    private alertController: AlertController,
    private dialogs: Dialogs,
    private events: Events,
    private api: ApiService
  ) {
    this.platform.ready().then(() => {
      this.checkUser();
    });
  }

  register(fName: String, lName: String, email: String, password: String) {
    let body = {
      Email: email,
      FirstName: fName,
      LastName: lName,
      Password: password,
    };

    if (this.api.online) {
      return this.http
        .post<any>(
          `${environment.apiUrl}/Services/AccountService.svc/CreateAccount`,
          body
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  login(email: String, password: String): Observable<any> {
    let body = {
      Email: email,
      Password: password,
    };

    if (this.api.online) {
      const apiUrl = `${environment.apiUrl}/Services/AccountService.svc/Login`;
      return this.http.post<any>(apiUrl, body).pipe(
        map((res) => {
          if (res != null && res.Account != null) {
            this.events.publish('login', res.Account);
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            this.storage
              .set('currentUser', {
                ...res.Account,
                DeviceSelected: 0,
                SMSDevices: res.Account.SmsDevices,
                isSMS: false,
                version: environment.version,
              })
              .then((response) => {
                PushNotifications.requestPermissions().then((result) => {
                  if (result.receive === 'granted') {
                    // On success, we should be able to receive notifications
                    PushNotifications.addListener(
                      'registration',
                      (token: Token) => {
                        this.appService
                          .createAccountDeviceToken(token.value)
                          .subscribe((x) => {});
                      }
                    );
                    // Register with Apple / Google to receive push via APNS/FCM
                    PushNotifications.register();
                  } else {
                    // Show some error
                  }
                });
                if (this.platform.is('android')) {
                  PushNotifications.addListener(
                    'registration',
                    (token: Token) => {
                      this.appService
                        .createAccountDeviceToken(token.value)
                        .subscribe((x) => {});
                    }
                  );
                }
                PushNotifications.addListener(
                  'pushNotificationReceived',
                  (notification: PushNotificationSchema) => {
                    this.alertController
                      .create({
                        mode: 'ios',
                        header: notification['title'],
                        message: notification['body'],
                        buttons: ['OK'],
                      })
                      .then((alert) => {
                        alert.present();
                        this.dialogs.beep(1);
                      });
                  }
                );
                this.authSubject.next(true);
                window.localStorage.setItem('loggedIn', '1');
              });
          }
          return res;
        })
      );
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  /**
   * Remove user from local storage and set current user to null.
   * Tries to remove token from backend, stores token on fail for retry in the future.
   */
  logout() {
    this.storage.get('currentUser').then((user: AccountDTO) => {
      console.log('Entrando a logout');
      PushNotifications.addListener('registration', (token: Token) => {
        this.removeToken(user.AccessToken, token.value).subscribe((x) => {
        });
      });
      this.storage.remove('currentUser').then((response) => {
        this.authSubject.next(false);
        window.localStorage.removeItem('loggedIn');
        this.router.navigate(['login']);
      });
    });
  }

  //#region Remove deviceToken
  /**
   * Removes token from backend to prevent reciving notifications
   */
  public removeToken(userToken: string, deviceToken: string): Observable<any> {
    const pendingTokens = this.getPendingTokens();
    let index = -1;
    pendingTokens.forEach((pair, i) => {
      if (pair.userToken == userToken) {
        index = i;
      }
    });
    const url =
      'https://tausend.wearelomo.com/Services/AccountService.svc/Logout';
    const body = { AccessToken: userToken, DeviceToken: deviceToken };
    if (this.api.online) {
      return new Observable((observer) => {
        this.http.post(url, body).subscribe((res: ResponseDTO | any) => {
          if (res.Code === 0) {
            if (index != -1) {
              pendingTokens.splice(index, 1);
              this.setPendingTokens(pendingTokens);
              console.log('Pending tokens: ', pendingTokens);
              observer.next(res);
            } else {
              console.log('Pending tokens: ', pendingTokens);
              observer.next(res);
            }
          } else {
            if (index == -1) {
              console.log('Pending tokens: ', pendingTokens);
              this.addPendingToken(userToken, deviceToken);
              observer.next(res);
            } else {
              observer.next(res);
            }
          }
        });
      });
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  /**
   * Gets pending logout tokens.
   */
  private getPendingTokens() {
    let arrTokens: { userToken: string; deviceToken: string }[] = [];
    const strTokens = window.localStorage.getItem('pendingTokens');
    if (strTokens) {
      arrTokens = JSON.parse(strTokens);
    }
    return arrTokens;
  }

  /**
   * Sets pending logout tokens.
   */
  private setPendingTokens(arrTokens: any): void {
    window.localStorage.setItem('pendingTokens', JSON.stringify(arrTokens));
  }

  /**
   * Adds token to pending if online logout fails.
   */
  private addPendingToken(userToken: string, deviceToken: string) {
    const arrTokens = this.getPendingTokens();
    arrTokens.push({ userToken: userToken, deviceToken: deviceToken });
    this.setPendingTokens(arrTokens);
  }

  /**
   * Removes pending token from backend.
   */
  removePendingTokens() {
    // Gets list as a copy of initial state because each iteration may remove one value in array
    const pendingTokens = JSON.parse(
      JSON.stringify(this.getPendingTokens())
    ) as { userToken: string; deviceToken: string }[];
    pendingTokens.forEach((pair) => {
      this.removeToken(pair.userToken, pair.deviceToken);
    });
  }
  //#endregion Remove deviceToken

  /**
   * Fired when API call returns Code = 401 (unauthorized)
   */
  onPasswordChanged() {
    this.alertController
      .create({
        mode: 'ios',
        header: 'Alerta',
        message: 'Su sesión ha caducado, por favor vuelva a ingresar.',
        buttons: [
          {
            text: 'Confirmar',
            role: 'cancel',
            handler: () => this.logout(),
          },
        ],
      })
      .then((alert) => alert.present());
  }

  // Authentication service
  isAuthenticated() {
    // return this.authSubject.value;
    return Boolean(window.localStorage.getItem('loggedIn'));
  }

  validateToken() {
    if (this.api.online) {
      return new Observable((obs) => {
        this.storage.get('currentUser').then((user) => {
          let body = { AccessToken: user.AccessToken };
          this.http
            .post(
              `${environment.apiUrl}/Services/AccountService.svc/ValidateAccessToken`,
              body
            )
            .subscribe(
              (res: ResponseDTO | any) => {
                if (res.Code === 0) {
                  obs.next();
                } else {
                  obs.error(res.Code);
                }
              },
              (err) => obs.error(err)
            );
        });
      });
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  checkUser() {
    this.storage.get('currentUser').then((res) => {
      if (res) {
        this.authSubject.next(true);
        window.localStorage.setItem('loggedIn', '1');
      } else {
        this.authSubject.next(false);
        window.localStorage.removeItem('loggedIn');
      }
    });
  }

  changePassword(password: string, newPassword: string): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer: any) => {
        this.storage
          .get('currentUser')
          .then((user) => {
            let body = {
              AccessToken: user.AccessToken,
              OldPassword: password,
              NewPassword: newPassword,
            };

            this.http
              .post(
                `${environment.apiUrl}/Services/AccountService.svc/UpdateAccount`,
                body
              )
              .subscribe((res: ResponseDTO | any) => {
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  recoverPassword(email: string): Observable<any> {
    if (this.api.online) {
      return Observable.create((observer: any) => {
        this.storage
          .get('currentUser')
          .then((user) => {
            let body = {
              Email: email,
            };

            this.http
              .post(
                `${environment.apiUrl}/Services/AccountService.svc/RecoverPassword`,
                body
              )
              .subscribe((res: ResponseDTO | any) => {
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error('Su dispositivo móvil se encuentra actualmente offline')
      );
    }
  }

  sendLinkFailNotification(identifier: string): void {
    const now = new Date();
    const day = ('0' + now.getDate().toString()).substr(-2);
    const month = ('0' + (now.getMonth() + 1).toString()).substr(-2);
    const year = now.getFullYear().toString().substr(-2);
    const hours = ('0' + now.getHours().toString()).substr(-2);
    const minutes = ('0' + now.getMinutes().toString()).substr(-2);
    const seconds = ('0' + now.getSeconds().toString()).substr(-2);
    const body = {
      Secuence: '007',
      EventDateTime: `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
      EventType: 'E',
      NotificationType: '630',
      Partition: '00',
      AlarmParameter: '0',
      AlarmIdentifier: identifier,
    };
    this.api
      .post('NotificationService.svc/NotifyEvent', body)
      .subscribe((x) => {}); // Sends notification
  }

  deleteAccount() {
    if (this.api.online) {
      return Observable.create((observer: any) => {
        this.storage
          .get('currentUser')
          .then((user) => {
            let body = {
              AccessToken: user.AccessToken,
            };
            this.http
              .post<any>(
                `${environment.apiUrl}/Services/AccountService.svc/DeleteAccount`,
                body
              )
              .subscribe((res: any) => {
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error('No se pudo conectar con el servidor')
      );
    }
  }
}
