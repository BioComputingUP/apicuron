import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs";



@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'slide-over-panel',
    templateUrl: './slide-over-panel.component.html',
    styleUrls: []
})
export class SlideOverPanelComponent {

    // private  _open_panel: Boolean = false;
    @Input('openPanel')
    get open_panel() {
        return this.openPanel$.value
    }
    set open_panel(value: Boolean) {
        if (value) {
            document.body.style.overflowY = 'hidden'
        } else {
            document.body.style.overflowY = 'unset'
        }
        this.openPanelChange.emit(value)
        this.openPanel$.next(value);
    }

    @Output('openPanelChange')openPanelChange = new EventEmitter();


    openPanel$ = new BehaviorSubject<Boolean>(false);


    // TODO: Setup a width prop that adjusts to media queries
    // @Input() width = '75%';

    @Input() side: 'right' | 'left' = 'left';

    constructor() { }


    is_right_side() {
        return this.side == 'right';
    }
}