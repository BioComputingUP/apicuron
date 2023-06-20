import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Badge } from 'src/app/models/badge.model'
import { AngularSvgIconModule } from 'angular-svg-icon'
@Component({
    standalone: true,
    selector: 'badge-card',
    imports: [CommonModule, AngularSvgIconModule],
    templateUrl: './badge-card.component.html',
    styleUrls: []
})
export class BadgeCardComponent {

    @Input()
    badge: Badge

}