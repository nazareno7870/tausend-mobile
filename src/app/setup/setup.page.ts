import { AuthService } from './../services/auth.service';
import { Storage } from '@ionic/storage';
import { AppService } from './../services/app.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { NgForm } from '@angular/forms';
import { AccountDTO } from '../models/DTOs/usersDTO';
import { SmsService } from '../services/sms.service';
@Component({
  selector: 'app-setup',
  templateUrl: 'setup.page.html',
  styleUrls: ['setup.page.scss'],
})
export class SetupPage implements OnInit {
  public description: string = '';
  public identifier: string = '';
  public pin: string | null = '';
  public phone: string = '';
  public pinSMS: string = '';
  public typeForm: any = null;
  public centrals: {
    Description: string;
    DeviceId: number;
    IsOnline: boolean;
    Mac: string;
    Pin: string;
    index: number;
  }[] = [];
  public user: AccountDTO = {} as AccountDTO;
  public invalidPIN: boolean = false;
  private retrys: number = 0;
  public centralSelected: string = '';
  public isSMS: boolean = false;
  public showModal: boolean = false;
  public showModalSMS: boolean = false;
  public modelSMSCentral: string = '';
  public showModalSMSRemove: boolean = false;
  public showModalRemove: boolean = false;
  public central: any = {};
  public patternPin = /^[0-9]{4}$/;
  // private user: AccountDTO;

  constructor(
    private loadingController: LoadingController,
    private appService: AppService,
    private alertService: AlertService,
    private storage: Storage,
    private alertController: AlertController,
    private authService: AuthService, // private deviceService: DeviceService
    private smsService: SmsService
  ) {}

  ngOnInit() {
    this.centrals = [];
    this.typeForm = null;
    this.description = '';
    this.identifier = '';
    this.pin = null;
    this.showModal = false;
    this.showModalSMS = false;
    this.showModalSMSRemove = false;
    this.showModalRemove = false;
    this.modelSMSCentral = '';
    this.central = {};
  }

