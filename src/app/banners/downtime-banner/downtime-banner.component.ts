import { Component, Inject } from "@angular/core";
import { BannerService } from "../banner.service";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
	selector: 'downtime-banner',
	templateUrl: './downtime-banner.component.html',
	standalone: true,
	providers: [{
		provide: 'DowntimeBannerService',
		useValue: new BannerService(new Date('2024-10-11T00:00'), new Date('2024-10-12T00:00'), true)
	}],
	imports: [CommonModule, AngularSvgIconModule]
})
export class DowntimeBannerComponent {
	endDate: Date;
	startDate: Date;
	constructor(@Inject('DowntimeBannerService') protected bannerService: BannerService) {
		this.displayBanner$ = this.bannerService.displayBanner;
		this.startDate= this.bannerService.startDate;
		this.endDate = this.bannerService.endDate;
	  }
	  displayBanner$: Observable<boolean>;
	closeBanner() {
		this.bannerService.closeBanner();
	}
}