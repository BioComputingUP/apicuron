import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
@Component({
  selector: "index-numbers-banner",
  templateUrl: "./numbers-banner.component.html",
  styleUrls: ["./numbers-banner.component.scss"],
})
export class NumbersBannerComponent implements OnInit {
  constructor(private httpClient: HttpClient) {}

  numberElements = [
    {
      icon: "assets/user.svg",
      count: 88,
      text: "biocurators",
    },
    {
      icon: "assets/database.svg",
      count: 3,
      text: "partner resources",
    },
    {
      icon: "assets/curation-events.svg",
      count: 43700,
      text: "Curation Events",
    },
    {
      icon: "assets/medal_icon.svg",
      count: 133,
      text: "Achievements",
    },
  ];

  ngOnInit(): void {
    const route = environment.ws + "/home";
    this.httpClient.get(route).subscribe((response) => {
      // {"data":{"resource_count":3,"user_count":88,"report_count":45810,"achievement_count":133}}
      const data = response["data"];
      const count_list = [
        data["user_count"],
        data["resource_count"],
        data["report_count"],
        data["achievement_count"],
      ];
      this.numberElements = this.numberElements.map((el, index) => {
        return {...el, count:count_list[index]}
      })
    });
  }
}
