import { Injectable } from "@angular/core";
import { SMS } from "@awesome-cordova-plugins/sms/ngx";
import { Storage } from "@ionic/storage";
import { environment } from "./../../environments/environment";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SmsService {
  constructor(
    private sms: SMS,
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ) {}

  private options = {
    android: {
      // intent: 'INTENT'  // Opens Default sms app
      intent: "INTENT",
    },
  };


  async getCentralData() {
    return this.storage.get("currentUser").then((user) => {
      const central = user.SMSDevices[user.DeviceSelected];
      return { phone: central.PhoneNumber, pinSim: central.SimPin };
    });
  }

  async armAlarmAbsent() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}ARA*`, this.options);
  }

  async armAlarmDay() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}ARD*`, this.options);
  }

  async armAlarmNight() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}ARN*`, this.options);
  }

  async disarmAlarm() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}DAR*`, this.options);
  }

  async status() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}STS*`, this.options);
  }

  async panic() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}PAN*`, this.options);
  }

  async silentAssault() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}ASA*`, this.options);
  }

  async emergency() {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}MED*`, this.options);
  }

  async exclusions(arrayExclusions: string[]) {
    const { phone, pinSim } = await this.getCentralData();
    const exclusions = arrayExclusions.join(",");
      this.sms.send(phone, `Activar*${pinSim}exc${exclusions}*`, this.options);
  }

  async scheduledDepartures(scheduledDeparture: number) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}PGM${scheduledDeparture}*`, this.options);
  }

  async createContactNumber(zone: number, number: string) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(
        phone,
        `Activar*${pinSim}PRG0${78 + zone}h${number}*`,
        this.options
      );
  }

  async readContactNumber(zone: number) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}PRG0${78 + zone}*`, this.options);
  }

  async deleteContactNumber(zone: number) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}PRG0${78 + zone}hf*`, this.options);
  }

  async readMessage(messageNumber: number) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}SML${messageNumber}*`, this.options);
  }

  async createMessage(messageNumber: number, message: string) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(
        phone,
        `Activar*${pinSim}SMU${messageNumber}${message}*`,
        this.options
      );
  }

  async identification(identification: string) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(phone, `Activar*${pinSim}IDF${identification}*`, this.options);
  }

  async changePasswordSMS(newPassword: string) {
    const { phone, pinSim } = await this.getCentralData();
      this.sms.send(
        phone,
        `Activar*${pinSim}PIN${newPassword}${newPassword}*`,
        this.options
      );
  }

  createDevice({
    description,
    identifier,
    pin,
    phoneNumber,
    pinSMS,
    modelSMS,
  }: {
    description: string;
    identifier: string;
    pin: string;
    phoneNumber: string;
    pinSMS: string;
    modelSMS: string;
  }) {
    if (this.api.online) {
      console.log({
        description,
        identifier,
        pin,
        phoneNumber,
        pinSMS,
        modelSMS,
      });
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            let body = {
              AccessToken: user.AccessToken,
              Description: description,
              Identifier: identifier,
              DevicePin: pin.toString(),
              SimPin: pinSMS.toString(),
              PhoneNumber: phoneNumber,
              DeviceType: modelSMS,
            };
            this.http
              .post<any>(
                `${environment.apiUrl}/Services/DeviceService.svc/CreateDeviceSMS`,
                body
              )
              .subscribe((res: any) => {
                console.log(res);
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("Su dispositivo móvil se encuentra actualmente offline")
      );
    }
  }

  updateDevice({
    idDevice,
    description,
    identifier,
    pin,
    phoneNumber,
    pinSMS,
    modelSMS,
  }: {
    idDevice: number;
    description: string;
    identifier: string;
    pin: string;
    phoneNumber: string;
    pinSMS: string;
    modelSMS: string;
  }) {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            let body = {
              DeviceId: idDevice,
              Description: description,
              Identifier: identifier,
              DevicePin: pin.toString(),
              SimPin: pinSMS.toString(),
              PhoneNumber: phoneNumber,
              DeviceType: modelSMS,
            };
            this.http
              .post<any>(
                `${environment.apiUrl}/Services/DeviceService.svc/UpdateDeviceSMS`,
                body
              )
              .subscribe((res: any) => {
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("No se pudo conectar con el servidor")
      );
    }
  }

  unlinkDevice({
    idDevice,
  }: {
    idDevice: number;

  }) {
    if (this.api.online) {
      return Observable.create((observer : any) => {
        this.storage
          .get("currentUser")
          .then((user) => {
            let body = {
              DeviceId : idDevice,
            };
            this.http
              .post<any>(
                `${environment.apiUrl}/Services/DeviceService.svc/DeleteDeviceSMS`,
                body
              )
              .subscribe((res: any) => {
                if (res.Code === 401) {
                  observer.error(res);
                } else {
                  observer.next(res);
                }
              });
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      return new Observable((obs) =>
        obs.error("No se pudo conectar con el servidor")
      );
    }
  }
}
