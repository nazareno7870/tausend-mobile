import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { CreateUserDTO, UserResponseDTO } from '../models/DTOs/usersDTO';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { DeviceService } from '../services/device.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-users-labels',
  templateUrl: './users-labels.page.html',
  styleUrls: ['./users-labels.page.scss'],
})
export class UsersLabelsPage implements OnInit {
  loading: boolean = true;
  arrAddUsers: CreateUserDTO[] = [];
  centralSelected: '' = '';
  private noSavedChanges: boolean = false;

  constructor(
    private alertController: AlertController,
    private deviceService: DeviceService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.arrAddUsers = [];
  }

  ionViewWillEnter() {
    this.loading = false;
    this.arrAddUsers = [];
    this.getUsers();
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

  getUsers() {
    this.arrAddUsers = [];
    this.loading = true;
    this.noSavedChanges = false;
    this.deviceService.enumUsers().subscribe(
      (res: UserResponseDTO | any) => {
        if (res.Code == 0) {
          this.arrAddUsers = res.Users.sort(
            (a: { UserNumber: number }, b: { UserNumber: number }) =>
              a.UserNumber - b.UserNumber
          );
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

  addUserLabel() {
    this.showModal();
  }

  editUserLaber(user: CreateUserDTO) {
    this.alertController
      .create({
        header: 'Seleccionar acción',
        mode: 'ios',
        inputs: [
          {
            name: 'delete',
            type: 'radio',
            label: 'Eliminar etiqueta',
            value: 'delete',
          },
          {
            name: 'edit',
            type: 'radio',
            label: 'Modificar etiqueta',
            value: 'edit',
          },
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ok',
            handler: (data: string) => {
              switch (data) {
                case 'delete':
                  user.UserName = '';
                  this.noSavedChanges = true;
                  break;
                case 'edit':
                  this.showModal(user);
                  break;
              }
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  private showModal(user?: CreateUserDTO) {
    let header: string;
    let inputs: any[] = [];

    if (user) {
      header = 'Modificar etiqueta de usuario';
      inputs.push({
        placeholder: 'Número de usuario',
        type: 'number',
        name: 'userNumber',
        disabled: true,
        value: user.UserNumber,
      });
      inputs.push({
        placeholder: 'Etiqueta',
        type: 'text',
        name: 'userName',
        value: user.UserName,
      });
    } else {
      header = 'Añadir etiqueta de usuario';
      inputs.push({
        placeholder: 'Número de usuario',
        type: 'number',
        name: 'userNumber',
        id: 'userNumberInput',
      });
      inputs.push({ placeholder: 'Etiqueta', type: 'text', name: 'userName' });
    }
    this.alertController
      .create({
        mode: 'ios',
        header: header,
        inputs: inputs,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: (data) => {
              if ((data.userNumber || user) && data.userName) {
                const userNumber = Number(data.userNumber);
                if (Number.isInteger(userNumber) && userNumber >= 0) {
                  if (user) {
                    user.UserName = data.userName;
                  }

                  const addUser = this.arrAddUsers.find(
                    (us) => us.UserNumber == userNumber
                  );
                  if (addUser) {
                    addUser.UserName = data.userName;
                  } else {
                    this.arrAddUsers.push({
                      UserNumber: userNumber,
                      UserName: data.userName,
                    });
                    this.arrAddUsers = this.arrAddUsers.sort(
                      (a, b) => a.UserNumber - b.UserNumber
                    );
                  }

                  this.noSavedChanges = true;
                } else {
                  this.alertService.alertToast(
                    'El número de usuario debe ser un entero mayor a 0'
                  );
                }
              } else {
                let msg = 'Por favor complete ';
                if (!data.userName && !data.userNumber) {
                  msg += 'número de usuario y etiqueta';
                } else if (!data.userNumber) {
                  msg += 'número de usuario';
                } else {
                  msg += 'la etiqueta';
                }
                this.alertService.alertToast(msg);
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
        const userNumberInput: any = document.getElementById('userNumberInput');
        userNumberInput.addEventListener('keydown', (ev: any) => {
          const input = ev.target as HTMLInputElement;
          const key = ev.key;
          const regex = /^[0-9]*$/g; // Only digits regex
          const arrValid = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'Shift',
          ];
          if (!arrValid.includes(key) && !key.match(regex)) {
            ev.preventDefault();
          }
          if (input.value.length >= 3 && !arrValid.includes(key)) {
            ev.preventDefault();
          }
        });
      });
  }

  saveChanges() {
    this.loading = true;
    this.deviceService.createUsers(this.arrAddUsers).subscribe(
      (res: ResponseDTO | any) => {
        this.loading = false;
        if (res && res.Code == 0) {
          this.alertService.presentToast('Cambios guardados correctamente');
          this.getUsers();
        } else {
          if (res.Code == 6) {
            this.alertService.alertToast(
              'La alarma no responde, por favor intente nuevamente.'
            );
          } else {
            this.alertService.alertToast(res.Message);
          }
        }
      },
      (err) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar los cambios, por favor intente nuevamente'
          );
        }
      }
    );
  }

  /**
   * Shows alert if there are no saved changes
   */
  goBack() {
    if (this.noSavedChanges) {
      this.alertController
        .create({
          mode: 'ios',
          header: 'Aviso',
          subHeader: 'Existen cambios sin guardar, desea abandonar la página?',
          buttons: [
            { text: 'No', role: 'cancel' },
            { text: 'Si', handler: () => this.navCtrl.back() },
          ],
        })
        .then((alert) => alert.present());
    } else {
      this.navCtrl.back();
    }
  }
}
