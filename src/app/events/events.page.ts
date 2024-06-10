import { Component, OnInit } from '@angular/core';
import { EventDTO, EventsResponseDTO } from '../models/DTOs/eventsDTO';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { NotificationsService } from '../services/notifications.service';
import { Storage } from '@ionic/storage';
import { CreateUserDTO, UserResponseDTO } from './../models/DTOs/usersDTO';
import { DeviceService } from './../services/device.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  events: EventDTO[] = [];
  loading: boolean = true;
  arrAddUsers: CreateUserDTO[] = [];
  centralSelected: '' = '';

  constructor(
    private notificationsService: NotificationsService,
    private alertService: AlertService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.events = [];
    this.arrAddUsers = [];
  }

  ionViewWillEnter() {
    this.loading = false;
    this.events = [];
    this.arrAddUsers = [];
    this.getUsers();
    this.getCentralSelected();
    this.getEventsList();
  }

  /**
   * Get central selected
   */
  private getCentralSelected() {
    this.storage.get('currentUser').then((user) => {
      this.centralSelected =
        user &&
        user.Devices &&
        user.Devices[user.DeviceSelected ? user.DeviceSelected : 0] &&
        user.Devices[user.DeviceSelected ? user.DeviceSelected : 0].Description;
    });
  }

  getUsers() {
    this.arrAddUsers = [];
    this.loading = true;
    this.deviceService.enumUsers().subscribe(
      (res: UserResponseDTO | any) => {
        if (res.Code == 0) {
          let newArray: CreateUserDTO[] = [];
          res.Users.map((user: CreateUserDTO) => {
            newArray[user.UserNumber] = user;
          });
          this.arrAddUsers = newArray;
        } else {
          if (res.Code == 6) {
            this.alertService.alertToast(
              'La alarma no responde, por favor intente nuevamente.'
            );
          } else {
            this.alertService.alertToast(res.Message);
          }
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error actualizar, por favor intente nuevamente.'
          );
        }
      }
    );
  }

  /**
   * Gets events list from backend. Called when user enters in this page.
   */
  getEventsList() {
    this.events = [];
    this.loading = true;
    this.notificationsService.enumEvents().subscribe(
      (res: EventsResponseDTO | any) => {
        if (res.Code == 0) {
          const regexCentral = /\(([^()]*[^()]*)\)+/g;
          const regexUser = /'([^()]*)'/g;
          res.Events.forEach((event: EventDTO) => {
            event.Text = event.Text.replace(
              regexCentral,
              () => `(${this.centralSelected})`
            );
            event.Text = event.Text.replace(regexUser, (match, g1) => {
              let userNumber;
              if (Number(g1)) {
                userNumber = Number(g1);
              } else if (g1 === 'maestro') {
                return;
              } else {
                const userNum = g1.split(': ')[0];
                if (Number(userNum)) {
                  userNumber = Number(userNum);
                }
              }
              return this.arrAddUsers[userNumber ? userNumber : 0]
                ? `${userNumber}: ${
                    this.arrAddUsers[userNumber ? userNumber : 0].UserName
                  }`
                : g1;
            });
          });
          this.events = res.Events;
        } else {
          if (res.Code == 6) {
            this.alertService.alertToast(
              'La alarma no responde, por favor intente nuevamente.'
            );
          } else {
            this.alertService.alertToast(res.Message);
          }
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al obtener los eventos, por favor intente nuevamente.'
          );
        }
      }
    );
  }
}
