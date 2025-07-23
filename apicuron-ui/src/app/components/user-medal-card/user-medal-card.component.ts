import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Medal } from "src/app/models/medal.model";
import { environment } from "src/environments/environment";

@Component({
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  selector: "user-medal-card",
  templateUrl: "./user-medal-card.component.html",
})
export class UserMedalCardComponent {
  @Input()
  medal: Medal;

  orcid_main_url = environment.orcid_main_url;
}
