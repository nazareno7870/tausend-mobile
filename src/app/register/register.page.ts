import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { AlertService } from '../services/alert.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  showPassword: boolean = false;
  passwordToggleIcon: string = 'eye';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {}

  togglePassword() {
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }

  async register(form: NgForm) {
    if (form.value.password.length < 5) {
      this.alertService.alertToast(
        'La contraseña debe tener al menos 5 caracteres'
      );
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Cargando',
    });

    await loading.present();

    this.authService
      .register(
        form.value.fName,
        form.value.lName,
        form.value.email,
        form.value.password
      )
      .pipe(first())
      .subscribe(
        (data) => {
          if (data && data.Code == 0) {
            this.alertService.presentToast('Usuario creado con éxito');
            this.router.navigate(['/login']);
          } else if (data && data.Code == 1000) {
            this.alertService.alertToast(data.Message);
          } else {
            this.alertService.alertToast(
              'Ocurrió un error, por favor compruebe sus credenciales.'
            );
          }
          loading.dismiss();
        },
        (error) => {
          this.alertService.alertToast(error.error.error);
          loading.dismiss();
        }
      );
  }
}
