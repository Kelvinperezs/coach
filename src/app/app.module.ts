import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';
import { APP_INSIGHTS_CONFIG } from 'ng-appinsights';

import { AppComponent } from './app.component';
import { ComparacionModule } from './components/comparacion/comparacion.module';
import { CotizarModule } from './components/cotizar/cotizar.module';
import { HeaderModule } from './components/header/header.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HeaderModule,
    CotizarModule,
    ComparacionModule,
    routing,
    HttpClientModule
  ],
  providers: [appRoutingProviders/* , {
    provide: APP_INSIGHTS_CONFIG,
    useValue: {
      instrumentationKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx',
      enableAutoRouteTracking: true,
      // Visit https://github.com/microsoft/ApplicationInsights-JS to know all possible configurations.
    }
  } */],
  bootstrap: [AppComponent]
})
export class AppModule { }
