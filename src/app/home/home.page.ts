import {
  ChangeDetectorRef,
  Component,
  ViewChild,
} from "@angular/core";
import {
  ModalController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { AppService } from "../services/app.service";
import { AlertService } from "../services/alert.service";
import { SocialSharing } from "@awesome-cordova-plugins/social-sharing/ngx";
import { Geolocation } from "@awesome-cordova-plugins/geolocation/ngx";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Storage } from "@ionic/storage";
import { SmsService } from "./../services/sms.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  alarmStatus: string = "";
  arrStatus: {
    type: string;
    icon: string;
    action: string;
    color: string;
    msg: string;
    order?: number;
  }[] = []; // Bigger icon
  arrInfo: {
    type: string;
    icon: string;
    action: string;
    color: string;
    msg: string;
    order: number;
  }[] = []; // Small icons (memory, exclusions, errors)
  bellBlink: any;
  centralSelected: "" = "";
  bellCount: number = 0;
  bellImage: number = 0;
  statusLoading: boolean = false;
  // timerSubscription;
  private reloadInterval: any;
  @ViewChild("statusGrid", { static: false }) statusGrid: any;
  private retrys: number = 0;
  sms = false;
  public changeButton: boolean = false;

  constructor(
    public modalController: ModalController,
    private appService: AppService,
    private alertService: AlertService,
    private loadingController: LoadingController,
    private socialSharing: SocialSharing,
    private geolocation: Geolocation,
    private router: Router,
    private alertController: AlertController,
    private chRef: ChangeDetectorRef,
    private authService: AuthService,
    private storage: Storage,
    private smsService: SmsService
  ) {}

  ngOnInit() {
    this.arrStatus = [];
    this.arrInfo = [];
    this.retrys = 0;
  }

  ionViewWillEnter() {
    this.retrys = 0;
    this.getCentralSelected();
  }

  private startTimer() {
    this.reloadInterval = setInterval(() => this.getStatus(), 30000);
  }
  private clearTimer() {
    if (this.reloadInterval) clearInterval(this.reloadInterval);
  }
  private restartTimer() {
    if (!this.sms) {
      this.clearTimer();
      this.startTimer();
    }
  }

  /**
   * Exec backend requests and manage response
   */
  private async execRequest(request: Observable<any>) {
    const loading = await this.loadingController.create({ message: "Aguarde" });
    await loading.present();
    request.subscribe(
      (data: any) => {
        if (data && data.Code == 0) {
          if (data.Text) {
            // if text is "", the alarm does not respond
            if (data.Text == "ERROR") {
              this.alertService.alertToast("ERROR");
              setTimeout(() => {
                this.getStatus();
              }, 200);
            } else {
              let msg = this.getStatusMsg(data.Text);
              this.alertService.presentToast(msg);
              if (
                msg == "OK" ||
                msg == "" ||
                msg == "Comando enviado correctamente"
              ) {
                this.getStatus();
              }
            }
          } else {
            this.alertService.alertToast(
              "La alarma no responde, por favor intente nuevamente."
            );
          }
        } else if (data.Code === 6) {
          this.alertService.alertToast(
            "La alarma no responde, por favor intente nuevamente."
          );
        } else {
          this.alertService.alertToast(
            "Ocurrió un error ejecutando el comando, por favor intente nuevamente. Código de error: " +
              data.Code
          );
        }
        loading.dismiss();
      },
      (err: any) => {
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(err);
          this.getStatus();
        }
        loading.dismiss();
      }
    );
  }

  /**
   * Arms alarm
   */
  async onArmAlarm() {
    this.changeButton = false;
    const request = this.appService.armAlarm();
    this.execRequest(request);
  }

  /**
   * Arms the alarm in "day" mode
   */
  async onDayArmAlarm() {
    this.changeButton = false;
    const request = this.appService.dayArmAlarm();
    this.execRequest(request);
  }

  /**
   * Arms alarm in "night" mode
   */
  async onNightArmAlarm() {
    this.changeButton = false;
    const request = this.appService.nightArmAlarm();
    this.execRequest(request);
  }

  /**
   * Disarms alarm
   */
  async onDisarmAlarm() {
    this.changeButton = false;
    const request = this.appService.disarmAlarm();
    this.execRequest(request);
  }

  /**
   * Fired when "panic" button is clicked
   */
  async onPanic() {
    this.changeButton = false;
    const request = this.appService.panic();
    this.execRequest(request);
  }

  /**
   * Fired when "assault" button is clicked
   */
  async onAssault() {
    this.changeButton = false;
    const request = this.appService.assault();
    this.execRequest(request);
  }

  /**
   * Fired when "emergency" button is clicked
   */
  async onEmergency() {
    this.changeButton = false;
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        // https://www.google.com/maps/place/latitude,longitude
        // resp.coords.latitude
        // resp.coords.longitude
        let url = `https://www.google.com/maps/place/${resp.coords.latitude},${resp.coords.longitude}`;
        this.socialSharing
          .share(
            "⚠️🆘⚠️ \n\nTengo una emergencia! \n\nÉste es un mensaje automático enviado desde la *APP Alarmas Tausend IP* \n\nToca en el link para ver mi ubicación:",
            "",
            undefined,
            url
          )
          .then(() => {
            // Success!
          })
          .catch((e) => {
            // Error!
            console.log("Error sharing", e);
            this.alertService.alertToast(
              "Se produjo un error al intentar compartir. Por favor revise los permisos."
            );
          });
      })
      .catch((error) => {
        console.log("Error getting location", error);
        this.alertService.alertToast(
          "Se produjo un error al compartir ubicación. Por favor revise los permisos."
        );
      });

    const request = this.appService.emergency();
    this.execRequest(request);
  }

  /**
   * Firen when "refresh" button is clicked
   */
  onGetStatus() {
    this.getStatus();
  }

  /**
   * Fired when a status button is clicked.
   * Executes an action acording to button.
   */
  onAction(action: string) {
    switch (action) {
      case "arm":
        // this.confirmArm();
        this.changeButton = !this.changeButton;
        break;
      case "disarm":
        this.confirmDisarm();
        break;
      case "refresh":
        this.getStatus();
        break;
      default:
        if (action && action[0] == "/") {
          this.router.navigate([action]);
        }
        break;
    }
  }

  /**
   * Presents an alert when user selects "disarm" action.
   */
  private confirmDisarm() {
    this.alertController
      .create({
        header: "Desea desarmar la alarma?",
        mode: "ios",
        buttons: [
          { text: "Cancelar", role: "cancel" },
          {
            text: "Ok",
            handler: () => {
              this.onDisarmAlarm();
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  /**
   * Presents an alert which allows user to select the "arm" type.
   */
  private confirmArm() {
    this.alertController
      .create({
        header: "Qué tipo de armado desea?",
        mode: "ios",
        inputs: [
          {
            name: "absent",
            type: "radio",
            label: "Armado ausente",
            value: "absent",
          },
          {
            name: "day",
            type: "radio",
            label: "Armado presente día",
            value: "day",
          },
          {
            name: "night",
            type: "radio",
            label: "Armado presente noche",
            value: "night",
          },
        ],
        buttons: [
          { text: "Cancelar", role: "cancel" },
          {
            text: "Ok",
            handler: (data: string) => {
              switch (data) {
                case "absent":
                  this.onArmAlarm();
                  break;
                case "day":
                  this.onDayArmAlarm();
                  break;
                case "night":
                  this.onNightArmAlarm();
                  break;
              }
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  /**
   * Gets alarm status from backend
   */
  getStatus() {
    if (!this.changeButton) {
      this.alarmStatus = "";
      this.arrStatus = [];
      this.arrInfo = [];
      this.statusLoading = true;
      this.restartTimer();
      this.appService.getGeneralStatus().subscribe(
        (data) => {
          if (data && data.Code == 0) {
            if (data.Text == "ERROR") {
              this.alertService.alertToast("ERROR");
              this.statusLoading = false;
            } else {
              this.alarmStatus = this.getStatusMsg(data.Text);
              if (
                this.alarmStatus == "La alarma no responde, intente de nuevo" &&
                this.retrys <= 3
              ) {
                this.retrys += 1;
                setTimeout(() => {
                  this.getStatus();
                }, 200);
              } else {
                this.retrys = 0;
                this.statusLoading = false;
              }
            }
          }
          // else {
          //   this.alertService.alertToast("Ocurrió un error ejecutando el comando, por favor intente nuevamente.");
          // }
        },
        (error) => {
          if (error && error.Code === 401) {
            this.authService.onPasswordChanged();
          } else {
            if (typeof error == "string") {
              this.alertService.alertToast(error);
            }
            this.statusLoading = false;
          }
        }
      );
    }

    // // Updates status every 30"
    // if (this.timerSubscription) {
    //   // Do nothing. Already working
    // } else {
    //   this.timerSubscription = timer(30000).subscribe(() => {
    //     this.getStatus();
    //   });
    // }
  }

  /**
   * Interprets the status recived from backend.
   * - READY - Alarma desarmada lista para armar(zonas OK)
   * - NOT-READY - Desarmada pero no lista para armar (porque tiene zonas abiertas)
   * - ARM - Alarma armada
   * - STAY - Alarma armada en modo presente total(modo día)
   * - NIGHT - Alarma armada en modo presente parcial(modo noche)
   * - AWAY - Alarma armada en modo ausente
   * - NDLY - Alarma armada sin demora de entrada
   * - BELL - Campana(o sirena) sonando
   * - BYPASS - Hay zonas excluidas
   * - MEMO - Hay zonas en memoria(zonas que dispararon evento estando armada)
   * - READY,BYPASS - Desarmada lista para armar con zonas anuladas
   * - ARM,AWAY,BYPASS - Armada ausente con zonas anuladas (similar para los modos presente)
   * - ARM,AWAY - Armada ausente sin zonas anuladas (similar para los modos presente)
   */
  getStatusMsg(text: string): string {
    this.arrStatus = [];
    this.arrInfo = [];

    const statusText:any = {
      OK: "Comando enviado correctamente",
      READY: "Lista para armar",
      "NOT-READY": "Desarmada pero no lista (zonas abiertas)",
      ARM: "Armada",
      STAY: "Armada (modo día)",
      NIGHT: "Armada (modo noche)",
      AWAY: "Armada (modo ausente)",
      NDLY: "Armada sin demora en entrada",
      BELL: "Sirena sonando",
      BYPASS: "Exclusiones",
      MEMO: "Memoria",
      FAIL: "Fallas",
    };

    let res: string;

    const splitted = text.split(",");
    if (splitted[0] == "") {
      res = "La alarma no responde, intente de nuevo";
    } else {
      res = splitted.map((txt) => statusText[txt]).join(", ");
    }

    splitted.forEach((txt) => {
      const icon = {
        type: "status",
        icon: "",
        color: "",
        action: "",
        msg: txt ? statusText[txt ] : res,
        order: 0,
      };
      switch (txt) {
        case "READY":
          Object.assign(icon, {
            icon: "lock_open",
            color: "success",
            action: "arm",
          });
          break;
        case "NOT-READY":
          Object.assign(icon, {
            icon: "lock_open",
            color: "medium",
            action: "/exclusions",
          });
          break;
        case "STAY":
          Object.assign(icon, {
            icon: "wb_sunny",
            color: "danger",
            action: "disarm",
          });
          break;
        case "NIGHT":
          Object.assign(icon, {
            icon: "nights_stay",
            color: "danger",
            action: "disarm",
          });
          break;
        case "AWAY":
          Object.assign(icon, {
            icon: "house",
            color: "danger",
            action: "disarm",
          });
          break;
        case "BYPASS":
          Object.assign(icon, {
            type: "info",
            icon: "browser_not_supported",
            color: "medium",
            action: "/exclusions",
            order: 1,
          });
          break;
        case "MEMO":
          Object.assign(icon, {
            type: "info",
            icon: "memory",
            color: "medium",
            action: "/memory",
            order: 0,
          });
          break;
        case "FAIL":
          Object.assign(icon, {
            type: "info",
            icon: "error_outline",
            color: "medium",
            action: "/failures",
            order: 2,
          });
          break;
        case "":
          Object.assign(icon, {
            icon: "refresh",
            color: "medium",
            action: "refresh",
          });
          break;
      }

      if (icon.icon) {
        if (icon.type == "info") {
          this.arrInfo.push(icon);
        } else {
          this.arrStatus.push(icon);
        }
      }
    });

    //#region BELL ICON
    this.clearBlink();
    if (splitted.includes("BELL")) {
      let modeStr: string;
      if (splitted.includes("ARM")) {
        modeStr = "(" + this.arrStatus[0].msg.split("(")[1];
      } else {
        // modeStr = `(${this.arrStatus[0].msg.toLowerCase()})`;
        modeStr = "(alarma desarmada)";
      }

      // console.log(this.arrStatus[0].msg);

      const bellIcon = {
        type: "status",
        action: "disarm",
        color: "warning",
        icon: "notifications_active",
        msg: "Sirena sonando " + modeStr,
      };
      this.assingBlink(bellIcon);
      this.arrStatus = [bellIcon];
    }
    //#endregion BELL ICON

    this.arrInfo = this.arrInfo.sort((a, b) => (a.order > b.order ? 1 : -1)); // Orders info icons

    if (this.arrInfo.length == 3) {
      this.statusGrid.el.classList.add("status-grid-full");
    } else {
      this.statusGrid.el.classList.remove("status-grid-full");
    }

    this.chRef.detectChanges();
    return res;
  }

  /**
   * Asigns blinking colors interval to bell icon.
   */
  private assingBlink(icon : any) {
    this.bellBlink = setInterval(() => {
      this.bellImage = Math.round(this.bellCount % 4);
      this.bellCount += 1;
    }, 250);
  }

  /**
   * Removes bell's blinking interval
   */
  private clearBlink() {
    if (this.bellBlink) {
      clearInterval(this.bellBlink);
    }
  }

  /**
   * Get equipo selected
   */
  private getCentralSelected() {
    this.storage.get("currentUser").then((user) => {
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
        this.getStatus();
        this.restartTimer();
      }
    });
  }

  ionViewWillLeave() {
    // if (this.timerSubscription) {
    //   this.timerSubscription.unsubscribe();
    // }
    this.clearTimer();
    this.clearBlink();
  }

  ngOnDestroy() {
    // if (this.timerSubscription) {
    //   this.timerSubscription.unsubscribe();
    // }
    this.clearTimer();
    this.clearBlink();
  }

  smsArmAlarmAbsent() {
    this.smsService.armAlarmAbsent();
  }

  smsArmAlarmDay() {
    this.smsService.armAlarmDay();
  }

  smsArmAlarmNight() {
    this.smsService.armAlarmNight();
  }

  smsDisarmAlarm() {
    this.smsService.disarmAlarm();
  }

  smsStatus() {
    this.smsService.status();
  }

  smsPanic() {
    this.smsService.panic();
  }

  smsSilentAssault() {
    this.smsService.silentAssault();
  }

  smsEmergency() {
    this.smsService.emergency();
  }
}
