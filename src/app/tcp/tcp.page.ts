import { AuthService } from './../services/auth.service';
import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { NativeAudio } from '@capacitor-community/native-audio';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';
import { CapacitorWifiConnect } from '@falconeta/capacitor-wifi-connect';
import { Socket } from '@spryrocks/capacitor-socket-connection-plugin';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
interface Network {
  level: string;
  SSID: string;
  BSSID: string;
  frequency: string;
  capabilities: string;
  timestamp: string;
  channelWidth: string;
  centerFreq0: string;
  centerFreq1: string;
}
@Component({
  selector: 'app-tcp',
  templateUrl: './tcp.page.html',
  styleUrls: ['./tcp.page.scss'],
})
export class TcpPage implements OnInit {
  showPassword: boolean = false;
  showPassword2: boolean = false;
  passwordToggleIcon: string = 'eye';
  passwordToggleIcon2: string = 'eye';
  public tcp: boolean = true;
  public connected: boolean = false;
  public password: string = '';
  public ip: string = '192.168.4.1';
  public port: number = 8002;
  public newPassword: string = '';
  public currentSSID: string = '';
  networks: Network[] = [];
  public passwordWifi: string = '88888888';
  public command: string = '';
  public displayedCommand: string = '';
  private socket = new Socket();
  public passwordTcpWifi: string = '';
  public namedTcpWifi: string = '';
  public wifiCommanSended: boolean = false;

  constructor(
    private alertService: AlertService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private wifiWizard2: WifiWizard2,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkWifiNetwork();
  }
  ngOnDestroy() {
    this.socket.close();
  }

  async handleWifi() {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.wifiWizard2
      .requestPermission()
      .then((result) => {
        this.wifiWizard2;
        this.wifiWizard2.listNetworks();
        this.wifiWizard2
          .scan()
          .then((result) => {
            this.wifiWizard2
              .getScanResults({ numLevels: 5 })
              .then((result) => {
                this.networks = result;
                const networksCopy = this.networks.map((network) => {
                  return {
                    ...network,
                    SSID: network.SSID.replace(/Poronga/g, 'Casa'),
                  };
                });
                this.networks = networksCopy;
                loading.dismiss();
                this.tcp = false;
              })
              .catch((err) => {
                this.networks = [];
                loading.dismiss();
                this.tcp = false;
              });
          })
          .catch((err) => {
            this.networks = [];
            loading.dismiss();
            this.tcp = false;
          });
      })
      .catch((err) => {
        this.networks = [];
        loading.dismiss();
        this.tcp = false;
      });
  }
  handleTcp() {
    this.checkWifiNetwork();
    this.tcp = true;
  }
  handleNetwork(network: any) {
    this.showModal(network);
  }
  handleTCPWifi() {
    this.showModalTCPWifi();
  }
  async checkWifiNetwork() {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.wifiWizard2
      .requestPermission()
      .then((result) => {
        this.wifiWizard2
          .getConnectedSSID()
          .then((result) => {
            this.currentSSID = result.replace(/Poronga/g, 'Casa');
            loading.dismiss();
          })
          .catch((err) => {
            this.currentSSID = 'Sin red';
            loading.dismiss();
          });
      })
      .catch((err) => {
        this.currentSSID = 'Sin red';
        loading.dismiss();
      });
  }

  changeDisplayCommand(command: string) {
    this.displayedCommand += !this.displayedCommand ? command : '\n' + command;
    this.ref.detectChanges();
  }

  closeTcp() {
    this.connected = false;
    this.ref.detectChanges();
  }

