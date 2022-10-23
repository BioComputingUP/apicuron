import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  links$: Observable<{ href: any[]; name: string; }[]>;

  constructor() { }

  @Input('resource') resource$: Observable<any>;

  

  ngOnInit(): void {

    this.links$ = this.resource$.pipe(
      map((resource) => {

        return [
          {
            href: ['/dashboard', 'database', resource.resource_id, 'edit'],
            name: 'Resource Update'
          },
          {
            href: ['/dashboard', 'database', resource.resource_id, 'reports'],
            name: 'Report Submission'
          }
        ]

      })
    )
  }

}
