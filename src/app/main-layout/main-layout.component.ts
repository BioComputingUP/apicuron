import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BannerService } from "./banner.service";

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  constructor(protected bannerService: BannerService) {
    this.displayBanner$ = this.bannerService.displayBanner;
  }
  development = ["development", "local"].includes(environment.env);
  displayBanner$: Observable<boolean>;

  
  closeBanner() {
    this.bannerService.closeBanner();
  }

  ngOnInit(): void {}
}