  async connect(form: NgForm) {
    const loading = await this.loadingController.create({ message: 'Aguarde' });
    await loading.present();
    this.socket = new Socket();
    this.socket.open(form.value.ip, form.value.port).then((result) => {
      loading.dismiss();
      this.socket.onClose = () => {
        loading.dismiss();
        this.connected = false;
        this.ref.detectChanges();
      };

      this.socket.onData = (data: Uint8Array) => {
        var enc = new TextDecoder('utf-8');
        var u8arr = new Uint8Array(data);
        var u8str = enc.decode(u8arr);
        this.changeDisplayCommand(u8str);
      };
      this.connected = true;
      this.ref.detectChanges();
    });
    setTimeout(() => {
      loading.dismiss();
      if (form.value.ip) {
        this.alertService.alertToast('No se pudo conectar a ' + form.value.ip);
      }
    }, 2000);
  }
  async sendCommand(form: NgForm) {
    this.socket.write(
      Uint8Array.of(
        ...form.value.command
          .split('')
          .map((letter: string) => letter.charCodeAt(0)),
        0x0d
      )
    );
    this.command = '';
    form.resetForm();
  }
  private showModal(network: Network) {
    let header: string;
    let inputs: any[] = [];
    header = 'Conectar a ' + network.SSID;
    inputs.push({
      placeholder: 'Password',
      type: 'text',
      name: 'password',
      value: this.passwordWifi,
    });
    this.alertController
      .create({
        mode: 'ios',
        header: header,
        inputs: inputs,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: async (data) => {
              if (data.password) {
                this.passwordWifi = data.password;
                let { value } = await CapacitorWifiConnect.checkPermission();
                if (value === 'prompt') {
                  const data = await CapacitorWifiConnect.requestPermission();
                  value = data.value;
                }
                if (value === 'granted') {
                  CapacitorWifiConnect.secureConnect({
                    ssid: network.SSID,
                    password: data.password,
                  }).then((data) => {
                    if (data.value === 0) {
                      this.alertService.presentToast(
                        'Conectado a ' + network.SSID
                      );
                      this.handleTcp();
                    } else {
                      this.alertService.alertToast(
                        'No se pudo conectar a ' + network.SSID
                      );
                    }
                  });
                } else {
                  throw new Error('permission denied');
                }
              } else {
                let msg = 'Por favor complete el campo de password';
                this.alertService.alertToast(msg);
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
        const userNumberInput: any = document.getElementById('userNumberInput');
        userNumberInput.addEventListener('keydown', (ev: any) => {
          const input = ev.target as HTMLInputElement;
          const key = ev.key;
          const regex = /^[0-9]*$/g; // Only digits regex
          const arrValid = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'Shift',
          ];
          if (!arrValid.includes(key) && !key.match(regex)) {
            ev.preventDefault();
          }
          if (input.value.length >= 3 && !arrValid.includes(key)) {
            ev.preventDefault();
          }
        });
      });
  }
  public async showModalTCPWifi() {
    let header: string;
    let inputs: any[] = [];
    header = 'Conectar central a wifi';
    inputs.push({
      placeholder: 'Nombre de red - PRG350:',
      type: 'text',
      name: 'nameTCPWifi',
      value: this.namedTcpWifi,
    });
    inputs.push({
      placeholder: 'Password - PRG351:',
      type: 'text',
      name: 'passwordTcpWifi',
      value: this.passwordTcpWifi,
    });
    this.alertController
      .create({
        mode: 'ios',
        header: header,
        inputs: inputs,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: async (data) => {
              const loading = await this.loadingController.create({
                message: 'Aguarde',
              });
              await loading.present();
              if (data.passwordTcpWifi && data.nameTCPWifi) {
                this.passwordTcpWifi = data.password;
                this.namedTcpWifi = data.nameTCPWifi;
                const commandName = 'PRG350:' + data.nameTCPWifi.trim();
                const commandPassword = 'PRG351:' + data.passwordTcpWifi.trim();
                this.socket.write(
                  Uint8Array.of(
                    ...commandName
                      .split('')
                      .map((letter: string) => letter.charCodeAt(0)),
                    0x0d
                  )
                );
                setTimeout(() => {
                  this.socket.write(
                    Uint8Array.of(
                      ...commandPassword
                        .split('')
                        .map((letter: string) => letter.charCodeAt(0)),
                      0x0d
                    )
                  );
                  this.wifiCommanSended = true;
                  loading.dismiss();
                }, 1000);
              } else {
                let msg = 'Por favor complete los campos';
                this.alertService.alertToast(msg);
                loading.dismiss();
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
        const userNumberInput: any = document.getElementById('userNumberInput');
        userNumberInput.addEventListener('keydown', (ev: any) => {
          const input = ev.target as HTMLInputElement;
          const key = ev.key;
          const regex = /^[0-9]*$/g; // Only digits regex
          const arrValid = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'Shift',
          ];
          if (!arrValid.includes(key) && !key.match(regex)) {
            ev.preventDefault();
          }
          if (input.value.length >= 3 && !arrValid.includes(key)) {
            ev.preventDefault();
          }
        });
      });
  }
}
