import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/models/User.model";
@Component({
  selector: "app-post-auth-page",
  templateUrl: "./post-auth-page.component.html",
  styleUrls: ["./post-auth-page.component.scss"],
})
export class PostAuthPageComponent implements OnInit {
  checkboxValue = false;
  user;
  constructor(protected router: Router, protected authService: AuthService) {}
  ngOnInit(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }
  goToHome() {
    this.router.navigate(["/"]).then((success) => {
      if (!success) {
        console.log("Error navigating to home page");
      }
    });
  }
}
