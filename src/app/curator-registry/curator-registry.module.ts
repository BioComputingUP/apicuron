import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuratorRegistryPageComponent } from './curator-registry-page/curator-registry-page.component';
import { CuratorRoutingModule } from '../curator/curator-routing.module';



@NgModule({
  declarations: [
    CuratorRegistryPageComponent
  ],
  imports: [
    CommonModule,
    CuratorRoutingModule
  ]
})
export class CuratorRegistryModule { }
