import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { LoadingController, NavController } from '@ionic/angular';
import {
  ZonesExclusionsResponseDTO,
  ExclusionDTO,
} from '../models/DTOs/zonesDTO';
import { ExclusionsService } from '../services/exclusions.service';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { AppService } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { SmsService } from '../services/sms.service';

@Component({
  selector: 'app-exclusions',
  templateUrl: 'exclusions.page.html',
  styleUrls: ['exclusions.page.scss'],
})
export class ExclusionsPage implements OnInit {
  // private exclusionsPerRows = 3;
  private zonesPerPage = 8;
  private exclusionNumbers: string[] = [];
  private initalExclusions: string[] = [];
  private blinkIntervals: { exclNumber: number; interval: any }[] = [];

  exclusionsPages: any[][] = [];
  loading = false;
  isArmed: boolean = false;
  centralSelected: string = '';
  sms: boolean = false;

  constructor(
    private alertService: AlertService,
    private loadingController: LoadingController,
    private exclusionsService: ExclusionsService,
    private appService: AppService,
    private chRef: ChangeDetectorRef,
    private navCtrl: NavController,
    private authService: AuthService,
    private storage: Storage,
    private smsService: SmsService
  ) {}

  ngOnInit() {
    this.exclusionsPages = [];
    this.exclusionNumbers = [];
    this.initalExclusions = [];
    this.blinkIntervals = [];
  }

  ionViewWillEnter() {
    this.exclusionsPages = [];
    this.exclusionNumbers = [];
    this.initalExclusions = [];
    this.blinkIntervals = [];
    this.getCentralSelected();
  }

