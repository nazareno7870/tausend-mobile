import { Component, OnInit } from "@angular/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { ResponseDTO } from "../models/DTOs/responseDTO";
import { AlertService } from "../services/alert.service";
import { AuthService } from "../services/auth.service";
import { CommandsService } from "../services/commands.service";
import { Storage } from "@ionic/storage";
@Component({
  selector: "app-instalator",
  templateUrl: "./instalator.page.html",
  styleUrls: ["./instalator.page.scss"],
})
export class InstalatorPage implements OnInit {
  code: string = "";
  access: boolean = false;
  hasPassword: boolean = false;
  centralSelected: "" = "";
  private installatorPassword: string = "";

  constructor(
    private comService: CommandsService,
    private loadingController: LoadingController,
    private alertService: AlertService,
    private alertController: AlertController,
    private authService: AuthService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.code = "";
  }

  ionViewWillEnter() {
    this.code = "";
    this.access = false;
    this.hasPassword = false;
    this.getInstallatorPassword();
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
   * Gets device password from backend
   */
  private async getInstallatorPassword() {
    const loading = await this.loadingController.create({ message: "Aguarde" });
    await loading.present();
    this.comService.sendInstallerCode("PRG003").subscribe(
      (res: ResponseDTO | any) => {
        if (res.Code === 0 && res.Text.includes("PRG003")) {
          this.installatorPassword = res.Text.split(":")[1];
          this.hasPassword = true;
        } else {
          this.alertService.alertToast(
            "Problema al comunicarse con el equipo"
          );
        }
        loading.dismiss();
      },
      (err) => {
        loading.dismiss();
        if (err && err.Code === 401) {
          // 401: Unauthorized
          this.authService.onPasswordChanged();
        } else {
          this.alertService.alertToast(
            "Problema al comunicarse con el equipo"
          );
        }
      }
    );
  }

  /**
   * Shows pop up with password input and compares with device password
   */
  showPasswordInput() {
    if (this.installatorPassword) {
      this.alertController
        .create({
          header: "Contraseña requerida",
          subHeader: "Ingrese contraseña",
          mode: "ios",
          inputs: [{ type: "text", name: "password" }],
          buttons: [
            { text: "Cancelar", role: "cancel" },
            {
              text: "Confirmar",
              handler: (data: any) => {
                if (data.password == this.installatorPassword) {
                  // If password is correct, then grant access to page
                  this.access = true;
                } else {
                  // If it is incorrect, shows an error alert
                  this.alertController
                    .create({
                      header: "Error",
                      subHeader: "Contraseña incorrecta",
                      mode: "ios",
                    })
                    .then((alert2) => alert2.present());
                }
              },
            },
          ],
        })
        .then((alert) => alert.present());
    } else {
      this.getInstallatorPassword();
    }
  }

  /**
   * Fired when user clicks "send" button.
   * Sends command inside the textbox to backend and replaces textbox content with the response.
   */
  async onClick() {
    const loading = await this.loadingController.create({ message: "Aguarde" });
    await loading.present();
    this.comService.sendInstallerCode(this.code).subscribe(
      (res: ResponseDTO | any) => {
        if (res && res.Code == 0) {
          let msg: string;
          switch (res.Text.toUpperCase()) {
            case "ERROR":
              msg = "El codigo ingresado es inválido";
              break;
            case "DISCONNECTED":
              msg = "Problema al comunicarse con el equipo";
              break;
            default:
              msg = res.Text;
              break;
          }
          this.code = msg;
        } else {
          if (res.Code == 6) {
            this.code = "Problema al comunicarse con el equipo";
          } else {
            this.alertService.alertToast(res.Message);
          }
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
            "Ocurrió un error al enviar el código, por favor intente nuevamente"
          );
        }
      }
    );
  }
}