  ionViewWillEnter() {
    this.typeForm = null;
    this.description = '';
    this.identifier = '';
    this.pin = null;
    this.showModal = false;
    this.showModalSMS = false;
    this.showModalSMSRemove = false;
    this.showModalRemove = false;
    this.modelSMSCentral = '';
    this.central = {};
    var strRetrys = window.localStorage.getItem('linkRetrys');
    this.retrys = strRetrys ? +strRetrys : 0;
    this.getCentrals();
    this.storage.get('currentUser').then((user) => {
      if (
        user &&
        user.Devices &&
        user.Devices[user.Devices.length - 1] &&
        user.Devices[user.Devices.length - 1].DeviceId != 0
      ) {
        this.description = user.Devices[user.Devices.length - 1].Description;
        this.identifier = user.Devices[user.Devices.length - 1].Mac;
        this.pin = user.Devices[user.Devices.length - 1].Pin;
      }
    });
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
        this.user = user;
      }
    });
  }

  handleShowModal() {
    this.showModal = true;
  }

  handleCreate(type: string) {
    if (type === 'sms') {
      this.isSMS = true;
      this.showModalSMS = true;
    } else {
      this.isSMS = false;
      this.showModalSMS = false;
      this.typeForm = 'create';
    }
    this.description = '';
    this.identifier = '';
    this.pin = null;
    this.phone = '';
    this.pinSMS = '';
    this.showModal = false;
    this.modelSMSCentral = '';
    this.central = {};
  }

  handleSMS(model: string) {
    this.isSMS = true;
    this.typeForm = 'create';
    this.description = '';
    this.central = {};
    this.identifier = '';
    this.pin = null;
    this.phone = '';
    this.pinSMS = '';
    this.showModal = false;
    this.showModalSMS = false;
    this.modelSMSCentral = model;
  }

  handleCancel() {
    this.typeForm = null;
    this.description = '';
    this.identifier = '';
    this.pin = null;
    this.phone = '';
    this.pinSMS = '';
    this.isSMS = false;
    this.showModal = false;
    this.showModalSMS = false;
    this.modelSMSCentral = '';
    this.central = {};
  }

  handleUnlinkSMS() {
    this.showModalSMSRemove = true;
  }

  handleUnlink() {
    this.showModalRemove = true;
  }

  handleCancelRemove() {
    this.showModalSMSRemove = false;
    this.showModalRemove = false;
  }

  handleEditCentral(central: any) {
    this.storage.set('currentUser', {
      ...this.user,
      DeviceSelected: central.index,
    });
    this.central = central;
    this.typeForm = 'edit';
    this.isSMS = central.isSMS;
    this.description = central.Description;
    this.centralSelected = central.Description;
    if (central.isSMS) {
      this.modelSMSCentral = central.DeviceType;
      this.pinSMS = central.SimPin;
      this.phone = central.PhoneNumber;
      this.identifier = central.Identifier;
      this.pin = central.DevicePin;
    } else {
      this.identifier = central.Mac;
      this.pin = central.Pin;
    }
  }

  async confirmUnlink() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Atención',
      message:
        'Se cerrará sesión automáticamente luego de desvincular el dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Continuar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Actualizando',
            });

            await loading.present();
            this.appService
              .unlinkDevice({
                DeviceId: this.central.DeviceId,
              })
              .subscribe(
                (data: any) => {
                  if (data && data.Code == 0) {
                    this.alertService.presentToast(
                      'Dispositivo desvinculado con éxito'
                    );

                    //this.router.navigate(['/home']);
                    this.authService.logout();
                  }
                  loading.dismiss();
                },
                (err: any) => {
                  loading.dismiss();
                  this.alertService.alertToast(
                    'Ocurrió un error desvinculando el dispositivo, por favor intentelo nuevamente.'
                  );
                  console.log(err);
                }
              );
            loading.dismiss();
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmUnlinkSMS() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Atención',
      message:
        'Se cerrará sesión automáticamente luego de desvincular el dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Continuar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Actualizando',
            });

            await loading.present();
            this.smsService
              .unlinkDevice({
                idDevice: this.central.DeviceId,
              })
              .subscribe(
                (data: any) => {
                  if (data && data.Code == 0) {
                    this.alertService.presentToast(
                      'Dispositivo desvinculado con éxito'
                    );

                    //this.router.navigate(['/home']);
                    this.authService.logout();
                  }
                  loading.dismiss();
                },
                (err: any) => {
                  loading.dismiss();
                  this.alertService.alertToast(
                    'Ocurrió un error desvinculando el dispositivo, por favor intentelo nuevamente.'
                  );
                  console.log(err);
                }
              );
            loading.dismiss();
          },
        },
      ],
    });

    await alert.present();
  }

  async setup(form: NgForm | any) {
    if (!this.isSMS && form.controls.pin.value.length != 4) {
      this.invalidPIN = true;
      this.alertService.alertToast('El Código de Usuario debe tener 4 dígitos');
    } else {
      this.invalidPIN = false;

      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Atención',
        message:
          'Se cerrará sesión automáticamente luego de actualizar el dispositivo.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              // console.log('Confirm Cancel: blah');
            },
          },
          {
            text: 'Continuar',
            handler: async () => {
              const loading = await this.loadingController.create({
                message: 'Actualizando',
              });

              await loading.present();
              if (!this.isSMS) {
                this.appService
                  .createOrUpdateDevice(
                    form.value.description,
                    form.value.identifier,
                    form.value.pin,
                    this.typeForm
                  )
                  .subscribe(
                    (data: any) => {
                      if (data && data.Code == 0) {
                        this.alertService.presentToast(
                          'Dispositivo actualizado con éxito'
                        );

                        //this.router.navigate(['/home']);
                        this.authService.logout();
                        form.reset();
                      } else if (data && data.Code == 2000) {
                        this.alertService.alertToast(data.Message);
                      } else if (data && data.Code == 400) {
                        let message = data.Message.split('.')[0] as string;
                        if (
                          message ==
                          'Identificador o Código de Usuario incorrectos'
                        ) {
                          this.retrys++;
                          message += `. Quedan ${3 - this.retrys} intentos.`;
                          window.localStorage.setItem(
                            'linkRetrys',
                            this.retrys.toString()
                          );
                        }
                        this.alertController
                          .create({
                            header: 'Atención',
                            mode: 'ios',
                            message: message,
                            buttons: [
                              {
                                text: 'Confirmar',
                                role: 'cancel',
                                handler: () => {
                                  if (this.retrys >= 3) {
                                    this.authService.sendLinkFailNotification(
                                      form.value.identifier
                                    );
                                    form.reset();
                                    this.authService.logout();
                                  }
                                },
                              },
                            ],
                          })
                          .then((al) => al.present());
                      } else {
                        this.alertService.alertToast(
                          'Ocurrió un error actualizando el dispositivo, por favor intentelo nuevamente.'
                        );
                      }
                      loading.dismiss();
                    },
                    (err: any) => {
                      loading.dismiss();
                      if (err && err.Code === 401) {
                        // 401: Unauthorized
                        this.authService.onPasswordChanged();
                      } else {
                        this.alertService.alertToast(err.error.error);
                      }
                    }
                  );
              } else {
                if (form.controls.phone.value.toString().length < 10) {
                  this.alertService.alertToast(
                    'El número de teléfono es inválido'
                  );
                  loading.dismiss();
                  return;
                }
                if (form.controls.pinSMS.value.toString().length != 4) {
                  this.alertService.alertToast(
                    'El PIN SMS debe tener 4 dígitos'
                  );
                  loading.dismiss();
                  return;
                }
                if (this.typeForm === 'create') {
                  this.smsService
                    .createDevice({
                      description: form.value.description,
                      identifier: this.modelSMSCentral,
                      pin: form.value.pinSMS,
                      phoneNumber: form.value.phone,
                      pinSMS: form.value.pinSMS,
                      modelSMS: this.modelSMSCentral,
                    })
                    .subscribe(
                      (data: any) => {
                        if (data && data.Code == 0) {
                          this.alertService.presentToast(
                            'Dispositivo vinculado con éxito'
                          );

                          //this.router.navigate(['/home']);
                          this.authService.logout();
                          form.reset();
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
                } else if (this.typeForm === 'edit') {
                  this.smsService
                    .updateDevice({
                      idDevice: this.central.DeviceId,
                      description: form.value.description,
                      identifier: this.modelSMSCentral,
                      pin: form.value.pinSMS,
                      phoneNumber: form.value.phone,
                      pinSMS: form.value.pinSMS,
                      modelSMS: this.modelSMSCentral,
                    })
                    .subscribe(
                      (data: any) => {
                        if (data && data.Code == 0) {
                          this.alertService.presentToast(
                            'Dispositivo actualizado con éxito'
                          );

                          //this.router.navigate(['/home']);
                          this.authService.logout();
                          form.reset();
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
                loading.dismiss();
              }
            },
          },
        ],
      });

      await alert.present();
    }
  }
}
