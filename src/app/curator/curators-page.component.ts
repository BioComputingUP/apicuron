import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CuratorService } from "./curator.service";

@Component({
  selector: "app-curator",
  templateUrl: "./curators-page.component.html",
  styleUrls: ["./curators-page.component.scss"],
})
export class CuratorsPageComponent implements OnInit {
  total_items: number;
  current_page = 1;
  page_size = 9;

  biocurators = [];
  private last_query_params = {};

  constructor(
    private curatorService: CuratorService,
    private route: ActivatedRoute
  ) {}

  update_curator_list(query_params: any) {
    this.last_query_params = query_params;
    this.curatorService
      .search_curators(
        new HttpParams({
          fromObject: { ...query_params, page_size: this.page_size },
        })
      )
      .subscribe((response) => {
        this.biocurators = response["data"];
        // this.current_page = response['page']
        this.total_items = response["count"];
      });
  }

  update_page(page: number) {
    this.update_curator_list({ ...this.last_query_params, page });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      let query_params = {};
      
      if (!!params["search"]) {
        query_params = {
          query: params["search"],
        };
      }
      this.update_curator_list(query_params);
    });
  }
}
