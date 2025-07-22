import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BadgesService } from 'src/app/achievements/services/badges.service'
import { MedalsService } from 'src/app/achievements/services/medals.service'

@NgModule({
    imports: [CommonModule],
    providers: [BadgesService, MedalsService],
})
export class AchievementsModule {

}