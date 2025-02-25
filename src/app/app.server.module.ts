import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { TransferHttpCacheModule } from '@angular/ssr'
@NgModule({
  imports: [
    AppModule,
    TransferHttpCacheModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
