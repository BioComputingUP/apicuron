import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from './badge/badge.component';
import { MedalComponent } from './medal/medal.component';
import { AvatarComponent } from './avatar/avatar.component';
import { GenerationIconComponent } from './generation-icon/generation-icon.component';
import { RevisionIconComponent } from './revision-icon/revision-icon.component';
import { InvalidationIconComponent } from './invalidation-icon/invalidation-icon.component';
import { BadgeIconComponent } from './badge-icon/badge-icon.component';
import { MedalIconComponent } from './medal-icon/medal-icon.component';



@NgModule({
  declarations: [
    BadgeComponent,
    MedalComponent,
    AvatarComponent,
    GenerationIconComponent,
    RevisionIconComponent,
    InvalidationIconComponent,
    BadgeIconComponent,
    MedalIconComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BadgeComponent,
    MedalComponent,
    AvatarComponent,
    GenerationIconComponent,
    RevisionIconComponent,
    InvalidationIconComponent,
    BadgeIconComponent,
    MedalIconComponent
  ]
})
export class SvgModule { }
