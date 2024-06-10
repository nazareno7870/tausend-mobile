import { environment } from './../environments/environment';
import { Component, ViewChildren, QueryList } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {
  Platform,
  ActionSheetController,
  MenuController,
  IonRouterOutlet,
  ModalController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Events } from './services/events.service';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import {
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Dialogs } from '@awesome-cordova-plugins/dialogs/ngx';
import { AppService } from './services/app.service';
import { AccountDTO } from './models/DTOs/usersDTO';
import { ApiService } from './services/api.service';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';
import { Location } from '@angular/common';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChildren(IonRouterOutlet) routerOutlets:
    | QueryList<IonRouterOutlet>
    | undefined;
  version: string = '';
  public expandIcon: string = 'arrow-up';
  firstName: string = '';
  lastName: string = '';
  path: string = '';
  sms: boolean = false;

  public hasDevices = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public actionSheetController: ActionSheetController,
    private authService: AuthService,
    private router: Router,
    private storage: Storage,
    private menu: MenuController,
    private dialogs: Dialogs,
    private appService: AppService,
    public modalController: ModalController,
    private alertController: AlertController,
    private firebaseCrashlytics: FirebaseCrashlytics,
    private api: ApiService,
    private loadingController: LoadingController,
    private location: Location,
    private androidPermissions: AndroidPermissions,
    events: Events
  ) {
    this.initializeApp();
    this.firebaseCrashlytics.initialise();
    this.version = environment.version;
    events.subscribe('login', (user: AccountDTO) => {
      this.firstName = user.FirstName;
      this.lastName = user.LastName;
      this.hasDevices =
        (user.Devices && user.Devices[0].DeviceId != 0) ||
        (user.SMSDevices && user.SMSDevices.length > 0);
    });
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.path = val.url;
      }
      this.storage.get('currentUser').then((user: AccountDTO) => {
        this.sms = user && user.isSMS;
      });
    });
  }
  async ngOnInit() {
    await this.storage.create();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.api.setCurrentNetworkStatus();
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      });
      this.authService.removePendingTokens();
      if (this.authService.isAuthenticated()) {
        this.statusBar.styleDefault();
        this.storage.get('currentUser').then((user: AccountDTO) => {
          if (user.version != environment.version) {
            this.authService.logout();
            this.router.navigate(['login']);
            this.splashScreen.hide();
            return;
          }
          this.registerUserToken(user);
          this.sms = user.isSMS;
          this.hasDevices =
            (user.Devices && user.Devices[0].DeviceId != 0) ||
            (user.SMSDevices && user.SMSDevices.length > 0);
          if (
            user &&
            user.Devices &&
            user.Devices[0].DeviceId == 0 &&
            user.SMSDevices &&
            user.SMSDevices.length == 0
          ) {
            this.router.navigate(['setup']);
          } else {
            this.router.navigate(['selector']);
          }
        });
        this.splashScreen.hide();
      } else {
        this.router.navigate(['login']);
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
    });
  }

  private registerUserToken(user: AccountDTO) {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', (token: Token) => {
          this.appService
            .createAccountDeviceToken(token.value)
            .subscribe((x) => {});
        });
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });
    if (this.platform.is('android')) {
      this.androidPermissions
        .requestPermission(
          this.androidPermissions.PERMISSION.POST_NOTIFICATIONS
        )
        .then(() => {
          PushNotifications.addListener('registration', (token: Token) => {
            this.appService
              .createAccountDeviceToken(token.value)
              .subscribe((x) => {});
          });
        });
    }
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.alertController
          .create({
            mode: 'ios',
            header: notification['title'],
            message: notification['body'],
            buttons: ['OK'],
          })
          .then((alert) => {
            alert.present();
            this.dialogs.beep(1);
          });
      }
    );
    this.firstName = user.FirstName;
    this.lastName = user.LastName;
  }

  expandUser() {
    if (this.expandIcon == 'arrow-up') {
      this.expandIcon = 'arrow-down';
    } else {
      this.expandIcon = 'arrow-up';
    }

    this.presentActionSheet();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ajustes',
      buttons: [
        {
          text: 'Cerrar sesión',
          icon: 'log-out',
          handler: () => {
            this.authService.logout();
          },
        },
        {
          text: 'Cambiar contraseña',
          icon: 'refresh',
          handler: () => {
            this.router.navigate(['change-password']);
            this.menu.close();
          },
        },
        {
          text: 'Cuenta de usuario',
          icon: 'person',
          handler: () => {
            this.router.navigate(['user-account']);
            this.menu.close();
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            this.expandIcon = 'arrow-up';
          },
        },
      ],
    });
    await actionSheet.present();
  }

  // active hardware back button
  async backButtonEvent() {
    // close action sheet
    try {
      const element = await this.actionSheetController.getTop();
      if (element) {
        element.dismiss();
        return;
      }
    } catch (error) {}

    // close modal
    try {
      const element = await this.modalController.getTop();
      if (element) {
        element.dismiss();
        return;
      }
    } catch (error) {
      console.log(error);
    }

    if (
      this.path === '/home' ||
      this.path === '/selector' ||
      this.path === '/login'
    ) {
      const menuOpen = await this.menu.isOpen();
      if (menuOpen) {
        this.menu.close();
      } else {
      }
    } else if (
      this.path === '/scheduled-departures' ||
      this.path === '/exclusions' ||
      this.path === '/setup' ||
      this.path === '/change-password' ||
      this.path === '/zones' ||
      this.path === '/memory' ||
      this.path === '/failures' ||
      this.path === '/instalator' ||
      this.path === '/events' ||
      this.path === '/users-labels' ||
      this.path === '/clock' ||
      this.path === '/battery' ||
      this.path === '/contact-phone' ||
      this.path === '/custom-messages' ||
      this.path === '/identification' ||
      this.path === '/sms-password-change' ||
      this.path === '/user-account'
    ) {
      const loader = await this.loadingController.getTop();
      const menuOpen = await this.menu.isOpen();
      if (menuOpen) {
        this.menu.close();
      } else if (loader) {
        return;
      } else {
        this.location.back();
      }
    } else if (this.path === '/register' || this.path === '/forgot-password') {
      this.location.back();
    }
  }
  @HostListener('document:backbutton', ['$event']) onBack(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.backButtonEvent();
  }
}
