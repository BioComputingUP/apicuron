import { Component, Input } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Medal } from "src/app/models/medal.model";
// import 

@Component({
    standalone: true,
    selector: 'medal-card',
    imports: [CommonModule],
    templateUrl: './medal-card.component.html',
    styleUrls: []
})
export class MedalCardComponent {
    @Input()
    medal: Medal


    @Input()
    enableShadow = true


}