import { Component, OnInit } from "@angular/core";
import { DowntimeBannerComponent } from "../banners/downtime-banner/downtime-banner.component";
import { DevBannerComponent } from "../banners/dev-banner/dev-banner.component";
import { AuthService } from "../auth/auth.service";
import { User } from "../models/User.model";

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  banners = [DowntimeBannerComponent, DevBannerComponent];
  popup = false;
  currentUser!: User;
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.loginEvent$.subscribe((user) => {
      this.showPopup(user);
    });
  }
  showPopup(user: User) {
    if (user.firstTimeLogin()) {
      this.currentUser = user;
      this.popup = true;
    }
  }
  closePopup(){
    this.popup = false;
  }
}
