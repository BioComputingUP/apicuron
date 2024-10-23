import { Component, Inject } from "@angular/core";
import { BannerService } from "../banner.service";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: "dev-banner",
  templateUrl: "./dev-banner.component.html",
  standalone: true,
  providers: [
    {
      provide: "DevBannerService",
      useValue: new BannerService(),
    },
  ],
  imports: [CommonModule, AngularSvgIconModule],
})
export class DevBannerComponent {
  constructor(
    @Inject("DevBannerService") protected bannerService: BannerService
  ) {
    this.displayBanner$ = this.bannerService.displayBanner;
  }
  displayBanner$: Observable<boolean>;

  closeBanner() {
    this.bannerService.closeBanner();
  }
}
