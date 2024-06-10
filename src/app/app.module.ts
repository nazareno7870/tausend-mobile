import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { InsideAssembleModalPageModule } from './inside-assemble-modal/inside-assemble-modal.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Dialogs } from '@awesome-cordova-plugins/dialogs/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    InsideAssembleModalPageModule,
    HttpClientModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Dialogs,
    SocialSharing,
    Geolocation,
    Network,
    SMS,
    AndroidPermissions,
    FirebaseCrashlytics,
    WifiWizard2,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
