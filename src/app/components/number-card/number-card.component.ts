import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";


@Component({
	standalone: true,
	imports: [CommonModule, AngularSvgIconModule],
	selector: 'number-card',
	templateUrl: './number-card.component.html',
	styleUrls: []
})
export class NumberCardComponent {
	@Input() label: string;
	@Input() value: string;
}