import { Component, OnInit } from "@angular/core";
import { DatabasesService } from "../services/databases.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
@Component({
  selector: "app-database-page",
  templateUrl: "./database-page.component.html",
  styleUrls: ["./database-page.component.scss"],
})
export class DatabasePageComponent implements OnInit {
  reports: { data: any; page_size: any; page: any; };
  terms: any;
  medals: any;
  badges: any;
  constructor(
    private databaseService: DatabasesService,
    private route: ActivatedRoute
  ) {}

  resource = null;

  more_badges= false;
  more_medals= false;

  leaderboard: Array<any>;

  get resource_name(){
    return this.resource['resource_name']
  }

  get resource_long_name(){
    return this.resource['resource_long_name']
  }

  get resource_description(){
    return this.resource['resource_description']
  }

  get resource_url(){
    return this.resource['resource_url']
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const resource_id = params.get("resource_id")
      this.databaseService
        .get_resource_leaderboard(resource_id)
        .subscribe((response) => {
          this.leaderboard = response['data']
        });
      this.databaseService.get_resource_details(resource_id).subscribe((response) => {
        const data = response['data']
        let attributes = ['badges', 'medals','terms'].map(element => {
          this[element] = data[element]
          delete data[element]
        })
        this.reports = {data: data['reports'], page_size: response['page_size'], page:response['reports_page']}
        delete data['reports']
        
        this.resource = data
      })
      
    });

  }
}
