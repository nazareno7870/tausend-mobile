import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { AlertController, NavController } from '@ionic/angular';
import {
  ZoneDTO,
  ZoneMiniDTO,
  ZonesResponseDTO,
} from '../models/DTOs/zonesDTO';
import { ZonesService } from '../services/zones.service';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { AuthService } from '../services/auth.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.page.html',
  styleUrls: ['./zones.page.scss'],
})
export class ZonesPage implements OnInit {
  // private zonesPerRows = 3;
  private zonesPerPage = 8;
  private zoneChanges: ZoneMiniDTO[] = [];
  private noSavedChanges: boolean = false;
  zonePages: ZoneDTO[][] = [];
  blinkIntervals: any[] = [];
  loading = false;
  changesLoading = false;
  centralSelected: '' = '';

  constructor(
    private alertService: AlertService,
    private zonesService: ZonesService,
    private chRef: ChangeDetectorRef,
    private alertController: AlertController,
    private authService: AuthService,
    private storage: Storage,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.zonePages = [];
    this.zoneChanges = [];
    this.blinkIntervals = [];
    this.getZonesList();
    this.getCentralSelected();
  }

  /**
   * Get equipo selected
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
   * Fired when a zone is clicked. Opens an modal for change zone name.
   */
  onClick(zone: ZoneDTO) {
    this.alertController
      .create({
        header: 'Cambiar nombre',
        mode: 'ios',
        inputs: [{ name: 'name', type: 'text', value: zone.Name }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ok',
            handler: (data: any) => {
              zone.Name = data.name.trim();
              this.zoneChanges[zone.ZoneNumber] = {
                ZoneNumber: zone.ZoneNumber,
                Name: zone.Name,
              };
              this.noSavedChanges = true;
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  /**
   * Sends changes to backend.
   */
  changeNames() {
    if (this.zoneChanges.length > 0) {
      this.changesLoading = true;
      const zonesWithoutNulls = this.zoneChanges.filter(
        (zones) => zones !== null
      );
      this.zonesService.updateName(zonesWithoutNulls).subscribe(
        (res: ResponseDTO | any) => {
          this.changesLoading = false;
          if (res && res.Code == 0) {
            this.alertService.presentToast('Cambios guardados correctamente');
            this.zoneChanges = [];
            this.noSavedChanges = false;
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
        (err: any) => {
          this.changesLoading = false;
          if (err && err.Code === 401) {
            // 401: Unauthorized
            this.authService.onPasswordChanged();
          } else {
            let msg = '';
            if (typeof err === 'string') {
              msg = err;
            } else {
              msg = 'Ocurrió un error al guardar los cambios';
            }
            this.alertService.alertToast(msg);
          }
        }
      );
    } else {
      this.alertService.alertToast('No existen cambios');
    }
  }

  /**
   * Fired when "update" button is clicked.
   */
  onGetStatus() {
    this.getZonesList();
  }

  //#region Zones Color
  /**
   * Asings zone color based on status.
   */
  getZoneColor(zone: ZoneDTO) {
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
   * Creates an interval of 1 second which alternates zone color between yellow and red
   */
  setColorBlink(zone: ZoneDTO) {
    zone.Color = 'warning';
    return setInterval(() => {
      zone.Color = zone.Color == 'warning' ? 'danger' : 'warning';
      this.chRef.detectChanges();
    }, 1000);
  }

  /**
   * Destroys the blinking zones intervals
   */
  private clearBlinkIntervals() {
    this.blinkIntervals.forEach((bi) => clearInterval(bi.interval));
  }
  //#endregion Zones Color

  /**
   * Obtains zones from backend
   */
  getZonesList() {
    this.loading = true;
    this.zonePages = [];
    this.zoneChanges = [];
    this.clearBlinkIntervals();
    this.blinkIntervals = [];
    this.chRef.detectChanges();
    this.zonesService.getList().subscribe(
      (res: ZonesResponseDTO | any) => {
        this.loading = false;
        if (res && res.Code == 0) {
          const zones = res.Zones.sort(
            (a: { ZoneNumber: number }, b: { ZoneNumber: number }) =>
              a.ZoneNumber > b.ZoneNumber ? 1 : -1
          ); // Orders zones by Zone Number

          zones.forEach((zone: ZoneDTO) => {
            // Iterates every zone for assigning colors
            zone.Color = this.getZoneColor(zone);
            if (zone.Color == 'blink') {
              this.blinkIntervals.push(this.setColorBlink(zone));
            }
          });
          // console.log(this.zonesService.toList(zones, 8));
          this.zonePages = this.zonesService.toList(zones, this.zonesPerPage);
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
      },
      (err: any) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          let msg = '';
          if (typeof err === 'string') {
            msg = err;
          } else {
            msg = 'Ocurrió un error al cargar las zonas';
          }
          this.alertService.alertToast(msg);
        }
      }
    );
  }

  ionViewWillLeave() {
    this.clearBlinkIntervals();
  }

  ngOnDestroy() {
    this.clearBlinkIntervals();
  }

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
