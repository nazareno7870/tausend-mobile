import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {
  LoadingController,
  MenuController,
  AlertController,
} from '@ionic/angular';
import { AlertService } from '../services/alert.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountDTO } from '../models/DTOs/usersDTO';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private loadingController: LoadingController,
    private menu: MenuController,
    private storage: Storage,
    private alertController: AlertController
  ) {}
  showPassword: boolean = false;
  passwordToggleIcon: string = 'eye';

  ngOnInit() {}

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the login page
    this.menu.enable(true);
  }

  /**
   * Fired when "log in" button is clicked.
   * Sends form data to backend.
   * Redirects user to homepage on success or shows error mensage when fails.
   */
  async login(form: NgForm) {
    const loading = await this.loadingController.create({
      message: 'Cargando',
    });

    await loading.present();
    this.authService
      .login(form.value.email, form.value.password)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data && data.Code == 0 && data.Account) {
            // this.router.navigate([this.returnUrl]);
            if (data.PinChanged) {
              if (data.RemovedDevices.length === 1) {
                this.alertController
                  .create({
                    mode: 'ios',
                    header: 'Atención',
                    message: `El PIN utilizado de la central: ${data.RemovedDevices[0].Description} ya no es válido, por favor vuelva a vincularse a la central`,
                    buttons: ['Aceptar'],
                  })
                  .then((alrt) => alrt.present());
              } else if (data.RemovedDevices.length > 1) {
                const centrals = data.RemovedDevices.map(
                  (d: any) => d.Description
                ).join('- ');
                this.alertController.create({
                  mode: 'ios',
                  header: 'Atención',
                  message: `El PIN utilizado de las centrales: ${centrals} ya no es válido, por favor vuelva a vincularse a las centrales`,
                  buttons: ['Aceptar'],
                });
              }
            }
            setTimeout(() => {
              window.localStorage.setItem('linkRetrys', '0');
              this.storage.get('currentUser').then((user: AccountDTO) => {
                if (
                  user.Devices &&
                  user.SMSDevices &&
                  user.Devices[0].DeviceId == 0 &&
                  user.SMSDevices.length == 0
                ) {
                  this.router.navigate(['setup']);
                } else {
                  this.router.navigate(['selector']);
                }
              });
              loading.dismiss();
              form.reset();
            }, 500);
          } else if (data && data.Code == 20000) {
            this.alertService.alertToast(data.Message);
            loading.dismiss();
          } else {
            this.alertService.alertToast(
              'Ocurrió un error, por favor compruebe sus credenciales.'
            );
            loading.dismiss();
          }
        },
        (error) => {
          if (typeof error == 'string') {
            this.alertService.alertToast(error);
          } else {
            // alert(JSON.stringify(error));
            // this.alertService.alertToast(error.error.error);
            this.alertService.alertToast(
              'Ha ocurrido un error, por favor intente nuevamente'
            );
          }
          loading.dismiss();
        }
      );
  }
  togglePassword() {
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }
}
