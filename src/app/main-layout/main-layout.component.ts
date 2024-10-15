import { Component, OnInit } from "@angular/core";
import { DowntimeBannerComponent } from "../banners/downtime-banner/downtime-banner.component";
import { DevBannerComponent } from "../banners/dev-banner/dev-banner.component";

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  banners = [DowntimeBannerComponent, DevBannerComponent];

  ngOnInit(): void {}
}