  /**
   * Get central selected
   */
  private getCentralSelected() {
    this.storage.get('currentUser').then((user) => {
      if (user.isSMS) {
        this.sms = true;
        this.centralSelected =
          user.SMSDevices &&
          user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0]
            .Description;
        this.exclusionsPages = this.SMSexlucionsPages;
      } else {
        this.sms = false;
        this.centralSelected =
          user.Devices &&
          user.Devices[user.DeviceSelected ? user.DeviceSelected : 0]
            .Description;
        this.getExclusionsList();
      }
    });
  }

  /**
   * Returns exclusion color based on "exclude" and "open" status
   */
  private getExclusionColor(zone: ExclusionDTO) {
    let color: string;
    if (zone.Excluded && zone.Open) {
      color = 'blink';
    } else if (zone.Excluded && !zone.Open) {
      color = 'warning';
    } else if (!zone.Excluded && zone.Open) {
      color = 'danger';
    } else {
      color = 'medium';
    }
    return color;
  }

  /**
   * Creates and return an interval of 1 second for alternate zone color between red and yellow
   */
  private setColorBlink(zone: ExclusionDTO) {
    zone.Color = 'warning';
    return setInterval(() => {
      zone.Color = zone.Color == 'warning' ? 'danger' : 'warning';
      this.chRef.detectChanges();
    }, 1000);
  }

  /**
   * Gets exclusions from backend.
   */
  getExclusionsList() {
    this.loading = true;
    this.isArmed = true;
    this.exclusionsPages = [];
    this.exclusionNumbers = [];
    this.initalExclusions = [];
    this.blinkIntervals.forEach((bi) => clearInterval(bi.interval));
    this.blinkIntervals = [];
    this.getArmStatus().subscribe(() => {
      this.exclusionsService.get().subscribe(
        (res: any) => {
          if (res && res.Code == 0) {
            const exclusions = res.Exclusions.sort((a: any, b: any) =>
              a.ExclusionNumber > b.ExclusionNumber ? 1 : -1
            );

            exclusions.forEach((excl: any) => {
              excl.Color = this.getExclusionColor(excl);
              if (excl.Color == 'blink') {
                this.blinkIntervals.push({
                  exclNumber: excl.ExclusionNumber,
                  interval: this.setColorBlink(excl),
                });
              }

              if (excl.Excluded) {
                this.exclusionNumbers.push(excl.ExclusionNumber.toString());
                this.initalExclusions.push(excl.ExclusionNumber.toString());
              }
            });
            this.exclusionsPages = this.exclusionsService.toList(
              exclusions,
              this.zonesPerPage
            );
            // this.exclusionsPages = this.exclusionsService.toGrid(exclusions, this.exclusionsPerRows, this.zonesPerPage);
            this.chRef.detectChanges();
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
        (err: any) => {
          this.loading = false;
          if (err && err.Code === 401) {
            // 401: Unauthorized
            this.authService.onPasswordChanged();
          } else {
            this.alertService.alertToast(
              'Ocurrió un error actualizar, por favor intente nuevamente.'
            );
          }
        },
        () => (this.loading = false)
      );
    });
  }

  /**
   * Called when user click "include" or "exclude" button
   */
  onClick(exclusion: ExclusionDTO) {
    if (this.isArmed && !exclusion.Excluded && !this.sms) {
      this.alertService.alertToast(
        'No pueden excluirse zonas si la alarma se encuentra armada.'
      );
    } else {
      this.excludeInclude(exclusion);
    }
  }

  /**
   * Changes exclusion exclude status between "excluded" and "not excluded". Also changes it's color based on new status.
   */
  private excludeInclude(exclusion: ExclusionDTO) {
    const exclNum = exclusion.ExclusionNumber.toString();
    if (this.exclusionNumbers.includes(exclNum)) {
      this.exclusionNumbers = this.exclusionNumbers.filter(
        (num) => num != exclNum
      );
    } else {
      this.exclusionNumbers.push(exclNum);
    }

    exclusion.Excluded = !exclusion.Excluded;
    exclusion.Color = this.getExclusionColor(exclusion);

    const blink = this.blinkIntervals.find(
      (bi) => bi.exclNumber == exclusion.ExclusionNumber
    );
    if (blink) {
      // delete blink interval if exists
      clearInterval(blink.interval);
      this.blinkIntervals = this.blinkIntervals.filter(
        (bi) => bi.exclNumber != blink.exclNumber
      );
    }

    if (exclusion.Color == 'blink') {
      this.blinkIntervals.push({
        exclNumber: exclusion.ExclusionNumber,
        interval: this.setColorBlink(exclusion),
      });
    }
  }

  /**
   * Gets if alarm is armed. Stores the result un this.isArmed
   */
  private getArmStatus() {
    return new Observable((obs) => {
      this.appService.getGeneralStatus().subscribe(
        (res: ResponseDTO) => {
          if (res.Code === 0) {
            this.isArmed = res.Text ? !res.Text.includes('READY') : false;
            obs.next();
          } else {
            this.alertService.alertToast(
              'La alarma no responde, intente nuevamente.'
            );
            obs.error();
          }
        },
        (err) => {
          if (err && err.Code === 401) {
            // 401: Unauthorized
            this.authService.onPasswordChanged();
          } else {
            this.alertService.alertToast(
              'Ocurrió un error, por favor intente nuevamente.'
            );
          }
          obs.error();
        }
      );
    });
  }

  /**
   * Called on click in "Save" button. Validates if it is ok to save and calls this.saveExclusions
   */
  async sendExclusions() {
    const hasExcludes =
      this.exclusionNumbers.length > 0 &&
      this.exclusionNumbers.some((ex) => !this.initalExclusions.includes(ex)); // if there is a new exclusion
    if (hasExcludes) {
      const loading = await this.loadingController.create({
        message: 'Aguarde',
      });
      await loading.present();
      this.appService.getGeneralStatus().subscribe(
        (res: ResponseDTO) => {
          loading.dismiss();
          if (res.Code == 0) {
            if (res.Text && res.Text.includes('READY')) {
              this.saveExclusions();
            } else {
              this.alertService.alertToast(
                'No pueden excluirse zonas si la alarma se encuentra armada.'
              );
            }
          } else {
            this.alertService.alertToast(
              'La alarma no responde, intente nuevamente.'
            );
          }
        },
        (err) => {
          loading.dismiss();
          if (err && err.Code === 401) {
            // 401: Unauthorized
            this.authService.onPasswordChanged();
          } else {
            this.alertService.alertToast(
              'Ocurrió un error al guardar los cambios, por favor intente nuevamente.'
            );
          }
        }
      );
    } else {
      this.saveExclusions();
    }
  }

  /**
   * Sends pending changes to backend
   */
  private async saveExclusions() {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();

    this.exclusionsService.excludeZones(this.exclusionNumbers).subscribe(
      (res: ResponseDTO | any) => {
        if (res && res.Code == 0) {
          this.exclusionNumbers = [];
          this.alertService.presentToast('Cambios guardados correctamente');
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar los cambios, por favor intente nuevamente.'
          );
        }
        this.getExclusionsList();
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar los cambios, por favor intente nuevamente.'
          );
        }
      }
    );
  }

  /**
   * Called on click in refresh button
   */
  onGetStatus() {
    this.getExclusionsList();
  }

  /**
   * Called when "back" is clicked. Returns to previous page.
   */
  goBack() {
    this.navCtrl.back();
  }

  ionViewWillLeave() {
    this.onLeave;
  }

  ngOnDestroy() {
    this.onLeave;
  }

  /**
   * Clears all the intervals
   */
  private onLeave() {
    this.blinkIntervals.forEach((bi) => clearInterval(bi.interval));
  }

  async sendSMSExclusions() {
    this.smsService.exclusions(this.exclusionNumbers);
  }

  SMSexlucionsPages = [
    [
      {
        Excluded: false,
        ExclusionId: 1,
        ExclusionNumber: 1,
        Name: '1',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 2,
        ExclusionNumber: 2,
        Name: '2',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 3,
        ExclusionNumber: 3,
        Name: '3',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 4,
        ExclusionNumber: 4,
        Name: '4',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 5,
        ExclusionNumber: 5,
        Name: '5',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 6,
        ExclusionNumber: 6,
        Name: '6',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 7,
        ExclusionNumber: 7,
        Name: '7',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 8,
        ExclusionNumber: 8,
        Name: '8',
        Open: false,
        Color: 'medium',
      },
    ],
    [
      {
        Excluded: false,
        ExclusionId: 9,
        ExclusionNumber: 9,
        Name: '9',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 10,
        ExclusionNumber: 10,
        Name: '10',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 11,
        ExclusionNumber: 11,
        Name: '11',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 12,
        ExclusionNumber: 12,
        Name: '12',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 13,
        ExclusionNumber: 13,
        Name: '13',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 14,
        ExclusionNumber: 14,
        Name: '14',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 15,
        ExclusionNumber: 15,
        Name: '15',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 16,
        ExclusionNumber: 16,
        Name: '16',
        Open: false,
        Color: 'medium',
      },
    ],
    [
      {
        Excluded: false,
        ExclusionId: 17,
        ExclusionNumber: 17,
        Name: '17',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 18,
        ExclusionNumber: 18,
        Name: '18',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 19,
        ExclusionNumber: 19,
        Name: '19',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 20,
        ExclusionNumber: 20,
        Name: '20',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 21,
        ExclusionNumber: 21,
        Name: '21',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 22,
        ExclusionNumber: 22,
        Name: '22',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 23,
        ExclusionNumber: 23,
        Name: '23',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 24,
        ExclusionNumber: 24,
        Name: '24',
        Open: false,
        Color: 'medium',
      },
    ],
    [
      {
        Excluded: false,
        ExclusionId: 25,
        ExclusionNumber: 25,
        Name: '25',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 26,
        ExclusionNumber: 26,
        Name: '26',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 27,
        ExclusionNumber: 27,
        Name: '27',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 28,
        ExclusionNumber: 28,
        Name: '28',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 29,
        ExclusionNumber: 29,
        Name: '29',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 30,
        ExclusionNumber: 30,
        Name: '30',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 31,
        ExclusionNumber: 31,
        Name: '31',
        Open: false,
        Color: 'medium',
      },
      {
        Excluded: false,
        ExclusionId: 32,
        ExclusionNumber: 32,
        Name: '32',
        Open: false,
        Color: 'medium',
      },
    ],
  ];
}
