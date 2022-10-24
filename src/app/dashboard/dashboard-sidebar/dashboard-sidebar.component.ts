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
      map(({ resource_name, resource_id}) => {

        return [
          {
            href: ['/dashboard', 'database', resource_id, 'edit'],
            name: `Update ${resource_name}`
          },
          {
            href: ['/dashboard', 'database', resource_id, 'terms'],
            name: `Manage ${resource_name} Terms`
          },
          {
            href: ['/dashboard', 'database', resource_id, 'reports'],
            name: 'Report Submission'
          }
        ]

      })
    )
  }

}
