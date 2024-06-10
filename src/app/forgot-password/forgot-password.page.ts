import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  public email: string = "";

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async recoverPassword() {
    if (this.email.length > 0) {
      const alert = await this.alertController.create({
        mode: 'ios',
        header: 'Atención',
        message: 'Se generará una nueva contraseña y se enviará por mail a la cuenta ingresada.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              // console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Continuar',
            handler: async () => {
              const loading = await this.loadingController.create({
                message: 'Actualizando'
              });

              await loading.present();

              this.authService.recoverPassword(this.email)
                .subscribe(
                  data => {
                    if (data && data.Code == 0) {
                      this.alertService.presentToast("Se enviará por mail la nueva contraseña.");
                      this.router.navigate(['/login']);
                      this.email = "";
                    } else {
                      this.alertService.alertToast("Ocurrió con la recuperación de contraseña, por favor verifique su email e intentelo nuevamente.");
                    }
                    loading.dismiss();
                  },
                  error => {
                    this.alertService.alertToast(error.Message);
                    loading.dismiss();
                  }
                );
            }
          }
        ]
      });

      await alert.present();

    } else {
      this.alertService.alertToast("Debe ingresar un email.");
    }
  }
}
