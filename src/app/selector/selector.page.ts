import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AccountDTO } from '../models/DTOs/usersDTO';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.page.html',
  styleUrls: ['./selector.page.scss'],
})
export class SelectorPage implements OnInit {
  centrals: {
    Description: string;
    DeviceId: number;
    IsOnline: boolean;
    Mac: string;
    Pin: string;
    index: number;
  }[] = [];
  user: AccountDTO = {} as AccountDTO;
  initialCentrals: {
    Description: string;
    DeviceId: number;
    IsOnline: boolean;
    Mac: string;
    Pin: string;
    index: number;
  }[] = [];
  public searchDevice: string = '';

  constructor(
    private storage: Storage,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.centrals = [];
    this.initialCentrals = [];
    this.searchDevice = '';
  }

  ionViewWillEnter() {
    this.centrals = [];
    this.initialCentrals = [];
    this.searchDevice = '';
    this.getCentrals();
  }

  getCentrals() {
    this.storage.get('currentUser').then((user) => {
      if (user.Devices && user.SMSDevices && user.Devices.length > 0) {
        let devices: any = [];
        user.Devices.forEach((device: { DeviceId: number }, index: any) => {
          if (device.DeviceId !== 0) {
            devices.push({
              ...device,
              index: index,
              isSMS: false,
            });
          }
        });

        user.SMSDevices.forEach((device: any, index: any) => {
          devices.push({
            ...device,
            index: index,
            isSMS: true,
          });
        });

        this.centrals = devices;
        this.initialCentrals = devices;
        this.user = user;
      }
    });
  }

  handleCentral(device : any) {
    this.storage
      .set('currentUser', {
        ...this.user,
        DeviceSelected: device.index,
        isSMS: device.isSMS,
      })
      .then(() => {
        this.router.navigate(['/home']);
      });
  }

  logout() {
    this.authService.logout();
  }

  searchDevices(search: string) {
    if (search == '') {
      this.centrals = this.initialCentrals;
    }

    this.centrals = this.initialCentrals.filter((device) => {
      return device.Description.toLowerCase().includes(search.toLowerCase());
    });

    this.searchDevice = search;
    return search;
  }
}
