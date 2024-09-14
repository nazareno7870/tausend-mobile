import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ZoneDTO, ZonesResponseDTO } from '../models/DTOs/zonesDTO';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { ZonesService } from '../services/zones.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.page.html',
  styleUrls: ['./memory.page.scss'],
})
export class MemoryPage implements OnInit {
  private zonesPerPage = 8;

  loading = false;
  memoryPages: ZoneDTO[][] = [];
  blinkIntervals: any[] = [];
  centralSelected: '' = '';

  constructor(
    private zonesService: ZonesService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private navCtrl: NavController,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.memoryPages = [];
    this.blinkIntervals = [];
  }

  ionViewWillEnter() {
    this.memoryPages = [];
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
   * Fired when "refresh" button is clicked.
   */
  onGetStatus() {
    this.getZonesList();
  }

  /**
   * Gets all the zones with "memory"
   */
  getZonesList() {
    // re initialize all the variables
    this.loading = true;
    this.memoryPages = [];
    this.blinkIntervals.forEach((item) => clearInterval(item));
    this.blinkIntervals = [];
    this.chRef.detectChanges();
    this.zonesService.getMemory().subscribe(
      (res: ZonesResponseDTO | any) => {
        this.loading = false;
        if (res && res.Code == 0) {
          // Sort zones by zone number
          const zones = res.Zones.sort((a: any, b: any) =>
            a.ZoneNumber > b.ZoneNumber ? 1 : -1
          );
          // Iterates every zone and assigns color
          zones.forEach((zone: ZoneDTO) => {
            zone.Color = zone.Open ? 'blink' : 'warning';
            if (zone.Color == 'blink') {
              this.blinkIntervals.push(this.setColorBlink(zone));
            }
          });

          this.memoryPages = this.zonesService.toList(zones, this.zonesPerPage);
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

  /**
   * Creates and returns an interval for zone color alternating between red and yellow
   */
  private setColorBlink(zone: ZoneDTO) {
    zone.Color = 'warning';
    return setInterval(() => {
      zone.Color = zone.Color == 'warning' ? 'danger' : 'warning';
      this.chRef.detectChanges();
    }, 1000);
  }

  /**
   * Fired when user clicks "back" button.
   * Returns to previous page.
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
   * Clears all the blinking intervals.
   */
  private onLeave() {
    this.blinkIntervals.forEach((bi) => clearInterval(bi.interval));
  }
}
