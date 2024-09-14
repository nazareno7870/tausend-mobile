import { Component, OnInit } from "@angular/core";
import { DeviceTimeDTO } from "../models/DTOs/deviceTimeDTO";
import { AlertService } from "../services/alert.service";
import { AuthService } from "../services/auth.service";
import { DeviceService } from "../services/device.service";
import { Storage } from "@ionic/storage";

@Component({
  selector: "app-clock",
  templateUrl: "./clock.page.html",
  styleUrls: ["./clock.page.scss"],
})
export class ClockPage implements OnInit {
  loading: boolean = false;
  currentTime: string = "";
  deviceTime: string = "";
  centralSelected: "" = "";

  constructor(
    private deviceService: DeviceService,
    private alertService: AlertService,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loading = false;
    this.getDeviceTime();
    this.getCentralSelected();
  }

  /**
   * Get equipo selected
   */
  private getCentralSelected() {
    this.storage.get("currentUser").then((user) => {
      this.centralSelected = user && user.Devices && user.Devices[user.DeviceSelected ? user.DeviceSelected : 0] && user.Devices[user.DeviceSelected ? user.DeviceSelected : 0].Description;
    });
  }

  /**
   * Fired when user enters in this page, or when "refresh" button is clicked.
   * Obtains device time from backend.
   */
  getDeviceTime() {
    this.loading = true;
    this.deviceService.getTime().subscribe(
      (res: DeviceTimeDTO | any) => {
        this.manageResponse(res);
      },
      (err) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            "Ocurrió un error actualizar, por favor intente nuevamente."
          );
        }
      }
    );
  }

  /**
   * Calls backend method to sync device time
   */
  syncTime() {
    this.loading = true;
    this.deviceService.syncTime().subscribe(
      (res: DeviceTimeDTO | any) => {
        this.manageResponse(res);
      },
      (err) => {
        this.loading = false;
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            "Ocurrió un error actualizar, por favor intente nuevamente."
          );
        }
      }
    );
  }

  /**
   * Manages backend response. Calls "this.formatTime" if successs, shows alert if error.
   */
  private manageResponse(res: DeviceTimeDTO) {
    if (res.Code == 0) {
      this.deviceTime = this.formatTime(res.DeviceTime);
      const strCurrentTime = new Date().getTime().toString();
      const strCurrent = `/Date(${strCurrentTime}+0000)/`; // Uses same format as backend
      this.currentTime = this.formatTime(strCurrent, true);
    } else {
      if (res.Code == 6) {
        this.alertService.alertToast(
          "La alarma no responde, por favor intente nuevamente."
        );
      } else {
        this.alertService.alertToast(res.Message);
      }
    }
    this.loading = false;
  }

  /**
   * Converts backend response to visible date
   */
  private formatTime(timeString: string, substract?: boolean) {
    let dateNumber = Number(timeString.split(/[\(,\,+)]+/g)[1]);
    if (substract) {
      dateNumber -= 3 * 60 * 60 * 1000; // substracts 3 hours to convert to Argentina's GMT
    }
    const date = new Date(dateNumber);
    const splitted = date.toISOString().split("T");
    const strDate = splitted[0].split("-").reverse().join("/"); // DD/MM/YYYY
    const strHour = splitted[1].split(".")[0];
    return strDate + " " + strHour;
  }
}
