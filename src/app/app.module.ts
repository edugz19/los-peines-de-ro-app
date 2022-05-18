import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { AngularFireRemoteConfigModule } from '@angular/fire/compat/remote-config';
import { TabsComponent } from './components/tabs/tabs.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Stripe } from '@ionic-native/stripe/ngx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VariablesGlobales } from './global/VariablesGlobales';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { InfoComponent } from './components/info/info.component';
import { CardComponent } from './components/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    TabsComponent,
    InfoComponent,
    CardComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AngularFireFunctionsModule,
    HttpClientModule,
    AngularFireRemoteConfigModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Stripe,
    HttpClient,
    VariablesGlobales,
    LocalNotifications
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
