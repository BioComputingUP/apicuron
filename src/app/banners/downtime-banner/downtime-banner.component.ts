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
		useValue: new BannerService(new Date('2024-05-02'), new Date('2024-05-04'), true)
	}],
	imports: [CommonModule, AngularSvgIconModule]
})
export class DowntimeBannerComponent {
	constructor(@Inject('DowntimeBannerService') protected bannerService: BannerService) {
		this.displayBanner$ = this.bannerService.displayBanner;
	  }
	  displayBanner$: Observable<boolean>;
	
	closeBanner() {
		this.bannerService.closeBanner();
	}
}