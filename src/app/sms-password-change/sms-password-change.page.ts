import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { SmsService } from '../services/sms.service';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';
import { AuthService } from './../services/auth.service';
@Component({
  selector: 'app-sms-password-change',
  templateUrl: './sms-password-change.page.html',
  styleUrls: ['./sms-password-change.page.scss'],
})
export class SmsPasswordChangePage implements OnInit {
  public passwordSMS: number | null = null;
  public passwordSMSOk: boolean = false;
  public secondPasswordSMS: number | null = null;
  public secondPasswordSMSOk: boolean = false;
  centralSelected: string = '';
  public central: any = {};
  public showModal: boolean = false;

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertService: AlertService,
    private smsService: SmsService,
    private storage: Storage
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getCentralSelected();
    this.showModal = false;
    this.passwordSMS = null;
    this.passwordSMSOk = false;
    this.secondPasswordSMS = null;
    this.secondPasswordSMSOk = false;
  }
  /**
   * Get central selected
   */
  private getCentralSelected() {
    this.storage.get('currentUser').then((user) => {
      this.centralSelected =
        user.SMSDevices &&
        user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0]
          .Description;
      this.central =
        user.SMSDevices &&
        user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0];
    });
  }

  changePasswordSMS(number: number) {
    let regex = new RegExp('^[0-9]{1,4}$');
    if (regex.test(Number(number).toString())) {
      this.passwordSMS = Number(number);
      this.passwordSMSOk = true;
      return number;
    } else {
      this.passwordSMS = null;
      this.passwordSMSOk = false;
      return null;
    }
  }

  changeSecondPasswordSMSOk(number: number) {
    let regex = new RegExp('^[0-9]{1,4}$');
    if (regex.test(Number(number).toString())) {
      this.secondPasswordSMS = Number(number);
      this.secondPasswordSMSOk = true;
      return number;
    } else {
      this.secondPasswordSMS = null;
      this.secondPasswordSMSOk = false;
      return null;
    }
  }

  sendSMS() {
    if (this.passwordSMSOk && this.secondPasswordSMSOk) {
      if (this.passwordSMS === this.secondPasswordSMS) {
        this.smsService.changePasswordSMS(
          this.passwordSMS ? this.passwordSMS.toString() : ''
        );
        this.showModal = true;
      } else {
        this.alertService.alertToast('Las claves no coinciden');
      }
    } else if (!this.passwordSMSOk) {
      this.alertService.alertToast('Ingrese una clave válida');
    } else if (!this.secondPasswordSMSOk) {
      this.alertService.alertToast('Ingrese una segunda clave válida');
    }
  }

  async changePasswordSMSOk() {
    const loading = await this.loadingController.create({
      message: 'Actualizando',
    });
    this.showModal = false;

    await loading.present();

    this.smsService
      .updateDevice({
        idDevice: this.central.DeviceId,
        description: this.central.Description,
        identifier: this.central.Identifier,
        pin: this.central.DevicePin,
        phoneNumber: this.central.PhoneNumber,
        pinSMS: this.passwordSMS ? this.passwordSMS.toString() : '',
        modelSMS: this.central.DeviceType,
      })
      .subscribe(
        (data: any) => {
          if (data && data.Code == 0) {
            this.alertService.presentToast('Dispositivo actualizado con éxito');

            //this.router.navigate(['/home']);
            this.authService.logout();
          }
          loading.dismiss();
        },
        (err: any) => {
          loading.dismiss();
          this.alertService.alertToast(
            'Ocurrió un error actualizando el dispositivo, por favor intentelo nuevamente.'
          );
          console.log(err);
        }
      );
  }
}
