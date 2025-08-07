import { Component, OnInit } from "@angular/core";
import { DowntimeBannerComponent } from "../banners/downtime-banner/downtime-banner.component";
import { DevBannerComponent } from "../banners/dev-banner/dev-banner.component";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  banners = [DowntimeBannerComponent, DevBannerComponent];
  popup = false;
  currentUser$ = this.auth.user$;
  constructor(private auth: AuthService) {}

  ngOnInit(): void {}
  closePopup() {
    this.popup = false;
  }
}
