import { Component, Input, OnInit } from "@angular/core";
import { CuratorRegistryService } from "../curator-registry.service";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { RegistryEntry } from "src/app/models/registryEntry.model";

@Component({
  selector: "curator-registry-page",
  templateUrl: "./curator-registry-page.component.html",
  styleUrls: ["./curator-registry-page.component.scss"],
})
export class CuratorRegistryPageComponent implements OnInit {
  constructor(protected registryService: CuratorRegistryService) {}

  entries$: Observable<Array<RegistryEntry>>;
  ngOnInit(): void {
    // get entries and build objects
    this.entries$ = this.registryService.getAllCurators().pipe(
      pluck("data"),
      map((data: any[]) => data.map((element) => new RegistryEntry().deserialize(element)))
    );
    console.log(this.entries$);
  }
  
}
