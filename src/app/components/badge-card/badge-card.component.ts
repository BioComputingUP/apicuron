import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Badge } from 'src/app/models/badge.model'
import { AngularSvgIconModule } from 'angular-svg-icon'
import { NgxPopperModule } from 'ngx-popper'
import { Term } from 'src/app/models/term.model'
@Component({
    standalone: true,
    selector: 'badge-card',
    imports: [CommonModule, AngularSvgIconModule, NgxPopperModule],
    templateUrl: './badge-card.component.html',
    styleUrls: []
})
export class BadgeCardComponent {

    @Input()
    badge: Badge

    @Input()
    terms: Term[]


    getTerm(activity_term: string){
        return this.terms.find((term:Term) => term.activity_term == activity_term)
    }

}