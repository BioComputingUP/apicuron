import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core'


@Component({
    selector: 'list-expand',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './list-expand.component.html'
})
export class ListExpandComponent implements OnInit {

    constructor() {}

    // @ContentChild('content', { static: false })
    // contentTemplate!: TemplateRef<any>;

    // @ContentChild('expansion', { static: false })
    // expansionTemplate!: TemplateRef<any>;

    @Input()
    collapsed = true;


    @Input('expansion-container-class')
    expansionContainerClass: string = ''

    ngOnInit(): void {
        // throw new Error('Method not implemented.');
    }

}