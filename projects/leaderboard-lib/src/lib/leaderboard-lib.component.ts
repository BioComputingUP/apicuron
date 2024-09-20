import { Component, Injector, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { LeaderboardLibModule } from './leaderboard-lib.module';
import { TableDateComponent } from './table-date/table-date.component';
import { ELEMENT_TOKEN } from './element-token';
@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  templateUrl: "../lib/leaderboard-lib.component.html",
  imports: [CommonModule, CdkTableModule, LeaderboardLibModule, NgComponentOutlet],
  styles: []
})
export class LeaderboardLibComponent implements OnInit {
  dateComponent = TableDateComponent;
  myInjector: Injector;

  columns: string[] = [
    'Medals', 
    'Badges', 
    'Generation Contributions', 
    'Invalidation Contributions', 
    'Revision Contributions', 
    'Total Count', 
    'Last Contribution Date',
  ];

  data = [
    { 
      medals_count: 15,
      badges_count: 10,
      generation_count: 5,
      invalidation_count: 2,
      revision_count: 7,
      total_count: 24,
      last_contribution: new Date(),
    },
  ];

  constructor(private injector: Injector) { }

  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }

  ngOnInit(): void {}

  createInjector(element: any): Injector {
    return Injector.create({
      providers: [{ provide: ELEMENT_TOKEN, useValue: element }],
      parent: this.injector
    });
  }

}