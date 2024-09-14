import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { AlertService } from '../services/alert.service';
import {
  ScheduleDTO,
  ScheduleMiniDTO,
  ScheduleResponseDTO,
} from '../models/DTOs/scheduled-departuresDTO';
import { ScheduledDeparturesService } from '../services/scheduled-departures.service';
import { ResponseDTO } from '../models/DTOs/responseDTO';
import { AuthService } from '../services/auth.service';
import { Storage } from '@ionic/storage';
import { SmsService } from '../services/sms.service';

@Component({
  selector: 'app-scheduled-departures',
  templateUrl: 'scheduled-departures.page.html',
  styleUrls: ['scheduled-departures.page.scss'],
})
export class ScheduledDeparturesPage implements OnInit {
  scheduledDepartures: ScheduleDTO[] = [];
  centralSelected: string = '';
  sms: boolean = false;

  constructor(
    private loadingController: LoadingController,
    private alertService: AlertService,
    private alertController: AlertController,
    private scheduleService: ScheduledDeparturesService,
    private authService: AuthService,
    private storage: Storage,
    private smsService: SmsService
  ) {}

  ngOnInit() {
    this.scheduledDepartures = [];
  }

  ionViewWillEnter() {
    this.getCentralSelected();
  }

  /**
   * Get equipo selected
   */
  private getCentralSelected() {
    this.storage.get('currentUser').then((user) => {
      if (user.isSMS) {
        this.sms = true;
        this.centralSelected =
          user.SMSDevices &&
          user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0]
            .Description;
      } else {
        this.sms = false;
        this.centralSelected =
          user.Devices &&
          user.Devices[user.DeviceSelected ? user.DeviceSelected : 0]
            .Description;
        this.loadSchedule();
      }
    });
  }

  /**
   * Gets scheduled-departures from backend
   */
  async loadSchedule() {
    this.scheduledDepartures = [];
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.scheduleService.get().subscribe(
      (res: ScheduleResponseDTO | any) => {
        if (res && res.Code == 0) {
          this.scheduledDepartures = res.ProgramControls.sort(
            (
              a: { ProgramControlNumber: number },
              b: { ProgramControlNumber: number }
            ) => (a.ProgramControlNumber > b.ProgramControlNumber ? 1 : -1)
          );
          this.scheduledDepartures.forEach(
            (sch) => (sch.Color = sch.Activated ? 'danger' : 'primary')
          );
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al cargar las salidas programadas, por favor intente nuevamente'
          );
        }
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al cargar las salidas programadas, por favor intente nuevamente'
          );
        }
      }
    );
  }

  /**
   * Fired when user clicks a schedule button.
   * Displays an pop up with 2 options
   */
  onClick(schedule: ScheduleDTO) {
    const changeStatusLabel = schedule.Activated
      ? 'Desactivar salida'
      : 'Activar salida';
    this.alertController
      .create({
        header: 'Seleccionar acción',
        mode: 'ios',
        inputs: [
          {
            name: 'status',
            type: 'radio',
            label: changeStatusLabel,
            value: 'status',
          },
          {
            name: 'name',
            type: 'radio',
            label: 'Cambiar nombre',
            value: 'name',
          },
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ok',
            handler: (data: string) => {
              switch (data) {
                case 'status':
                  this.changeStatus(schedule);
                  break;
                case 'name':
                  this.showNameAlert(schedule);
                  break;
              }
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  /**
   * Shows a pop up to user for change scheduled-departure name
   */
  public showNameAlert(schedule: ScheduleDTO) {
    this.alertController
      .create({
        header: 'Cambiar nombre',
        mode: 'ios',
        inputs: [{ name: 'name', type: 'text', value: schedule.Name }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ok',
            handler: (data: any) => this.changeName(schedule, data.name.trim()),
          },
        ],
      })
      .then((alert) => alert.present());
  }

  /**
   * Changes scheduled-departure name
   */
  private async changeName(schedule: ScheduleDTO, name: string) {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    const body: ScheduleMiniDTO = {
      Name: name,
      ProgramControlNumber: schedule.ProgramControlNumber,
    };
    this.scheduleService.changeName(body).subscribe(
      (res: ResponseDTO | any) => {
        if (res && res.Code == 0) {
          schedule.Name = name;
          this.alertService.presentToast('Cambio guardado correctamente');
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar el cambio, por favor intente nuevamente'
          );
        }
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar el cambio, por favor intente nuevamente'
          );
        }
      }
    );
  }

  /**
   * Changes scheduled-departure status
   */
  public async changeStatus(schedule: ScheduleDTO) {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.scheduleService.changeStatus(schedule).subscribe(
      (res: ScheduleResponseDTO | any) => {
        if (res && res.Code == 0) {
          const newState = res.ProgramControls[0].Activated;
          if (newState != schedule.Activated) {
            schedule.Activated = res.ProgramControls[0].Activated;
            schedule.Color = schedule.Activated ? 'danger' : 'primary';
            this.alertService.presentToast('Cambio guardado correctamente');
          } else {
            this.alertService.alertToast(
              'Esta salida no se encuentra configurada'
            );
          }
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar el cambio, por favor intente nuevamente'
          );
        }
        loading.dismiss();
      },
      (err: any) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            'Ocurrió un error al guardar el cambio, por favor intente nuevamente'
          );
        }
      }
    );
  }

  smsSchedule(schedule: any) {
    this.smsService.scheduledDepartures(schedule.ProgramControlId);
  }

  smsScheduledDepartures = [
    {
      Activated: false,
      Name: '1',
      ProgramControlId: 1,
      ProgramControlNumber: 1,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '2',
      ProgramControlId: 2,
      ProgramControlNumber: 2,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '3',
      ProgramControlId: 3,
      ProgramControlNumber: 3,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '4',
      ProgramControlId: 4,
      ProgramControlNumber: 4,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '5',
      ProgramControlId: 5,
      ProgramControlNumber: 5,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '6',
      ProgramControlId: 6,
      ProgramControlNumber: 6,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '7',
      ProgramControlId: 7,
      ProgramControlNumber: 7,
      Color: 'primary',
    },
    {
      Activated: false,
      Name: '8',
      ProgramControlId: 8,
      ProgramControlNumber: 8,
      Color: 'primary',
    },
  ];
}
