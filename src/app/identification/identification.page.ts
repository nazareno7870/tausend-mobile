import { Component, OnInit } from "@angular/core";
import { AlertService } from "../services/alert.service";
import { SmsService } from "../services/sms.service";
import { Storage } from "@ionic/storage";

@Component({
  selector: "app-identification",
  templateUrl: "./identification.page.html",
  styleUrls: ["./identification.page.scss"],
})
export class IdentificationPage implements OnInit {
  public identification: string = "";
  public identificationOk: boolean = false;
  centralSelected: string = "";

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
   * Get equipo selected
   */
  private getCentralSelected() {
    this.storage.get("currentUser").then((user) => {
      this.centralSelected =
        user.SMSDevices &&
        user.SMSDevices[user.DeviceSelected ? user.DeviceSelected : 0]
          .Description;
    });
  }

  changeIdentification(text: string) {
    if (text.length > 0) {
      this.identification = text;
      this.identificationOk = true;
      return text;
    } else {
      this.identification = "";
      this.identificationOk = false;
      return "";
    }
  }

  sendSMS() {
    if (this.identificationOk) {
      this.smsService.identification(this.identification);
    } else {
      this.alertService.alertToast("Ingrese un nombre válido");
    }
  }
}
