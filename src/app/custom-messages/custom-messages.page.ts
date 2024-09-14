import { Component, OnInit } from "@angular/core";
import { AlertService } from "../services/alert.service";
import { SmsService } from "../services/sms.service";
import { Storage } from "@ionic/storage";

@Component({
  selector: "app-custom-messages",
  templateUrl: "./custom-messages.page.html",
  styleUrls: ["./custom-messages.page.scss"],
})
export class CustomMessagesPage implements OnInit {
  showPassword: boolean = false;
  passwordToggleIcon: string = "eye";
  public orderNumber: string = "";
  public orderNumberOk: boolean = false;
  public textMessage: string = "";
  public textMessageOk: boolean = false;
  public typeForm: string = "read";
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
  onClick(type: string) {
    this.typeForm = type;
    if (type == "read") {
      this.textMessage = "";
      this.textMessageOk = false;
    }
  }

  changeOrder(number : string) {
    if (Number(number) >= 51 && Number(number) <= 70) {
      this.orderNumber = number;
      this.orderNumberOk = true;
      return number;
    } else {
      this.orderNumber = "";
      this.orderNumberOk = false;
      return "";
    }
  }

  changeText(text: string) {
    if (text.length >= 1 || text.length <= 50) {
      this.textMessage = text;
      this.textMessageOk = true;
      return text;
    } else {
      this.textMessage = "";
      this.textMessageOk = false;
      return "";
    }
  }

  sendSMS() {
    if (this.typeForm == "read") {
      if (this.orderNumberOk) {
        this.smsService.readMessage(Number(this.orderNumber));
      } else {
        this.alertService.alertToast("Ingrese un número de mensaje válido");
      }
    } else if (this.typeForm == "write") {
      if (this.orderNumberOk && this.textMessageOk) {
        this.smsService.createMessage(
          Number(this.orderNumber),
          this.textMessage
        );
      } else if (!this.orderNumberOk) {
        this.alertService.alertToast("Ingrese un número de mensaje válido");
      } else if (!this.textMessageOk) {
        this.alertService.alertToast("Ingrese un mensaje válido");
      } else {
        this.alertService.alertToast(
          "Ingrese un número de mensaje y texto válido"
        );
      }
    }
  }
}
