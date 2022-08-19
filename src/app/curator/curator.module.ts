import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuratorCardComponent } from './curator-card/curator-card.component';
import { CuratorRoutingModule } from './curator-routing.module';
import { CuratorComponent } from './curator.component';
import { CuratorSearchComponent } from './curator-search/curator-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CuratorCardComponent,
    CuratorComponent,
    CuratorSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CuratorRoutingModule
  ],
  exports: [
    CuratorCardComponent
  ]
})
export class CuratorModule { }
