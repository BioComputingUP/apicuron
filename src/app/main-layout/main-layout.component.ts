import { Component, OnInit } from "@angular/core";
import { DowntimeBannerComponent } from "../banners/downtime-banner/downtime-banner.component";
import { DevBannerComponent } from "../banners/dev-banner/dev-banner.component";
import { AuthService } from "../auth/auth.service";
import { User } from "../models/User.model";
import { filter, map, switchMap, tap } from "rxjs/operators";


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

  ngOnInit(): void {
    // this.auth.loginEvent$.subscribe((loginEvent) => {
    //   if (loginEvent) {
    //     this.auth.user$.subscribe((user) => {
    //       if (user.firstTimeLogin()) {
    //         this.popup = true;
    //       }
    //     });
    //   }
    // });
  
  }
  closePopup() {
    this.popup = false;
  }
}
