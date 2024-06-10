import { AuthService } from './../services/auth.service';
import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.page.html',
  styleUrls: ['./user-account.page.scss'],
})
export class UserAccountPage implements OnInit {
  constructor(
    private alertService: AlertService,
    private loadingController: LoadingController,
    private authService: AuthService,
    private storage: Storage
  ) {}
  public user: any = {};
  public showModalDeleteAccount: boolean = false;

  ngOnInit() {}

  ionViewWillEnter() {
    this.storage.get('currentUser').then((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  handleDeleteAccount() {
    this.showModalDeleteAccount = true;
  }

  async confirmDeleteAccount() {
    const loading = await this.loadingController.create({
      message: 'Eliminando',
    });

    await loading.present();
    this.authService.deleteAccount().subscribe(
      (data: any) => {
        if (data && data.Code == 0) {
          this.alertService.presentToast('Usuario eliminado con éxito');
          this.authService.logout();
        }
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        this.alertService.alertToast(
          'Ocurrió un error eliminando su cuenta, por favor intentelo nuevamente.'
        );
        console.log(err);
      }
    );
    loading.dismiss();
  }
  handleCancelRemoveAccount() {
    this.showModalDeleteAccount = false;
  }
}
