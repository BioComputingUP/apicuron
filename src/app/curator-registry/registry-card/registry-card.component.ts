import { Component, Input, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { RegistryEntry } from "src/app/models/registryEntry.model";
import { Resource } from "src/app/models/resource.model";

@Component({
  selector: "app-registry-card",
  templateUrl: "./registry-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryCardComponent implements OnInit {
  contributions$: Observable<RegistryEntry['contributed_to']>;
  showGroups$ = new BehaviorSubject<boolean>(false);
  firstContributions$: Observable<RegistryEntry['contributed_to']>;
  remainingContributions$: Observable<RegistryEntry['contributed_to']>;

  constructor() {
    this.contributions$ = this.entry$.pipe(
      map((entry) => entry?.contributed_to as RegistryEntry['contributed_to'] ?? [])
    )
    this.firstContributions$ = this.contributions$.pipe(
      map((contributions) => contributions.slice(0, 2))
    )
    this.remainingContributions$ = this.contributions$.pipe(
      map((contributions) => contributions.slice(2))
    )
  }
  @ViewChild("trigger", { static: false }) trigger!: ElementRef;

  entry$ = new BehaviorSubject<RegistryEntry>(null);

  @Input() set entry(value: RegistryEntry) {
    this.entry$.next(value);
  }

  showGroups(value: boolean) {
    this.showGroups$.next(value);
  }


  ngOnInit(): void {
  }

}
