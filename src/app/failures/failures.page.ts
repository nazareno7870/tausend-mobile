import { Component, OnInit } from '@angular/core';
import { FailureDTO } from '../models/DTOs/failuresDTO';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { FailuresService } from '../services/failures.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-failures',
  templateUrl: './failures.page.html',
  styleUrls: ['./failures.page.scss'],
})
export class FailuresPage implements OnInit {
  failures: { name: string; desc: string }[] = [];
  loading = false;
  centralSelected: '' = '';

  constructor(
    private failuresService: FailuresService,
    private alertService: AlertService,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.failures = [];
  }

  ionViewWillEnter() {
    this.failures = [];
    this.getFailuresList();
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
   * Gets failures from backend and displays it in a list.
   * Called when user enters in this page or when "refresh" button is clicked.
   */
  getFailuresList() {
    this.loading = true;
    this.failures = [];
    this.failuresService.get().subscribe(
      (res: FailureDTO | any) => {
        if (res && res.Code == 0) {
          const resKeys = ['Code', 'Message', 'State'];
          let description: string;
          Object.entries(res).forEach(([key, val]) => {
            if (!resKeys.includes(key)) {
              if (val) {
                description = this.failuresService.getDescription(key);
                this.failures.push({ name: key, desc: description });
              }
            }
          });
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al cargar las fallas, por favor intente nuevamente'
          );
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al cargar las fallas, por favor intente nuevamente'
          );
        }
      }
    );
  }
}
