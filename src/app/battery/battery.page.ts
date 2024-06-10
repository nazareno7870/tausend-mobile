import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BatteryResponseDTO } from '../models/DTOs/batteryDTO';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { CommandsService } from '../services/commands.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-battery',
  templateUrl: './battery.page.html',
  styleUrls: ['./battery.page.scss'],
})
export class BatteryPage implements OnInit {
  batteryStatus: BatteryResponseDTO = new BatteryResponseDTO();
  centralSelected = '';
  constructor(
    private loadingController: LoadingController,
    private commandService: CommandsService,
    private alertService: AlertService,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadData();
    this.getCentralSelected();
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

  /**
   * Retrieves battery status from backend
   */
  async loadData() {
    this.batteryStatus = new BatteryResponseDTO();
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.commandService.getBatteryStatus().subscribe(
      (res: BatteryResponseDTO | any) => {
        if (res && res.Code === 0) {
          this.batteryStatus = res;
        } else {
          this.alertService.alertToast(res.Message);
        }
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al enviar el código, por favor intente nuevamente'
          );
        }
      }
    );
  }
}
