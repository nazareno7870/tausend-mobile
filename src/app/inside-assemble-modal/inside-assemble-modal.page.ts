import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { AppService } from '../services/app.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-inside-assemble-modal',
  templateUrl: './inside-assemble-modal.page.html',
  styleUrls: ['./inside-assemble-modal.page.scss'],
})
export class InsideAssembleModalPage implements OnInit {
  constructor(
    public modalController: ModalController,
    private appService: AppService,
    private alertService: AlertService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

  async onDayArmAlarm() {
    const loading = await this.loadingController.create({
      message: 'Aguarde',
    });

    await loading.present();

    this.appService.dayArmAlarm().subscribe(
      (data: any) => {
        if (data && data.Code == 0) {
          if (data.Text) {
            if (data.Text == 'ERROR') {
              this.alertService.alertToast('ERROR');
            } else {
              let msg = this.getStatusMsg(data.Text);
              this.alertService.presentToast(msg);
            }
          } else {
            this.alertService.alertToast('Error ejecutando el comando.');
          }
        } else {
          this.alertService.alertToast(
            'Ocurrió un error ejecutando el comando, por favor intente nuevamente.'
          );
        }
        loading.dismiss();
        this.modalController.dismiss();
      },
      (error: any) => {
        this.alertService.alertToast(error);
        loading.dismiss();
        this.modalController.dismiss();
      }
    );
  }

  async onNightArmAlarm() {
    const loading = await this.loadingController.create({
      message: 'Aguarde',
    });

    await loading.present();

    this.appService.nightArmAlarm().subscribe(
      (data: any) => {
        if (data && data.Code == 0) {
          if (data.Text) {
            if (data.Text == 'ERROR') {
              this.alertService.alertToast('ERROR');
            } else {
              let msg = this.getStatusMsg(data.Text);
              this.alertService.presentToast(msg);
            }
          } else {
            this.alertService.alertToast('Error ejecutando el comando.');
          }
        } else {
          this.alertService.alertToast(
            'Ocurrió un error ejecutando el comando, por favor intente nuevamente.'
          );
        }
        loading.dismiss();
        this.modalController.dismiss();
      },
      (error: any) => {
        this.alertService.alertToast(error);
        loading.dismiss();
        this.modalController.dismiss();
      }
    );
  }

  getStatusMsg(text: string): string {
    let s: string = '';

    /*
      READY - Alarma desarmada lista para armar(zonas OK)
      NOT-READY - Desarmada pero no lista para armar (porque tiene zonas abiertas)
      ARM - Alarma armada
      STAY - Alarma armada en modo presente total(modo día)
      NIGHT - Alarma armada en modo presente parcial(modo noche)
      AWAY - Alarma armada en modo ausente
      NDLY - Alarma armada sin demora de entrada
      BELL - Campana(o sirena) sonando
      BYPASS - Hay zonas excluidas
      MEMO - Hay zonas en memoria(zonas que dispararon evento estando armada)
      READY,BYPASS - Desarmada lista para armar con zonas anuladas
      ARM,AWAY,BYPASS - Armada ausente con zonas anuladas (similar para los modos presente)
      ARM,AWAY - Armada ausente sin zonas anuladas (similar para los modos presente)
    */

    let splitted = text.split(',');
    for (let index = 0; index < splitted.length; index++) {
      const element = splitted[index];

      if (element == 'OK') {
        s += ' OK,';
      }
      if (element == 'READY') {
        s += ' Lista para armar,';
      }
      if (element == 'NOT-READY') {
        s += ' Desarmada pero no lista (zonas abiertas),';
      }
      if (element == 'ARM') {
        s += ' Armada,';
      }
      if (element == 'STAY') {
        s += ' Armada (modo día),';
      }
      if (element == 'NIGHT') {
        s += ' Armada (modo noche),';
      }
      if (element == 'AWAY') {
        s += ' Armada (modo ausente),';
      }
      if (element == 'NDLY') {
        s += ' Armada sin demora en entrada,';
      }
      if (element == 'BELL') {
        s += ' Sirena sonando,';
      }
      if (element == 'BYPASS') {
        s += ' Hay zonas excluidas,';
      }
      if (element == 'MEMO') {
        s += ' Zonas que dispararon evento,';
      }
      if (element == '') {
        s += 'La alarma no responde intente de nuevo,';
      }
    }
    let lastChar = s.slice(s.length - 1);
    if (lastChar == ',') {
      let ss = '';
      ss = s.slice(0, s.length - 1);
      return ss;
    } else {
      return s;
    }
  }
}
