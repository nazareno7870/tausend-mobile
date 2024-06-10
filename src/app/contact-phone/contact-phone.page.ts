import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { SmsService } from '../services/sms.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-contact-phone',
  templateUrl: './contact-phone.page.html',
  styleUrls: ['./contact-phone.page.scss'],
})
export class ContactPhonePage implements OnInit {
  showPassword: boolean = false;
  passwordToggleIcon: string = 'eye';
  public orderNumber: number | null | string = null;
  public orderNumberOk: boolean = false;
  public numberPhone: number | null = null;
  public numberPhoneOk: boolean = false;
  public typeForm: string = 'write';
  centralSelected: string = '';

  constructor(
    private alertService: AlertService,
    private smsService: SmsService,
    private storage: Storage
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getCentralSelected();
  }

  /**
   * Get central selected
   */
  private getCentralSelected() {
    this.storage.get('currentUser').then((user) => {
      this.centralSelected =
        user.SMSDevices &&
        user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0]
          .Description;
    });
  }

  onClick(type: string) {
    this.typeForm = type;
    if (type == 'read' || type == 'delete') {
      this.numberPhone = null;
      this.numberPhoneOk = false;
    }
  }

  changeOrder(number: string) {
    if (number == '0') {
      this.orderNumber = null;
      this.orderNumberOk = false;
      return null;
    }

    if (Number(number) >= 1 && Number(number) <= 16) {
      this.orderNumber = number;
      this.orderNumberOk = true;
      return number;
    } else {
      this.orderNumber = null;
      this.orderNumberOk = false;
      return null;
    }
  }

  changeNumber(number: number) {
    let regex = new RegExp('^[0-9]{10,16}$');
    if (regex.test(number.toString())) {
      this.numberPhone = Number(number);
      this.numberPhoneOk = true;
      return number;
    } else {
      this.numberPhone = Number(number);
      this.numberPhoneOk = false;
      return number;
    }
  }

  sendSMS() {
    if (this.typeForm == 'write') {
      if (this.orderNumberOk && this.numberPhoneOk) {
        this.smsService.createContactNumber(
          Number(this.orderNumber),
          this.numberPhone ? this.numberPhone.toString() : ''
        );
      } else if (!this.orderNumberOk) {
        this.alertService.alertToast('Ingrese un número de orden válido');
      } else if (!this.numberPhoneOk) {
        this.alertService.alertToast('Ingrese un número de teléfono válido');
      } else {
        this.alertService.alertToast(
          'Ingrese un número de orden y teléfono válido'
        );
      }
    } else if (this.typeForm == 'read') {
      if (this.orderNumberOk) {
        this.smsService.readContactNumber(Number(this.orderNumber));
      } else {
        this.alertService.alertToast('Ingrese un número de orden válido');
      }
    } else if (this.typeForm == 'delete') {
      if (this.orderNumberOk) {
        this.smsService.deleteContactNumber(Number(this.orderNumber));
      } else {
        this.alertService.alertToast('Ingrese un número de orden válido');
      }
    }
  }
}
