import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
@Component({
  selector: "index-numbers-banner",
  templateUrl: "./numbers-banner.component.html",
  styleUrls: ["./numbers-banner.component.scss"],
})
export class NumbersBannerComponent implements OnInit {
  constructor(private httpClient: HttpClient) {
    const route = environment.ws + "/home";
    this.numberElements$ = this.httpClient.get(route).pipe(
      map((response) => {
        const count_list = [
          response["user_count"],
          response["resource_count"],
          response["report_count"],
          response["achievement_count"],
        ];

        const numberElements = [
          {
            icon: "assets/user.svg",
            count: 88,
            text: "Registered contributors",
          },
          {
            icon: "assets/database.svg",
            count: 3,
            text: "partner resources",
          },
          {
            icon: "assets/curation-events.svg",
            count: 43700,
            text: "Contribution Events",
          },
          {
            icon: "assets/medal_icon.svg",
            count: 133,
            text: "Achievements",
          },
        ];
        return numberElements.map((el, index) => {
          return { ...el, count: count_list[index] };
        });
      })
    );
  }

  numberElements$: Observable<any>;

  ngOnInit(): void {}
}
