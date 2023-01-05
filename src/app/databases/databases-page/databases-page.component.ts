import { Component, OnInit } from "@angular/core";
import { DatabasesService } from "../services/databases.service";

@Component({
  standalone: true,
  selector: "app-databases",
  templateUrl: "./databases-page.component.html",
  styleUrls: ["./databases-page.component.scss"],
})
export class DatabasesPageComponent implements OnInit {
  listResourcesDescriptions;

  constructor(private databaseService: DatabasesService) {}

  ngOnInit(): void {
    // this.databaseService.GetResources({}).subscribe(
    //   (response) => {
    //     console.log('data', response)
    //     this.listResourcesDescriptions = response;
    //   },
    //   (err) => {},
    //   () => {}
    // );
    this.databaseService.get_resources().subscribe((response: Object & { data: object}) => {
      this.listResourcesDescriptions = response.data
    })
  }
}
