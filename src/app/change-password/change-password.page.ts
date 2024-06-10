import { AuthService } from './../services/auth.service';
import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
// import { Socket } from '@spryrocks/capacitor-socket-connection-plugin';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { NativeAudio } from '@capacitor-community/native-audio';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  showPassword: boolean = false;
  showPassword2: boolean = false;
  passwordToggleIcon: string = 'eye';
  passwordToggleIcon2: string = 'eye';

  public password: string = '';
  public newPassword: string = '';

  constructor(
    private alertService: AlertService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private wifiWizard2: WifiWizard2
  ) {}

  ngOnInit() {
    // const socket = new Socket();
    // socket.open('192.168.0.168', 9080);
    // socket.write(Uint8Array.from('hello'.split('').map(letter => letter.charCodeAt(0))));
    // BackgroundMode.enable();
    // NativeAudio.preload({
    //   assetId: 'fire',
    //   assetPath: 'fire.mp3',
    //   audioChannelNum: 1,
    //   isUrl: false,
    // });
    // setTimeout(() => {
    //   NativeAudio.play({
    //     assetId: 'fire',
    //     // time: 6.0 - seek time
    //   });
    // }, 1000);
    this.wifiWizard2.requestPermission().then((result) => {
      this.wifiWizard2.listNetworks()
      this.wifiWizard2.scan().then((result) => {
        this.wifiWizard2.getScanResults({numLevels: 5}).then((result) => {
          for (let i = 0; i < result.length; i++) {
            console.log(result[i].SSID);
            console.log(result[i].BSSID);
            console.log(result[i].level);
          }
        })
      })

    });
  }
  /**
   * Switchs between hidden password (***) and visible password
   */
  togglePassword() {
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }
  togglePassword2() {
    this.showPassword2 = !this.showPassword2;

    if (this.passwordToggleIcon2 == 'eye') {
      this.passwordToggleIcon2 = 'eye-off';
    } else {
      this.passwordToggleIcon2 = 'eye';
    }
  }
  /**
   * Validates inpunts and sends changes to backend
   */
  async changePassword() {
    if (this.password.length > 0 && this.newPassword.length > 0) {
      if (this.newPassword.length < 5) {
        this.alertService.alertToast(
          'La contraseña debe tener al menos 5 caracteres'
        );
        return;
      }
      if (this.password == this.newPassword) {
        this.alertService.alertToast(
          'La contraseña debe ser diferente a la actual'
        );
      } else {
        const alert = await this.alertController.create({
          mode: 'ios',
          header: 'Atención',
          message:
            'Se cerrará sesión automáticamente luego de cambiar la contraseña.',
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
                  cssClass: 'loading',
                });

                await loading.present();

                this.authService
                  .changePassword(this.password, this.newPassword)
                  .subscribe(
                    (data) => {
                      if (data && data.Code == 0) {
                        this.alertService.presentToast(
                          'Cambio de contraseña exitoso'
                        );
                        this.password = '';
                        this.newPassword = '';
                        this.authService.logout();
                      } else if (data && data.Code == 3001) {
                        this.alertService.alertToast(data.Message);
                      } else {
                        this.alertService.alertToast(
                          'Ocurrió un error con el cambio de contraseña, por favor intentelo nuevamente.'
                        );
                      }
                      loading.dismiss();
                    },
                    (error) => {
                      if (error && error.Code === 401) {
                        this.authService.onPasswordChanged();
                      } else {
                        this.alertService.alertToast(error.Message);
                      }
                      loading.dismiss();
                    }
                  );
              },
            },
          ],
        });

        await alert.present();
      }
    } else {
      this.alertService.alertToast('Debe ingresar ambas contraseñas.');
    }
  }
}
