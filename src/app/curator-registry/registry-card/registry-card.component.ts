import { Component, Input, OnInit, ElementRef, ViewChild } from "@angular/core";
import { RegistryEntry } from "src/app/models/registryEntry.model";
import { Resource } from "src/app/models/resource.model";

@Component({
  selector: "app-registry-card",
  templateUrl: "./registry-card.component.html",
})
export class RegistryCardComponent implements OnInit {
  @ViewChild("trigger", { static: false }) trigger!: ElementRef;

  @Input() entry: RegistryEntry;
  contributions: { resource_id: string; resource: Resource; groups: any[] }[] =
    [];

  showContributions: boolean = false;
  showGroups: boolean[] = [];

  ngOnInit(): void {
    this.contributions = this.entry?.contributed_to ?? [];
    this.showGroups = new Array(this.contributions.length).fill(false);
  }

  getContributions() {
    return this.contributions;
  }

  toggleGroups(index: number) {
    this.showGroups[index] = !this.showGroups[index];
  }
}
